'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ResponsibleGamingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ヘッダー */}
      <header className="relative z-10 glass border-b border-white/10 p-4 animate-slide-in-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-gradient-blue">責任あるゲーミング</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="card">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">責任あるゲーミング</h2>
            
            <div className="space-y-6 text-gray-300">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-blue-400 mb-2">🎯 責任あるゲーミングの重要性</h3>
                <p className="text-blue-200">
                  オンラインポーカーは楽しいエンターテインメントですが、責任を持ってプレイすることが重要です。
                </p>
              </div>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">健康的なゲーミングのためのガイドライン</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-3">✅ すべきこと</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• 失っても問題ない金額のみを使用</li>
                      <li>• プレイ時間を制限する</li>
                      <li>• 定期的に休憩を取る</li>
                      <li>• 感情的な状態でプレイしない</li>
                      <li>• 家族や友人と状況を共有する</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-400 mb-3">❌ してはいけないこと</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• 借金をしてプレイする</li>
                      <li>• 負けを埋め合わせようとする</li>
                      <li>• 嘘をついて隠す</li>
                      <li>• 長時間連続でプレイする</li>
                      <li>• 薬物やアルコールの影響下でプレイ</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">ギャンブル依存症の警告サイン</h3>
                <p>以下の症状がある場合は、注意が必要です：</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-400">行動面のサイン</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>プレイ時間や金額をコントロールできない</li>
                      <li>負けを隠そうとする</li>
                      <li>嘘をつくことが増える</li>
                      <li>仕事や学業に支障をきたす</li>
                      <li>家族や友人との関係が悪化</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-400">感情面のサイン</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>不安やイライラが増える</li>
                      <li>落ち込みや憂鬱感</li>
                      <li>罪悪感や恥ずかしさ</li>
                      <li>プレイ以外に興味を失う</li>
                      <li>絶望感や自殺念慮</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">当社の責任あるゲーミング機能</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-blue-400 mb-2">入金制限</h4>
                    <p className="text-sm">1日、週、月の入金上限を設定できます</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-blue-400 mb-2">プレイ時間制限</h4>
                    <p className="text-sm">プレイ時間の上限を設定し、自動的にログアウトされます</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-blue-400 mb-2">セルフエクスクルージョン</h4>
                    <p className="text-sm">一定期間、アカウントへのアクセスを制限できます</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">緊急時のサポート情報</h3>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-3">日本国内のサポート機関</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-white">24時間相談窓口</p>
                      <p className="text-lg font-bold text-blue-400">0570-066-000</p>
                      <p className="text-sm text-gray-400">ギャンブル依存症対策全国センター</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">オンライン相談</p>
                      <p className="text-sm text-gray-400">https://www.ncgg.go.jp/</p>
                      <p className="text-sm text-gray-400">国立研究開発法人 国立がん研究センター</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">家族・友人の方へ</h3>
                <p>大切な人がギャンブル問題を抱えている場合：</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>非難や批判ではなく、理解と支援を示す</li>
                  <li>専門家への相談を勧める</li>
                  <li>一人で抱え込まず、家族会などに参加する</li>
                  <li>本人の回復を信じて待つ</li>
                  <li>自分自身の心のケアも忘れない</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">お問い合わせ</h3>
                <p>
                  責任あるゲーミングに関するご質問やご相談は、下記までお気軽にお問い合わせください。
                </p>
                <div className="bg-gray-800 p-4 rounded-lg mt-4">
                  <p className="font-semibold">SIN JAPAN LIBERIA CO.,INC.</p>
                  <p>責任あるゲーミング担当</p>
                  <p>Email: responsible-gaming@sinjapanpoker.com</p>
                  <p>受付時間: 24時間（緊急時は即座に対応）</p>
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
