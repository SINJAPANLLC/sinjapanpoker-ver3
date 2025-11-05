import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { systemSettings } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    // システム設定を取得
    const settings = await db.select().from(systemSettings);

    // 設定が空の場合はデフォルト設定を作成
    if (settings.length === 0) {
      const defaultSettings = [
        // ゲーム設定
        {
          id: 'game_rake_percentage',
          category: 'game',
          name: 'レーキ率',
          description: 'テーブルゲームでのレーキ率（%）',
          value: 5,
          type: 'number' as const,
        },
        {
          id: 'tournament_fee_percentage',
          category: 'game',
          name: 'トーナメント手数料率',
          description: 'トーナメント参加時の手数料率（%）',
          value: 10,
          type: 'number' as const,
        },
        {
          id: 'max_players_per_table',
          category: 'game',
          name: 'テーブル最大人数',
          description: '1つのテーブルの最大プレイヤー数',
          value: 9,
          type: 'number' as const,
        },
        {
          id: 'auto_disconnect_timeout',
          category: 'game',
          name: '自動切断タイムアウト',
          description: 'プレイヤーの自動切断までの時間（分）',
          value: 15,
          type: 'number' as const,
        },
        // システム設定
        {
          id: 'maintenance_mode',
          category: 'system',
          name: 'メンテナンスモード',
          description: 'システムメンテナンス中のアクセス制限',
          value: false,
          type: 'boolean' as const,
        },
        {
          id: 'registration_enabled',
          category: 'system',
          name: '新規登録許可',
          description: '新規ユーザーの登録を許可する',
          value: true,
          type: 'boolean' as const,
        },
        {
          id: 'default_currency',
          category: 'system',
          name: 'デフォルト通貨',
          description: '新規ユーザーの初期通貨',
          value: 'JPY',
          type: 'select' as const,
          options: [
            { value: 'JPY', label: '日本円 (¥)' },
            { value: 'USD', label: '米ドル ($)' },
            { value: 'EUR', label: 'ユーロ (€)' }
          ],
        },
        {
          id: 'session_timeout',
          category: 'system',
          name: 'セッションタイムアウト',
          description: 'ユーザーセッションの有効期限（時間）',
          value: 24,
          type: 'number' as const,
        },
      ];

      // デフォルト設定を挿入
      await db.insert(systemSettings).values(defaultSettings);
      
      return NextResponse.json({ settings: defaultSettings });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('設定取得エラー:', error);
    return NextResponse.json({ message: 'システム設定の取得に失敗しました' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { settingId, value } = body;

    if (!settingId || value === undefined) {
      return NextResponse.json({ message: '設定IDと値が必要です' }, { status: 400 });
    }

    // 設定を更新
    const [updatedSetting] = await db
      .update(systemSettings)
      .set({
        value,
        updatedAt: new Date(),
        updatedBy: authResult.admin.userId,
      })
      .where(eq(systemSettings.id, settingId))
      .returning();

    if (!updatedSetting) {
      return NextResponse.json({ message: '設定が見つかりません' }, { status: 404 });
    }

    return NextResponse.json({
      message: '設定を更新しました',
      setting: updatedSetting,
    });
  } catch (error) {
    console.error('設定更新エラー:', error);
    return NextResponse.json({ message: '設定の更新に失敗しました' }, { status: 500 });
  }
}
