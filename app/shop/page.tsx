'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { Zap, Coins, Crown, ShoppingCart, BarChart3, User, MessageCircle, Gamepad2, Lock, AlertCircle, Loader } from 'lucide-react';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import ProtectedRoute from '@/components/ProtectedRoute';

function ShopContent() {
  const { currency, isRealMoneyMode } = useCurrencyStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('chips');
  const [isRealMoneyEnabled, setIsRealMoneyEnabled] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Adminがリアルマネーモードを有効にしているかチェック
  useEffect(() => {
    // 実際のアプリケーションでは、Admin APIからリアルマネーモードの状態を取得
    // ここではモックとしてlocalStorageから取得
    const realMoneyMode = localStorage.getItem('admin_real_money_mode');
    setIsRealMoneyEnabled(realMoneyMode === 'true');
    
    // localStorageの変更を監視
    const handleStorageChange = () => {
      const newMode = localStorage.getItem('admin_real_money_mode');
      setIsRealMoneyEnabled(newMode === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 定期的にチェック（同じタブ内での変更も検知）
    const interval = setInterval(() => {
      const currentMode = localStorage.getItem('admin_real_money_mode');
      if (currentMode !== (isRealMoneyEnabled ? 'true' : 'false')) {
        setIsRealMoneyEnabled(currentMode === 'true');
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isRealMoneyEnabled]);

  // 1チップ = 1円換算でチップパッケージを設定（ボーナスなし）
  const chipPackages = [
    { chips: 1000, price: 1000, popular: false }, // 1,000チップ = 1,000円
    { chips: 5000, price: 5000, popular: false }, // 5,000チップ = 5,000円
    { chips: 10000, price: 10000, popular: true }, // 10,000チップ = 10,000円
    { chips: 25000, price: 25000, popular: false }, // 25,000チップ = 25,000円
    { chips: 50000, price: 50000, popular: false }, // 50,000チップ = 50,000円
    { chips: 100000, price: 100000, popular: false } // 100,000チップ = 100,000円
  ];

  const handlePurchase = async (chips: number, price: number) => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    setProcessingPayment(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chips,
          price,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert('決済セッションの作成に失敗しました: ' + data.error);
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('決済処理中にエラーが発生しました');
      setProcessingPayment(false);
    }
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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src="/logo.png"
              alt="SIN JAPAN POKER"
              className="w-32 h-10 object-contain"
            />
            <h1 className="text-2xl font-bold text-gradient-blue">SHOP</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 glass px-3 py-2 rounded-full">
              <Zap className="text-yellow-400" />
              <span className="text-white font-semibold">{currency.energy}</span>
            </div>
            <div className="flex items-center space-x-2 glass px-3 py-2 rounded-full">
              <img src="/poker-chip.jpg" alt="Chips" className="w-6 h-6 rounded-full object-cover" />
              <span className="text-white font-semibold">{(currency?.realChips || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* バナー */}
      <div className="relative z-10 py-16 text-center animate-fade-in">
        <h1 className="text-6xl font-black text-gradient-blue mb-4 neon-glow">SHOP</h1>
        <p className="text-gray-400 text-xl">チップ購入とアイテム</p>
      </div>

      {/* タブ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-8">
        <div className="flex justify-center space-x-4 glass-strong rounded-2xl p-2">
          {[
            { id: 'chips', label: 'チップ購入' },
            { id: 'items', label: 'アイテム' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 pb-24">
        {activeTab === 'chips' && (
          <div className="max-w-4xl mx-auto">
            {/* チップ購入の説明（リアルマネーモード有効時のみ表示） */}
            {isRealMoneyEnabled && (
              <div className="card-blue mb-8 animate-fade-in">
                <div className="text-center">
                  <img src="/poker-chip.jpg" alt="Chips" className="w-16 h-16 rounded-full object-cover mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">チップ購入システム</h3>
                  <div className="text-gray-300 space-y-2 max-w-2xl mx-auto">
                    <p><span className="text-blue-400 font-semibold">1チップ = 1円</span>の換算でリアルマネーゲームに参加できます</p>
                    <p>購入したチップはキャッシュゲームやトーナメントで使用可能</p>
                    <p>練習モードでは無料のゲームチップをご利用いただけます</p>
                  </div>
                </div>
              </div>
            )}

            {/* チップパッケージ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
              {chipPackages.map((pkg, index) => (
                <div
                  key={index}
                  className={`card-blue hover-lift hover-glow relative ${pkg.popular ? 'ring-2 ring-blue-400' : ''} ${!isRealMoneyEnabled ? 'opacity-50' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 badge-primary px-6 py-1">
                      人気
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-yellow-500 ${!isRealMoneyEnabled ? 'opacity-50' : ''}`}>
                      <img src="/poker-chip.jpg" alt="Chips" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {pkg.chips.toLocaleString()}チップ
                    </h3>
                  </div>

                  <div className="mb-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      ¥{pkg.price.toLocaleString()}
                    </div>
                  </div>

                  {isRealMoneyEnabled ? (
                    <button 
                      onClick={() => handlePurchase(pkg.chips, pkg.price)}
                      disabled={processingPayment}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {processingPayment ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>処理中...</span>
                        </>
                      ) : (
                        <span>購入する</span>
                      )}
                    </button>
                  ) : (
                    <button 
                      className="w-full px-6 py-3 rounded-xl bg-gray-600 text-gray-400 cursor-not-allowed flex items-center justify-center space-x-2"
                      disabled
                    >
                      <Lock className="w-4 h-4" />
                      <span>購入不可</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


        {activeTab === 'items' && (
          <div className="text-center py-20 animate-fade-in">
            <FaStar className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-xl">アイテムは近日公開</p>
          </div>
        )}
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 p-6 z-20">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link href="/shop" prefetch={true} className="flex flex-col items-center space-y-1 text-blue-400 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
            </div>
            <span className="text-sm font-semibold">ショップ</span>
          </Link>
          <Link href="/forum" prefetch={true} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-blue-400 active:text-blue-500 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">フォーラム</span>
          </Link>
          <Link href="/lobby" prefetch={true} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-blue-400 active:text-blue-500 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">ロビー</span>
          </Link>
          <Link href="/career" prefetch={true} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-blue-400 active:text-blue-500 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">キャリア</span>
          </Link>
          <Link href="/profile" prefetch={true} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-blue-400 active:text-blue-500 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">プロフ</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function ShopPage() {
  return (
    <ProtectedRoute>
      <ShopContent />
    </ProtectedRoute>
  );
}