'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Lock, AlertCircle, Copy, Check } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';

function BankPaymentContent() {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState(1000);
  const [copied, setCopied] = useState(false);
  
  const isAdmin = user?.isAdmin || false;

  // モック銀行口座情報
  const bankInfo = {
    bankName: '三菱UFJ銀行',
    branchName: '渋谷支店',
    branchCode: '123',
    accountType: '普通',
    accountNumber: '1234567',
    accountHolder: 'カ)シンジャパンポーカー'
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <h1 className="text-2xl font-bold text-gradient-blue">銀行振込</h1>
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
                銀行振込機能は管理者のみが利用できます。
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
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-500/20 rounded-full mb-4">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">銀行振込</h2>
              <p className="text-gray-400 mb-6">
                銀行振込機能は現在準備中です。<br />
                しばらくお待ちください。
              </p>
            </div>

            {/* プレビュー用振込先情報（無効化） */}
            <div className="space-y-6 opacity-50">
              <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
                <h3 className="text-white font-bold text-lg mb-4">振込先口座情報</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">金融機関</span>
                    <span className="text-white font-semibold">{bankInfo.bankName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">支店名</span>
                    <span className="text-white font-semibold">{bankInfo.branchName} ({bankInfo.branchCode})</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">口座種別</span>
                    <span className="text-white font-semibold">{bankInfo.accountType}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">口座番号</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{bankInfo.accountNumber}</span>
                      <button
                        onClick={() => handleCopy(bankInfo.accountNumber)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">口座名義</span>
                    <span className="text-white font-semibold">{bankInfo.accountHolder}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">ご注意</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• 振込手数料はお客様負担となります</li>
                  <li>• 入金確認には1-3営業日かかる場合があります</li>
                  <li>• 振込人名義はご登録名と一致させてください</li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  入金確認後、自動的にポイントがチャージされます
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/purchase" className="btn-secondary inline-block">
                購入ページに戻る
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BankPaymentPage() {
  return (
    <ProtectedRoute>
      <BankPaymentContent />
    </ProtectedRoute>
  );
}

