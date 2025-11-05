'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AMLPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ヘッダー */}
      <header className="relative z-10 glass border-b border-white/10 p-4 animate-slide-in-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-gradient-blue">AMLポリシー</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="card">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">アンチマネーロンダリング（AML）ポリシー</h2>
            
            <div className="space-y-6 text-gray-300">
              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">基本方針</h3>
                <p>
                  SIN JAPAN LIBERIA CO.,INC.（以下「当社」）は、リベリア共和国の法律及び金融活動作業部会（FATF）の国際基準に基づき、アンチマネーロンダリング（以下「AML」）及びテロ資金供与対策（CFT）体制を構築し、適切に管理運営することを基本方針とします。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">1. 法令遵守</h3>
                <p>
                  当社は、リベリア共和国の法律、FATF勧告、その他国際的なAML/CFT基準を遵守し、マネーロンダリング及びテロ資金供与の防止に努めます。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">2. 本人確認義務</h3>
                <p>
                  当社は、顧客との取引関係開始時及び取引時において、以下の本人確認を実施します。
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>氏名、住所、生年月日の確認</li>
                  <li>本人性の確認（運転免許証、パスポート等の公的身分証明書の提示）</li>
                  <li>職業、年収等の確認</li>
                  <li>取引目的の確認</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">3. 取引記録等の保存</h3>
                <p>
                  当社は、本人確認記録及び取引記録を法令で定められた期間保存します。
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>本人確認記録：取引関係終了時から7年間</li>
                  <li>取引記録：取引時から7年間</li>
                  <li>本人確認を行わなかった記録：取引時から7年間</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">4. 疑わしい取引の監視・報告</h3>
                <p>
                  当社は、以下のような疑わしい取引を監視し、必要に応じてリベリア共和国金融当局及び国際的な関係機関に報告します。
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>大額の現金取引</li>
                  <li>複数回に分けた小額取引（構造化取引）</li>
                  <li>取引目的が不明確な取引</li>
                  <li>短期間での大額の入出金</li>
                  <li>本人確認が困難な取引</li>
                  <li>その他法令で定める疑わしい取引</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">5. 制裁対象者等との取引禁止</h3>
                <p>
                  当社は、国連安全保障理事会、米国財務省外国資産管理局（OFAC）、その他国際的な制裁リストに掲載された個人・団体との取引を行いません。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">6. 内部管理体制</h3>
                <p>
                  当社は、AML体制の適切な運営のため、以下の体制を整備します。
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>AML責任者の設置</li>
                  <li>社内規則の整備</li>
                  <li>従業員教育の実施</li>
                  <li>内部監査の実施</li>
                  <li>システムの整備・運用</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">7. 教育・研修</h3>
                <p>
                  当社は、従業員に対し、AMLに関する教育・研修を定期的に実施し、法令遵守意識の向上を図ります。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">8. 継続的改善</h3>
                <p>
                  当社は、AML体制について、定期的に見直しを行い、継続的な改善に努めます。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">9. お問い合わせ窓口</h3>
                <p>
                  AMLポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
                </p>
                <div className="bg-gray-800 p-4 rounded-lg mt-4">
                  <p className="font-semibold">SIN JAPAN LIBERIA CO.,INC.</p>
                  <p>AML責任者</p>
                  <p>Email: aml@sinjapanpoker.com</p>
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
