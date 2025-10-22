'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, Copy, Check, Loader, ExternalLink, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';
import Image from 'next/image';

type CryptoCurrency = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'LTC';

interface Invoice {
  id: string;
  amount: number;
  currency: CryptoCurrency;
  address: string;
  qrCodeUrl: string;
  expiresAt: string;
  requiredConfirmations: number;
  chipAmount: number;
}

interface InvoiceStatus {
  status: 'pending' | 'confirming' | 'completed' | 'expired' | 'failed';
  confirmations: number;
  requiredConfirmations: number;
  txHash?: string;
}

const CRYPTO_INFO = {
  BTC: { name: 'Bitcoin', icon: '₿', color: 'orange' },
  ETH: { name: 'Ethereum', icon: 'Ξ', color: 'purple' },
  USDT: { name: 'Tether', icon: '₮', color: 'green' },
  USDC: { name: 'USD Coin', icon: '$', color: 'blue' },
  LTC: { name: 'Litecoin', icon: 'Ł', color: 'gray' },
};

function CryptoPaymentContent() {
  const { user } = useAuthStore();
  const [chipAmount, setChipAmount] = useState(1000);
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>('USDT');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rates, setRates] = useState<any>(null);

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    if (invoice) {
      const interval = setInterval(() => {
        checkInvoiceStatus(invoice.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [invoice]);

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('/api/payment/crypto/rates');
      const data = await response.json();
      if (data.success) {
        setRates(data.rates);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    }
  };

  const createInvoice = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/payment/crypto/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chipAmount,
          currency: selectedCurrency,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setInvoice(data.invoice);
      } else {
        alert(data.message || 'インボイスの作成に失敗しました');
      }
    } catch (error) {
      console.error('Invoice creation error:', error);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const checkInvoiceStatus = async (invoiceId: string) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`/api/payment/crypto/check-status?invoiceId=${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setInvoiceStatus(data.invoice);
        
        if (data.invoice.status === 'completed') {
          alert('入金が完了しました！チップが付与されました。');
          setInvoice(null);
          setInvoiceStatus(null);
        }
      }
    } catch (error) {
      console.error('Invoice status check error:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCryptoAmount = () => {
    if (!rates) return 0;
    const rate = rates.find((r: any) => r.currency === selectedCurrency);
    if (!rate) return 0;
    return (chipAmount * 1) / rate.usdRate;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'confirming': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'expired': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '入金待ち';
      case 'confirming': return '確認中';
      case 'completed': return '完了';
      case 'expired': return '期限切れ';
      default: return status;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
      </div>

      <header className="relative z-10 glass-strong border-b border-white/10 p-4 animate-slide-in-down">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/purchase" className="text-purple-400 hover:text-blue-300">
            <ArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gradient-purple">仮想通貨決済</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {!invoice ? (
          <div className="card animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-full mb-4">
                <Wallet className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-2">仮想通貨でチップを購入</h2>
              <p className="text-gray-400">BTC、ETH、USDT、USDC、LTCに対応</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">購入チップ数</label>
                <input
                  type="number"
                  value={chipAmount}
                  onChange={(e) => setChipAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-gray-800/50 text-white rounded-lg border border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="1000"
                  min="100"
                  step="100"
                />
                <p className="text-gray-400 text-sm mt-2">最小: 100チップ (1チップ = 1 USD)</p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">支払い通貨</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(CRYPTO_INFO).map(([currency, info]) => (
                    <button
                      key={currency}
                      onClick={() => setSelectedCurrency(currency as CryptoCurrency)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCurrency === currency
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-700 bg-gray-800/30 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{info.icon}</div>
                      <div className="text-white font-semibold text-sm">{currency}</div>
                      <div className="text-gray-400 text-xs">{info.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {rates && (
                <div className="bg-gray-800/30 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">支払い金額</span>
                    <span className="text-white font-bold text-xl">
                      {getCryptoAmount().toFixed(8)} {selectedCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">受取チップ数</span>
                    <span className="text-purple-400 font-bold">{chipAmount.toLocaleString()} チップ</span>
                  </div>
                </div>
              )}

              <button
                onClick={createInvoice}
                disabled={loading || chipAmount < 100}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>処理中...</span>
                  </span>
                ) : (
                  '支払いアドレスを生成'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="card animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-400 mb-2">送金先アドレス</h2>
              <p className="text-gray-400">下記のアドレスに送金してください</p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-6 border border-purple-500/20 mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <Image src={invoice.qrCodeUrl} alt="QR Code" width={200} height={200} />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">送金先アドレス</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={invoice.address}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-900/50 text-white rounded border border-gray-700 text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(invoice.address)}
                      className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-purple-400" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">送金金額</label>
                    <div className="text-white font-bold">{invoice.amount.toFixed(8)} {invoice.currency}</div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">受取チップ</label>
                    <div className="text-purple-400 font-bold">{invoice.chipAmount.toLocaleString()} チップ</div>
                  </div>
                </div>
              </div>
            </div>

            {invoiceStatus && (
              <div className={`bg-gray-800/30 rounded-lg p-4 border mb-4 ${
                invoiceStatus.status === 'completed' ? 'border-green-500/50' : 'border-yellow-500/50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400">ステータス</span>
                  <span className={`font-bold ${getStatusColor(invoiceStatus.status)}`}>
                    {getStatusText(invoiceStatus.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">確認数</span>
                  <span className="text-white font-semibold">
                    {invoiceStatus.confirmations} / {invoiceStatus.requiredConfirmations}
                  </span>
                </div>
                {invoiceStatus.txHash && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <a
                      href={`https://blockexplorer.com/tx/${invoiceStatus.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
                    >
                      <span>トランザクションを確認</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold text-yellow-400 mb-1">重要な注意事項</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>正確な金額を送金してください</li>
                    <li>送金後、ブロックチェーンの確認に時間がかかる場合があります</li>
                    <li>有効期限: {new Date(invoice.expiresAt).toLocaleString('ja-JP')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setInvoice(null);
                setInvoiceStatus(null);
              }}
              className="w-full btn-secondary"
            >
              キャンセル
            </button>
          </div>
        )}
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
