'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function ProblemGamblingPage() {
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
            <AlertTriangle className="w-12 h-12 text-yellow-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">ギャンブル依存対策</h1>
          </div>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">ギャンブル依存症とは</h2>
              <p>
                ギャンブル依存症は、ギャンブルに対するコントロールを失い、日常生活に支障をきたす状態です。
                本人だけでなく、家族や周囲の人々にも深刻な影響を及ぼす可能性があります。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">警告サイン</h2>
              <p className="mb-4">以下の症状に当てはまる場合は、専門家への相談をお勧めします：</p>
              <ul className="list-disc list-inside space-y-2">
                <li>ギャンブルに費やす時間とお金が増えている</li>
                <li>ギャンブルのことを常に考えている</li>
                <li>負けを取り戻そうとして更に賭け続ける</li>
                <li>ギャンブルをやめようとしてもやめられない</li>
                <li>ギャンブルのために嘘をつく</li>
                <li>家族や友人との関係が悪化している</li>
                <li>仕事や学業に支障が出ている</li>
                <li>借金をしてまでギャンブルをする</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">利用可能な対策</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><Link href="/deposit-limits" className="text-blue-400 hover:underline">入金制限の設定</Link></li>
                <li><Link href="/self-exclusion" className="text-blue-400 hover:underline">セルフエクスクルージョン</Link></li>
                <li><Link href="/cooling-off" className="text-blue-400 hover:underline">クーリングオフ期間の設定</Link></li>
                <li>プレイ時間の制限</li>
                <li>損失限度額の設定</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">相談窓口</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold text-white mb-2">消費者ホットライン（ギャンブル等依存症でお困りの皆様へ）</h3>
                  <p>電話番号: <a href="tel:0570-000-109" className="text-blue-400 hover:underline">0570-000-109</a></p>
                  <p className="text-sm text-gray-400">平日10:00～16:00（土日祝日、年末年始を除く）</p>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold text-white mb-2">各都道府県の精神保健福祉センター</h3>
                  <p>お住まいの地域の精神保健福祉センターにご相談ください</p>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold text-white mb-2">ギャンブラーズ・アノニマス（GA）日本</h3>
                  <p>ギャンブル依存症者の自助グループです</p>
                  <p>ウェブサイト: <a href="https://www.gajapan.jp" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.gajapan.jp</a></p>
                </div>
              </div>
            </section>

            <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-center font-bold">
                あなたは一人ではありません。専門家の助けを求めることは、問題解決への第一歩です。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
