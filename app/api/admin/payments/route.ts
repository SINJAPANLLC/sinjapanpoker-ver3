import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { paymentTransactions, withdrawalRequests, users } from '@/shared/schema';
import { desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    // 入金データ（Stripe決済）を取得
    const deposits = await db
      .select({
        id: paymentTransactions.id,
        userId: paymentTransactions.userId,
        username: paymentTransactions.username,
        type: paymentTransactions.type,
        amount: paymentTransactions.amount,
        stripeAmount: paymentTransactions.stripeAmount,
        currency: paymentTransactions.currency,
        status: paymentTransactions.status,
        method: paymentTransactions.method,
        description: paymentTransactions.description,
        createdAt: paymentTransactions.createdAt,
        completedAt: paymentTransactions.completedAt,
      })
      .from(paymentTransactions)
      .orderBy(desc(paymentTransactions.createdAt))
      .limit(100);

    // 出金データを取得
    const withdrawals = await db
      .select({
        id: withdrawalRequests.id,
        userId: withdrawalRequests.userId,
        username: withdrawalRequests.username,
        amount: withdrawalRequests.amount,
        method: withdrawalRequests.method,
        status: withdrawalRequests.status,
        createdAt: withdrawalRequests.createdAt,
        completedAt: withdrawalRequests.processedAt,
      })
      .from(withdrawalRequests)
      .orderBy(desc(withdrawalRequests.createdAt))
      .limit(100);

    // 統計を計算（Stripe決済は実際の通貨金額を使用）
    const completedDeposits = deposits.filter(d => d.status === 'completed');
    const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');
    const pendingDeposits = deposits.filter(d => d.status === 'pending');
    const pendingWithdrawals = withdrawals.filter(w => 
      w.status === 'pending' || w.status === 'approved' || w.status === 'processing'
    );

    const totalDeposits = completedDeposits.reduce((sum, d) => sum + (d.stripeAmount || d.amount), 0);
    const totalWithdrawals = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const pendingAmount = pendingDeposits.reduce((sum, d) => sum + (d.stripeAmount || d.amount), 0) +
                          pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    const stats = {
      totalDeposits,
      totalWithdrawals,
      netProfit: totalDeposits - totalWithdrawals,
      pendingCount: pendingDeposits.length + pendingWithdrawals.length,
      pendingAmount,
      completedDepositsCount: completedDeposits.length,
      completedWithdrawalsCount: completedWithdrawals.length,
    };

    return NextResponse.json({
      deposits,
      withdrawals,
      stats,
    });
  } catch (error) {
    console.error('決済データ取得エラー:', error);
    return NextResponse.json({ message: '決済データの取得に失敗しました' }, { status: 500 });
  }
}
