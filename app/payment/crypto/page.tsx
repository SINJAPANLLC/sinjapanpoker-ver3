'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaBitcoin, FaEthereum, FaCopy, FaCheckCircle, FaClock } from 'react-icons/fa';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';
import { Lock, AlertCircle } from 'lucide-react';

function CryptoPaymentContent() {
  const { user } = useAuthStore();
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [amount, setAmount] = useState(1000);
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isAdmin = user?.isAdmin || false;

  const cryptos = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: <FaBitcoin className="text-4xl text-orange-500" />, rate: 0.000023 },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: <FaEthereum className="text-4xl text-blue-400" />, rate: 0.00042 },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: <div className="text-4xl">💵</div>, rate: 1.0 }
  ];

  const selectedCurrency = cryptos.find(c => c.id === selectedCrypto)!;
  const cryptoAmount = (amount * selectedCurrency.rate).toFixed(8);
  const mockAddress = selectedCrypto === 'btc' ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' :
                       selectedCrypto === 'eth' ? '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' :
                       'TQN9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE';

  const handleCopy = () => {
    navigator.clipboard.writeText(mockAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreatePayment = () => {
    setPaymentCreated(true);
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
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gradient-blue">仮想通貨決済</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* 管理者限定警告 */}
        {!isAdmin && (
          <div className="card mb-8 animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-4">
                <Lock className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-blue-400 mb-4">管理者限定機能</h2>
              <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
                仮想通貨決済機能は管理者のみが利用できます。<br />
                ポイントチャージは管理者から直接行われます。
              </p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">ポイントが必要な場合は管理者にお問い合わせください</span>
              </div>
              <Link href="/purchase" className="btn-primary mt-6 inline-block">
                購入ページに戻る
              </Link>
            </div>
          </div>
        )}
        
        {isAdmin && !paymentCreated ? (
          <>
            {/* 金額入力 */}
            <div className="card mb-8 animate-scale-in">
              <h2 className="text-2xl font-bold text-white mb-6">チャージ金額</h2>
              
              <div className="mb-6">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  min="100"
                  step="100"
                  className="text-4xl text-center font-bold"
                  placeholder="1000"
                />
                <div className="text-center text-gray-400 mt-2">円</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1000, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className="btn-secondary"
                  >
                    ¥{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* 仮想通貨選択 */}
            <div className="card mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-2xl font-bold text-white mb-6">仮想通貨を選択</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cryptos.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => setSelectedCrypto(crypto.id)}
                    className={`card-blue hover-lift p-6 text-center transition-all ${
                      selectedCrypto === crypto.id ? 'ring-2 ring-blue-400' : ''
                    }`}
                  >
                    {crypto.icon}
                    <div className="text-xl font-bold text-white mt-3">{crypto.name}</div>
                    <div className="text-gray-400 text-sm">{crypto.symbol}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 glass-strong rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">支払額</span>
                  <span className="text-2xl font-bold text-gradient-blue">
                    {cryptoAmount} {selectedCurrency.symbol}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreatePayment}
              disabled={amount < 100}
              className="btn-primary w-full text-xl py-4 animate-pulse-slow"
            >
              支払いを作成
            </button>
          </>
        ) : isAdmin ? (
          <div className="card text-center animate-scale-in">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-700 flex items-center justify-center animate-glow">
                <FaClock className="text-5xl text-white animate-spin-slow" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">入金待ち</h2>
              <p className="text-gray-400 mb-2">以下のアドレスに送金してください</p>
              <p className="text-sm text-gray-500">ネットワーク確認後、自動的にチャージされます</p>
            </div>

            <div className="glass-strong rounded-xl p-6 mb-6">
              <div className="text-gray-400 text-sm mb-2">送金先アドレス</div>
              <div className="bg-black/50 rounded-lg p-4 mb-4 break-all font-mono text-sm text-white">
                {mockAddress}
              </div>
              <button
                onClick={handleCopy}
                className="btn-secondary w-full flex items-center justify-center space-x-2"
              >
                {copied ? <FaCheckCircle /> : <FaCopy />}
                <span>{copied ? 'コピー完了' : 'アドレスをコピー'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="glass-strong rounded-xl p-4">
                <div className="text-gray-400 mb-1">送金額</div>
                <div className="text-white font-bold">{cryptoAmount} {selectedCurrency.symbol}</div>
              </div>
              <div className="glass-strong rounded-xl p-4">
                <div className="text-gray-400 mb-1">チャージ額</div>
                <div className="text-white font-bold">¥{amount.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <div className="text-yellow-400 text-sm">
                ⚠️ 送金確認には5-30分かかる場合があります
              </div>
            </div>

            <Link href="/transactions" className="btn-secondary w-full">
              取引履歴を確認
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function CryptoPaymentPage() {
  return (
    <ProtectedRoute>
      <CryptoPaymentContent />
    </ProtectedRoute>
  );
}
