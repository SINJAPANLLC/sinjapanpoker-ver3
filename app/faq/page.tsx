'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: "アカウント登録はどのように行いますか？",
      answer: "トップページの「今すぐ始める」ボタンから登録ページに進み、必要事項を入力してください。メールアドレス、パスワード、氏名、生年月日、住所などの情報が必要です。登録後、本人確認書類の提出が必要になります。"
    },
    {
      question: "入金方法はどのようなものがありますか？",
      answer: "クレジットカード、デビットカード、銀行振込、電子マネー、仮想通貨など、複数の入金方法をご用意しています。入金は即座に反映され、すぐにゲームを開始できます。"
    },
    {
      question: "出金はどのくらい時間がかかりますか？",
      answer: "出金申請から実際の振込まで、通常1-3営業日程度かかります。初回出金の場合は本人確認が完了している必要があります。出金手数料については、利用規約をご確認ください。"
    },
    {
      question: "ボーナスやプロモーションはありますか？",
      answer: "新規登録ボーナス、入金ボーナス、リロードボーナスなど、様々なプロモーションをご用意しています。各ボーナスには出金条件（ロールオーバー）が設定されていますので、詳細はプロモーションページをご確認ください。"
    },
    {
      question: "ゲームの公平性はどのように保証されていますか？",
      answer: "当社は独立した第三者機関による認証を受けており、すべてのゲームは乱数生成器（RNG）を使用して公平性を保証しています。また、定期的な監査も実施しています。"
    },
    {
      question: "モバイルでもプレイできますか？",
      answer: "はい、スマートフォンやタブレットからもアクセス可能です。専用アプリは現在開発中ですが、ブラウザから快適にプレイできます。"
    },
    {
      question: "カスタマーサポートは日本語対応ですか？",
      answer: "はい、日本語でのカスタマーサポートを24時間365日提供しています。チャット、メール、電話でのお問い合わせが可能です。"
    },
    {
      question: "アカウントを削除したい場合はどうすればいいですか？",
      answer: "カスタマーサポートにお問い合わせください。アカウント削除前に残高の出金が必要な場合は、出金手続きを完了させてから削除処理を行います。"
    },
    {
      question: "プレイ時間や入金額の制限を設定できますか？",
      answer: "はい、責任あるゲーミングの一環として、プレイ時間制限、入金制限、セルフエクスクルージョンなどの機能をご利用いただけます。設定はアカウント設定ページから行えます。"
    },
    {
      question: "テーブル作成はどのように行いますか？",
      answer: "ロビーページから「テーブル作成」ボタンをクリックし、ブラインドレベル、最大プレイヤー数、テーブル名などを設定してテーブルを作成できます。作成したテーブルは他のプレイヤーが参加可能になります。"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ヘッダー */}
      <header className="relative z-10 glass border-b border-white/10 p-4 animate-slide-in-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-gradient-blue">よくある質問（FAQ）</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="card">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-white mb-8">よくある質問</h2>
            
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="border border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-4 text-left bg-gray-800 hover:bg-gray-700 transition-colors duration-200 flex justify-between items-center"
                  >
                    <span className="font-semibold text-white">{item.question}</span>
                    {openItems.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-blue-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-blue-400" />
                    )}
                  </button>
                  {openItems.includes(index) && (
                    <div className="px-6 py-4 bg-gray-900 border-t border-gray-600">
                      <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-4">まだ質問が解決しませんか？</h3>
              <p className="text-gray-300 mb-4">
                上記のFAQでお探しの情報が見つからない場合は、カスタマーサポートにお気軽にお問い合わせください。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/feedback"
                  className="btn-primary text-center px-6 py-3"
                >
                  お問い合わせフォーム
                </Link>
                <a
                  href="mailto:support@sinjapanpoker.com"
                  className="btn-secondary text-center px-6 py-3"
                >
                  メールで問い合わせ
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
