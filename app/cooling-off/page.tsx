'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function CoolingOffPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#1a0a0a] to-black">
      <header className="glass border-b border-white/10 p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gradient-blue">
            SIN JAPAN POKER
          </Link>
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ホームに戻る
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <Clock className="w-12 h-12 text-purple-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">クーリングオフ</h1>
          </div>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">クーリングオフとは</h2>
              <p>
                クーリングオフは、一時的にゲームプレイを休止するための機能です。
                短期間アカウントへのアクセスを制限し、冷静な判断を取り戻すための時間を提供します。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">利用可能な期間</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-purple-500/30">
                  <h3 className="font-bold text-white mb-2">24時間</h3>
                  <p className="text-sm">短期的な休憩に最適</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-purple-500/30">
                  <h3 className="font-bold text-white mb-2">7日間</h3>
                  <p className="text-sm">1週間の冷却期間</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-purple-500/30">
                  <h3 className="font-bold text-white mb-2">30日間</h3>
                  <p className="text-sm">1ヶ月の長期休憩</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-purple-500/30">
                  <h3 className="font-bold text-white mb-2">カスタム</h3>
                  <p className="text-sm">サポートにご相談ください</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">クーリングオフの設定方法</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <Link href="/settings" className="text-blue-400 hover:underline">アカウント設定</Link>
                  にアクセス
                </li>
                <li>「責任あるゲーミング」セクションを選択</li>
                <li>「クーリングオフ」を選択</li>
                <li>希望する期間を選択</li>
                <li>確認して適用</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">クーリングオフ期間中</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>アカウントへのログインができません</li>
                <li>入金・出金の処理はできません</li>
                <li>ゲームへの参加はできません</li>
                <li>プロモーションの受け取りはできません</li>
                <li>期間終了後、自動的に再開されます</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">セルフエクスクルージョンとの違い</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800/50">
                      <th className="border border-gray-700 p-3 text-left">機能</th>
                      <th className="border border-gray-700 p-3 text-left">クーリングオフ</th>
                      <th className="border border-gray-700 p-3 text-left">セルフエクスクルージョン</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-700 p-3">期間</td>
                      <td className="border border-gray-700 p-3">24時間～30日間</td>
                      <td className="border border-gray-700 p-3">6ヶ月～永久</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3">自動再開</td>
                      <td className="border border-gray-700 p-3">あり</td>
                      <td className="border border-gray-700 p-3">なし（要連絡）</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3">期間中の解除</td>
                      <td className="border border-gray-700 p-3">不可</td>
                      <td className="border border-gray-700 p-3">不可</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3">用途</td>
                      <td className="border border-gray-700 p-3">短期的な休憩</td>
                      <td className="border border-gray-700 p-3">長期的な制限</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">こんな時にご利用ください</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>連続して負けが続いている時</li>
                <li>感情的になっている時</li>
                <li>予定していた以上にプレイしてしまった時</li>
                <li>しばらくギャンブルから離れたい時</li>
                <li>冷静に状況を見直したい時</li>
              </ul>
            </section>

            <div className="mt-8 p-6 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-center">
                より長期的な制限が必要な場合は、
                <Link href="/self-exclusion" className="text-blue-400 hover:underline mx-1">セルフエクスクルージョン</Link>
                をご検討ください。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
