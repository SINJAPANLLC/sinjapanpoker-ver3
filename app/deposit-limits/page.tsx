'use client';

import Link from 'next/link';
import { DollarSign } from 'lucide-react';

export default function DepositLimitsPage() {
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
            <DollarSign className="w-12 h-12 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">入金制限</h1>
          </div>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">入金制限とは</h2>
              <p>
                入金制限は、ご自身の予算管理を支援するための機能です。
                日次、週次、月次の入金額に上限を設定することで、過度な支出を防ぐことができます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">設定可能な制限</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-blue-500/30">
                  <h3 className="font-bold text-white mb-2">日次制限</h3>
                  <p className="text-sm">1日あたりの入金上限額</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-blue-500/30">
                  <h3 className="font-bold text-white mb-2">週次制限</h3>
                  <p className="text-sm">1週間あたりの入金上限額</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-blue-500/30">
                  <h3 className="font-bold text-white mb-2">月次制限</h3>
                  <p className="text-sm">1ヶ月あたりの入金上限額</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">制限の設定方法</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <Link href="/settings" className="text-blue-400 hover:underline">アカウント設定</Link>
                  にアクセス
                </li>
                <li>「責任あるゲーミング」セクションを選択</li>
                <li>「入金制限」を選択</li>
                <li>希望する制限額と期間を設定</li>
                <li>変更内容を確認して保存</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">重要な注意事項</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>制限の引き上げ</strong>
                  <p className="ml-6 mt-1">
                    制限額の引き上げには24時間のクーリングオフ期間が適用されます。
                    この期間中は、引き上げをキャンセルすることができます。
                  </p>
                </li>
                <li>
                  <strong>制限の引き下げ</strong>
                  <p className="ml-6 mt-1">即座に適用されます。</p>
                </li>
                <li>
                  <strong>複数の制限</strong>
                  <p className="ml-6 mt-1">
                    複数の期間で制限を設定した場合、すべての制限が同時に適用されます。
                  </p>
                </li>
                <li>
                  <strong>制限の解除</strong>
                  <p className="ml-6 mt-1">
                    制限を完全に解除するには、7日間のクーリングオフ期間が必要です。
                  </p>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">推奨される制限額</h2>
              <p className="mb-4">
                以下は一般的なガイドラインです。ご自身の状況に応じて調整してください：
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>月収の5%以内に抑える</li>
                <li>生活必需品の支出を優先する</li>
                <li>損失しても生活に支障が出ない金額に設定する</li>
                <li>定期的に制限額を見直す</li>
              </ul>
            </section>

            <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-center">
                入金制限の設定は、
                <Link href="/settings" className="text-blue-400 hover:underline mx-1">アカウント設定</Link>
                からいつでも変更できます。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
