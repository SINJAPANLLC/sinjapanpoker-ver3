import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { kycVerifications } from '@/shared/schema';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let verifications;
    if (status && status !== 'all') {
      verifications = await db
        .select()
        .from(kycVerifications)
        .where(eq(kycVerifications.status, status as any))
        .orderBy(desc(kycVerifications.submittedAt));
    } else {
      verifications = await db
        .select()
        .from(kycVerifications)
        .orderBy(desc(kycVerifications.submittedAt));
    }

    return NextResponse.json({ verifications });
  } catch (error) {
    console.error('KYC取得エラー:', error);
    return NextResponse.json({ message: 'KYC情報の取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { kycId, action, reviewNotes } = await request.json();

    if (!kycId || !action) {
      return NextResponse.json({ message: 'KYC IDとアクションは必須です' }, { status: 400 });
    }

    const [verification] = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.id, kycId))
      .limit(1);

    if (!verification) {
      return NextResponse.json({ message: 'KYC申請が見つかりません' }, { status: 404 });
    }

    let newStatus: 'pending' | 'approved' | 'rejected';
    switch (action) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      default:
        return NextResponse.json({ message: '無効なアクションです' }, { status: 400 });
    }

    const updateData: any = {
      status: newStatus,
      reviewedAt: new Date(),
      reviewedBy: authResult.admin.username,
    };

    if (newStatus === 'rejected' && reviewNotes) {
      updateData.rejectionReason = reviewNotes;
    }

    const [updatedVerification] = await db
      .update(kycVerifications)
      .set(updateData)
      .where(eq(kycVerifications.id, kycId))
      .returning();

    return NextResponse.json({
      message: `KYC申請を${newStatus === 'approved' ? '承認' : '却下'}しました`,
      verification: updatedVerification,
    });
  } catch (error) {
    console.error('KYC処理エラー:', error);
    return NextResponse.json({ message: 'KYC処理に失敗しました' }, { status: 500 });
  }
}

