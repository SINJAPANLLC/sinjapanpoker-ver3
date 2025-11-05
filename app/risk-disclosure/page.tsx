'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RiskDisclosurePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ヘッダー */}
      <header className="relative z-10 glass border-b border-white/10 p-4 animate-slide-in-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-gradient-blue">リスク開示</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="card">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">リスク開示</h2>
            
            <div className="space-y-6 text-gray-300">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-red-400 mb-2">⚠️ 重要な注意事項</h3>
                <p className="text-red-200">
                  オンラインポーカーには重大なリスクが伴います。プレイ前に必ず以下の内容をご確認ください。
                </p>
              </div>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">1. 金銭的損失のリスク</h3>
                <p>
                  オンラインポーカーはギャンブルであり、必ず金銭的損失が発生する可能性があります。以下に注意してください：
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>投入した資金を全て失う可能性があります</li>
                  <li>過去の勝敗は将来の結果を保証しません</li>
                  <li>確実に勝つ方法は存在しません</li>
                  <li>経験豊富なプレイヤーでも損失を被る可能性があります</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">2. 依存症のリスク</h3>
                <p>
                  ギャンブルは依存症を引き起こす可能性があります。以下の症状がある場合は、プレイを停止し、専門家に相談してください：
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>負けを埋め合わせようとしてより多く賭ける</li>
                  <li>プレイ時間や金額をコントロールできない</li>
                  <li>家族や友人に嘘をつく</li>
                  <li>日常生活に支障をきたす</li>
                  <li>借金をしてでもプレイを続ける</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">3. 技術的リスク</h3>
                <p>
                  オンラインサービスには以下の技術的リスクがあります：
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>インターネット接続の不安定さ</li>
                  <li>サーバーの障害やメンテナンス</li>
                  <li>ソフトウェアのバグやエラー</li>
                  <li>サイバー攻撃やデータ漏洩</li>
                  <li>デバイスの故障や電源断</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">4. 法的リスク</h3>
                <p>
                  お住まいの地域の法律により、オンラインギャンブルが禁止されている場合があります：
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>居住地の法律を確認してください</li>
                  <li>違法な場合、法的責任を負う可能性があります</li>
                  <li>税務申告の義務がある場合があります</li>
                  <li>年齢制限を遵守してください</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">5. 心理的リスク</h3>
                <p>
                  ポーカーは心理的な影響を与える可能性があります：
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>ストレスや不安の増大</li>
                  <li>感情的な判断ミス</li>
                  <li>睡眠障害や食欲不振</li>
                  <li>人間関係への悪影響</li>
                  <li>自尊心の低下</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">6. 責任あるゲーミング</h3>
                <p>
                  安全にプレイするために、以下の対策を講じることをお勧めします：
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>プレイ時間と金額の制限を設定する</li>
                  <li>失っても問題のない金額のみを投入する</li>
                  <li>負けている時のプレイを避ける</li>
                  <li>定期的に休憩を取る</li>
                  <li>家族や友人とプレイ状況を共有する</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">7. 免責事項</h3>
                <p>
                  当社は、ユーザーの損失、損害、またはその他の問題について一切の責任を負いません。プレイは自己責任で行ってください。
                </p>
              </section>

              <div className="mt-8 pt-6 border-t border-gray-600">
                <p className="text-sm text-gray-400">
                  制定日：2024年1月1日<br />
                  最終更新日：2024年1月1日
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
