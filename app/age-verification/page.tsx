'use client';

import Link from 'next/link';
import { UserCheck } from 'lucide-react';

export default function AgeVerificationPage() {
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
            <UserCheck className="w-12 h-12 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">年齢確認・未成年保護</h1>
          </div>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">18歳未満の利用禁止</h2>
              <p>
                SIN JAPAN POKERは、18歳未満の方のご利用を固く禁じています。
                これは法令遵守と未成年者保護のための重要な方針です。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">年齢確認プロセス</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong>アカウント登録時</strong>
                  <p className="ml-6 mt-1">生年月日の入力が必須となります</p>
                </li>
                <li>
                  <strong>本人確認（KYC）</strong>
                  <p className="ml-6 mt-1">
                    出金時には、以下のいずれかの公的身分証明書による年齢確認が必要です：
                  </p>
                  <ul className="ml-10 mt-2 list-disc space-y-1">
                    <li>運転免許証</li>
                    <li>パスポート</li>
                    <li>マイナンバーカード</li>
                    <li>住民基本台帳カード</li>
                  </ul>
                </li>
                <li>
                  <strong>継続的なモニタリング</strong>
                  <p className="ml-6 mt-1">システムによる継続的な監視を実施しています</p>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">未成年者発見時の対応</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>アカウントの即時停止</li>
                <li>すべての入金の返金</li>
                <li>保護者への通知（必要に応じて）</li>
                <li>関係当局への報告（法令で要求される場合）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">保護者の方へ</h2>
              <p className="mb-4">
                お子様がオンラインギャンブルにアクセスしないよう、以下の対策をお勧めします：
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>ペアレンタルコントロールソフトウェアの使用</li>
                <li>インターネット利用の監督</li>
                <li>クレジットカード情報の適切な管理</li>
                <li>ギャンブルの危険性についての教育</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">推奨ソフトウェア</h2>
              <div className="space-y-3">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold text-white">Net Nanny</h3>
                  <p className="text-sm">包括的なペアレンタルコントロール機能</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold text-white">Qustodio</h3>
                  <p className="text-sm">クロスプラットフォーム対応の監視ツール</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold text-white">Norton Family</h3>
                  <p className="text-sm">ウェブフィルタリングと時間管理</p>
                </div>
              </div>
            </section>

            <div className="mt-8 p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-center font-bold text-red-400">
                未成年者のギャンブル利用を発見された場合は、直ちに
                <Link href="/feedback" className="text-blue-400 hover:underline mx-1">サポートチーム</Link>
                までご連絡ください。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
