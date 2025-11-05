'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function SelfExclusionPage() {
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
            <Shield className="w-12 h-12 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">セルフエクスクルージョン</h1>
          </div>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">セルフエクスクルージョンとは</h2>
              <p>
                セルフエクスクルージョンは、ギャンブルの問題を抱える方が、自主的にプレイを制限するための仕組みです。
                一定期間、または永久にアカウントへのアクセスを制限することができます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">利用方法</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>サポートチームに連絡して、セルフエクスクルージョンを申請します</li>
                <li>除外期間を選択します（6ヶ月、1年、永久など）</li>
                <li>申請が承認されると、選択した期間中はアカウントにアクセスできなくなります</li>
                <li>期間終了後も、自動的には再開されません。再度サポートに連絡する必要があります</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">注意事項</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>セルフエクスクルージョン期間中は、アカウントへのログインができません</li>
                <li>期間中の解除はできません</li>
                <li>資金の引き出しについては、サポートチームにお問い合わせください</li>
                <li>新しいアカウントの作成は禁止されています</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">サポート</h2>
              <p>
                ギャンブルに関する問題でお困りの場合は、専門機関にご相談ください：
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>ギャンブル依存症相談窓口: <a href="tel:0570-000-109" className="text-blue-400 hover:underline">0570-000-109</a></li>
                <li>精神保健福祉センター</li>
                <li>日本ギャンブラーズ・アノニマス (GA)</li>
              </ul>
            </section>

            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-center">
                セルフエクスクルージョンを申請される場合は、
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
