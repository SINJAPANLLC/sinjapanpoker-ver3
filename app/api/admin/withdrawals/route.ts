import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { withdrawalRequests, users } from '@shared/schema';
import { eq, desc, or, and, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured');
}

function requireAdminAuth(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; email: string; role?: string };
    
    if (decoded.role !== 'admin') {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const adminId = requireAdminAuth(req);
  
  if (!adminId) {
    return NextResponse.json({ message: '管理者権限が必要です' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    let withdrawals;
    
    if (status && status !== 'all') {
      withdrawals = await db.select()
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.status, status as any))
        .orderBy(desc(withdrawalRequests.submittedAt));
    } else {
      withdrawals = await db.select()
        .from(withdrawalRequests)
        .orderBy(desc(withdrawalRequests.submittedAt));
    }

    return NextResponse.json({
      success: true,
      withdrawals
    });
  } catch (error) {
    console.error('出金申請取得エラー:', error);
    return NextResponse.json({ message: '出金申請の取得中にエラーが発生しました' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminId = requireAdminAuth(req);
  
  if (!adminId) {
    return NextResponse.json({ message: '管理者権限が必要です' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { withdrawalId, action, adminNotes } = body;

    if (!withdrawalId || !action) {
      return NextResponse.json({ message: '必要な情報が不足しています' }, { status: 400 });
    }

    if (!['approve', 'reject', 'process', 'complete'].includes(action)) {
      return NextResponse.json({ message: '無効なアクションです' }, { status: 400 });
    }

    const [withdrawal] = await db.select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, withdrawalId))
      .limit(1);

    if (!withdrawal) {
      return NextResponse.json({ message: '出金申請が見つかりません' }, { status: 404 });
    }

    // 状態遷移の検証
    const currentStatus = withdrawal.status;
    let newStatus: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
    let shouldDeductChips = false;
    let shouldRefundChips = false;

    switch (action) {
      case 'approve':
        if (currentStatus !== 'pending') {
          return NextResponse.json({ message: '承認できるのはpending状態の申請のみです' }, { status: 400 });
        }
        newStatus = 'approved';
        break;
      case 'reject':
        if (currentStatus === 'completed' || currentStatus === 'rejected') {
          return NextResponse.json({ message: 'この申請は既に処理済みです' }, { status: 400 });
        }
        // processing状態から拒否する場合は返金
        if (currentStatus === 'processing') {
          shouldRefundChips = true;
        }
        newStatus = 'rejected';
        break;
      case 'process':
        if (currentStatus !== 'approved') {
          return NextResponse.json({ message: '処理できるのはapproved状態の申請のみです' }, { status: 400 });
        }
        newStatus = 'processing';
        shouldDeductChips = true;
        break;
      case 'complete':
        if (currentStatus !== 'processing') {
          return NextResponse.json({ message: '完了できるのはprocessing状態の申請のみです' }, { status: 400 });
        }
        newStatus = 'completed';
        break;
      default:
        return NextResponse.json({ message: '無効なアクションです' }, { status: 400 });
    }

    // 並行アクセスエラー用のフラグ（catchブロックでアクセスするためtryの外で宣言）
    let isConflict = false;
    let conflictMessage = '';

    try {
      // トランザクション内で残高の更新と出金申請の更新を実行
      const updatedWithdrawal = await db.transaction(async (tx) => {
        // 楽観的ロック：現在のステータスと一致する場合のみ更新（並行処理防止）
        const result = await tx.update(withdrawalRequests)
        .set({
          status: newStatus,
          adminNotes: adminNotes || withdrawal.adminNotes,
          processedBy: adminId,
          processedAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(withdrawalRequests.id, withdrawalId),
            eq(withdrawalRequests.status, currentStatus)
          )
        )
        .returning();

      // 並行処理の検出：更新された行がない場合は他のトランザクションが既に処理済み
      if (result.length === 0) {
        isConflict = true;
        conflictMessage = 'この出金申請は既に別の処理が実行されています。ページを更新してください。';
        throw new Error('CONFLICT');
      }

      const currentWithdrawal = result[0];

      if (shouldDeductChips) {
        const [user] = await tx.select()
          .from(users)
          .where(eq(users.id, withdrawal.userId))
          .limit(1);

        if (!user) {
          throw new Error('ユーザーが見つかりません');
        }

        if (user.realChips < withdrawal.amount) {
          throw new Error('ユーザーの残高が不足しています');
        }

        await tx.update(users)
          .set({
            realChips: user.realChips - withdrawal.amount
          })
          .where(eq(users.id, withdrawal.userId));
      }

      if (shouldRefundChips) {
        const [user] = await tx.select()
          .from(users)
          .where(eq(users.id, withdrawal.userId))
          .limit(1);

        if (!user) {
          throw new Error('ユーザーが見つかりません');
        }

        await tx.update(users)
          .set({
            realChips: user.realChips + withdrawal.amount
          })
          .where(eq(users.id, withdrawal.userId));
      }

        return currentWithdrawal;
      });

      return NextResponse.json({
        success: true,
        message: `出金申請が${
          action === 'approve' ? '承認' :
          action === 'reject' ? '拒否' :
          action === 'process' ? '処理開始' :
          '完了'
        }されました`,
        withdrawal: updatedWithdrawal
      });
    } catch (error: any) {
      console.error('出金申請処理エラー:', error);
      
      // 並行アクセスの検出
      if (error?.message === 'CONFLICT' && isConflict) {
      return NextResponse.json({ 
        message: conflictMessage 
      }, { status: 409 });
    }
    
      // 既知の業務エラーメッセージのリスト
      const knownBusinessErrors = [
      'ユーザーが見つかりません',
      'ユーザーの残高が不足しています',
      '承認できるのはpending状態の申請のみです',
      'この申請は既に処理済みです',
      '処理できるのはapproved状態の申請のみです',
      '完了できるのはprocessing状態の申請のみです'
    ];
    
      // 業務エラーの場合は400を返す
      if (error?.message && knownBusinessErrors.includes(error.message)) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
      
      // その他のシステムエラーは500を返す
      return NextResponse.json({ message: '出金申請の処理中にエラーが発生しました' }, { status: 500 });
    }
  } catch (error) {
    console.error('出金申請処理エラー（予期しないエラー）:', error);
    return NextResponse.json({ message: '出金申請の処理中にエラーが発生しました' }, { status: 500 });
  }
}
