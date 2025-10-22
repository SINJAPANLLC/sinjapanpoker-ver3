'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Lock, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';

function CardPaymentContent() {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState(1000);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  
  const isAdmin = user?.isAdmin || false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('この機能は管理者のみが利用できます');
      return;
    }
    // 決済処理（実際の実装ではStripe等のAPIを使用）
    alert('クレジットカード決済機能は準備中です');
  };

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-4 animate-slide-in-down">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/purchase" className="text-blue-400 hover:text-cyan-300">
            <ArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gradient-blue">クレジットカード決済</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* 管理者限定警告 */}
        {!isAdmin && (
          <div className="card mb-8 animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-4">
                <Lock className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-blue-400 mb-4">管理者限定機能</h2>
              <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
                クレジットカード決済機能は管理者のみが利用できます。
              </p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg mb-6">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">ポイントが必要な場合は管理者にお問い合わせください</span>
              </div>
              <Link href="/purchase" className="btn-primary inline-block">
                購入ページに戻る
              </Link>
            </div>
          </div>
        )}

        {/* 準備中メッセージ */}
        {isAdmin && (
          <div className="card animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-500/20 rounded-full mb-4">
                <CreditCard className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">クレジットカード決済</h2>
              <p className="text-gray-400 mb-6">
                クレジットカード決済機能は現在準備中です。<br />
                しばらくお待ちください。
              </p>
              
              {/* プレビュー用フォーム（無効化） */}
              <form onSubmit={handleSubmit} className="space-y-6 text-left opacity-50 pointer-events-none">
                <div>
                  <label className="block text-white font-semibold mb-2">チャージ金額（円）</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">カード番号</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">有効期限</label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      disabled
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      disabled
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">カード名義</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="TARO YAMADA"
                  />
                </div>

                <button
                  type="submit"
                  disabled
                  className="w-full btn-primary py-4 text-lg"
                >
                  支払う
                </button>
              </form>

              <div className="mt-8">
                <Link href="/purchase" className="btn-secondary inline-block">
                  購入ページに戻る
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CardPaymentPage() {
  return (
    <ProtectedRoute>
      <CardPaymentContent />
    </ProtectedRoute>
  );
}

