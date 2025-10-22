'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfUsePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ヘッダー */}
      <header className="relative z-10 glass border-b border-white/10 p-4 animate-slide-in-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-gradient-blue">利用条件</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="card">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">利用条件</h2>
            
            <div className="space-y-6 text-gray-300">
              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">サービス利用条件</h3>
                <p>
                  本利用条件（以下「本条件」）は、SIN JAPAN LIBERIA CO.,INC.（以下「当社」）が提供するオンラインポーカーサービス（以下「本サービス」）の利用に関する詳細条件を定めるものです。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">1. アカウント登録</h3>
                <p>本サービスを利用するには、以下の条件を満たす必要があります：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>18歳以上であること（一部地域では21歳以上）</li>
                  <li>正確で最新の情報を提供すること</li>
                  <li>一人につき一つのアカウントのみ作成可能</li>
                  <li>代理での登録は禁止</li>
                  <li>居住地の法律に従うこと</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">2. 入金・出金</h3>
                <p>入金・出金に関する条件：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>本人名義の決済手段のみ使用可能</li>
                  <li>出金は本人確認完了後のみ可能</li>
                  <li>入金制限を設定可能</li>
                  <li>出金手数料が発生する場合があります</li>
                  <li>出金には処理時間が必要です</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">3. ゲームプレイ</h3>
                <p>ゲームプレイに関する条件：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>フェアプレイの遵守</li>
                  <li>チート行為の禁止</li>
                  <li>複数アカウントでの協力プレイ禁止</li>
                  <li>ボット使用の禁止</li>
                  <li>他人のアカウント使用禁止</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">4. プロモーション・ボーナス</h3>
                <p>プロモーション・ボーナスに関する条件：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>利用規約に従った利用が必要</li>
                  <li>出金条件（ロールオーバー）の適用</li>
                  <li>重複参加の禁止</li>
                  <li>不正取得の禁止</li>
                  <li>当社の判断による変更・終了の可能性</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">5. アカウント停止・終了</h3>
                <p>以下の場合、アカウントが停止・終了される可能性があります：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>利用規約違反</li>
                  <li>不正行為の疑い</li>
                  <li>年齢確認の失敗</li>
                  <li>本人確認書類の不備</li>
                  <li>法的問題の発生</li>
                  <li>長期の非利用</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">6. 責任の制限</h3>
                <p>
                  当社は、以下の場合について責任を負いません：
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>技術的障害による損失</li>
                  <li>インターネット接続の問題</li>
                  <li>ユーザーの操作ミス</li>
                  <li>第三者による不正アクセス</li>
                  <li>不可抗力によるサービスの停止</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">7. 知的財産権</h3>
                <p>
                  本サービスの全てのコンテンツ、ソフトウェア、商標は当社または第三者に帰属します。無断での複製、配布、改変は禁止されています。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">8. 紛争解決</h3>
                <p>
                  本条件に関する紛争は、当社の本社所在地を管轄する裁判所を専属的合意管轄とします。日本法が準拠法となります。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">9. 条件の変更</h3>
                <p>
                  当社は、必要に応じて本条件を変更することがあります。変更は、本サービス上での通知により効力を生じます。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">10. お問い合わせ</h3>
                <p>
                  本条件に関するお問い合わせは、下記までご連絡ください。
                </p>
                <div className="bg-gray-800 p-4 rounded-lg mt-4">
                  <p className="font-semibold">SIN JAPAN LIBERIA CO.,INC.</p>
                  <p>Email: legal@sinjapanpoker.com</p>
                  <p>受付時間: 平日 9:00-18:00（日本時間）</p>
                </div>
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
