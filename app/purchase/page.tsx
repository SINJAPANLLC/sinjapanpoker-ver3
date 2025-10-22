'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Coins, Zap, CreditCard, Bitcoin, Lock, AlertCircle } from 'lucide-react';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useSystemStore } from '@/store/useSystemStore';
import { useAuthStore } from '@/store/useAuthStore';
import ProtectedRoute from '@/components/ProtectedRoute';

function PurchaseContent() {
  const { user } = useAuthStore();
  const { currency, addPoints, addCurrency, isRealMoneyMode } = useCurrencyStore();
  const { isRealMoneyEnabled } = useSystemStore();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  
  const realMoneyEnabled = isRealMoneyEnabled();
  const isAdmin = user?.isAdmin || false;

  const packages = [
    { id: 'starter', chips: 10000, price: 1000, bonus: 1000 },
    { id: 'popular', chips: 50000, price: 4500, bonus: 7500, popular: true },
    { id: 'premium', chips: 100000, price: 8000, bonus: 20000 },
    { id: 'ultimate', chips: 500000, price: 35000, bonus: 150000 }
  ];

  const handlePurchase = (pkg: typeof packages[0]) => {
    if (!realMoneyEnabled) {
      alert('リアルマネーモードが有効になっていません。管理者にお問い合わせください。');
      return;
    }
    
    if (currency.points < pkg.price) {
      alert('ポイントが不足しています');
      return;
    }
    
    if (currency.points >= pkg.price) {
      addCurrency('realChips', pkg.chips + pkg.bonus, `チップパッケージ購入 (${pkg.price}ポイント)`);
      addCurrency('points', -pkg.price, `チップパッケージ購入`);
      alert(`${(pkg.chips + pkg.bonus).toLocaleString()}チップを購入しました！`);
    } else {
      alert('ポイントが不足しています');
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/shop" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-gradient-blue">チップ購入</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="glass px-4 py-2 rounded-full">
              <span className="text-gray-400 text-sm mr-2">ポイント</span>
              <span className="text-white font-bold">{(currency?.points || 0).toLocaleString()}円</span>
            </div>
            <div className="glass px-4 py-2 rounded-full">
              <Coins className="text-yellow-500 inline mr-2" />
              <span className="text-white font-bold">{(currency?.realChips || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* 管理者限定警告 */}
        {!isAdmin && (
          <div className="glass-card p-6 md:p-8 rounded-xl border-2 border-blue-500/30 bg-blue-500/5 mb-8 animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-4">
                <Lock className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-blue-400 mb-4">管理者限定機能</h2>
              <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
                チップの購入機能は管理者のみが利用できます。<br />
                チップは管理者から直接付与されます。
              </p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">チップが必要な場合は管理者にお問い合わせください</span>
              </div>
            </div>
          </div>
        )}

        {/* リアルマネーモード警告 */}
        {isAdmin && !realMoneyEnabled && (
          <div className="glass-card p-6 md:p-8 rounded-xl border-2 border-yellow-500/30 bg-yellow-500/5 mb-8 animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full mb-4">
                <Lock className="w-10 h-10 text-yellow-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4">リアルマネーモード：無効</h2>
              <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
                現在、チップの購入機能は無効になっています。<br />
                チップは管理者から直接付与されます。
              </p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">リアルマネーモードが有効になるまでお待ちください</span>
              </div>
            </div>
          </div>
        )}

        {/* 決済方法選択 */}
        {isAdmin && realMoneyEnabled && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">チャージ方法を選択</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/payment/crypto" className="card hover-lift p-8 text-center transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                  <Bitcoin className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">仮想通貨決済</h3>
                <p className="text-gray-400 text-sm mb-4">BTC, ETH, USDT, USDC, LTC対応</p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 rounded-lg">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-semibold">即時反映</span>
                </div>
              </Link>

              <Link href="/payment/card" className="card hover-lift p-8 text-center transition-all opacity-50 cursor-not-allowed pointer-events-none">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                  <CreditCard className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">クレジットカード</h3>
                <p className="text-gray-400 text-sm mb-4">準備中</p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-500/20 rounded-lg">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 font-semibold">近日公開</span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* ポイントチャージ */}
        {isAdmin && realMoneyEnabled && (
          <div className="card mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <CreditCard className="text-blue-400" />
              <span>ポイントチャージ</span>
            </h2>
            <p className="text-gray-400 mb-6">1ポイント = 1円</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[100, 500, 1000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => addPoints(amount, 'ポイントチャージ')}
                  className="card-blue hover-lift hover-glow p-6 text-center"
                >
                  <div className="text-3xl font-bold text-gradient-blue mb-2">
                    {amount}
                  </div>
                  <div className="text-gray-400 text-sm">ポイント</div>
                  <div className="text-white text-lg font-semibold mt-2">
                    ¥{amount.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* チップパッケージ */}
        {isAdmin && realMoneyEnabled && (
          <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-bold text-white mb-6 text-center">チップパッケージ</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`card-blue hover-lift hover-glow relative ${
                  pkg.popular ? 'ring-2 ring-blue-400' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 badge-primary px-6 py-1">
                    人気 No.1
                  </div>
                )}

                <div className="text-center mb-6">
                  <Coins className="text-6xl text-yellow-500 mx-auto mb-4 animate-float" />
                  <div className="text-4xl font-bold text-gradient-blue mb-2">
                    {pkg.chips.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">チップ</div>
                </div>

                {pkg.bonus > 0 && (
                  <div className="bg-blue-500/20 border border-blue-500/40 rounded-xl p-3 mb-4">
                    <div className="text-blue-400 font-bold text-center">
                      +{pkg.bonus.toLocaleString()} ボーナス
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-white mb-1">
                    {pkg.price.toLocaleString()}円
                  </div>
                  <div className="text-gray-500 text-sm">
                    {pkg.price.toLocaleString()}ポイント
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={currency.points < pkg.price}
                  className="btn-primary w-full"
                >
                  {currency.points >= pkg.price ? '購入' : 'ポイント不足'}
                </button>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* 決済方法 */}
        {isAdmin && (
          <div className="card mt-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">決済方法</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/payment/crypto" className="glass-blue hover-lift hover-glow p-6 text-center">
              <Bitcoin className="text-5xl text-yellow-500 mx-auto mb-3" />
              <div className="text-white font-semibold">仮想通貨</div>
              <div className="text-gray-400 text-sm mt-1">BTC / USDT / ETH</div>
            </Link>

            <Link href="/payment/card" className="glass hover-lift p-6 text-center opacity-50 cursor-not-allowed">
              <CreditCard className="text-5xl text-gray-500 mx-auto mb-3" />
              <div className="text-gray-400 font-semibold">クレジットカード</div>
              <div className="text-gray-500 text-sm mt-1">準備中</div>
            </Link>

            <Link href="/payment/bank" className="glass hover-lift p-6 text-center opacity-50 cursor-not-allowed">
              <div className="text-5xl mx-auto mb-3">🏦</div>
              <div className="text-gray-400 font-semibold">銀行振込</div>
              <div className="text-gray-500 text-sm mt-1">準備中</div>
            </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PurchasePage() {
  return (
    <ProtectedRoute>
      <PurchaseContent />
    </ProtectedRoute>
  );
}