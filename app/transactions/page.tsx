'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Coins, Zap, Filter, BarChart3, CreditCard } from 'lucide-react';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import ProtectedRoute from '@/components/ProtectedRoute';

function TransactionsContent() {
  const { transactions, currency } = useCurrencyStore();
  const [filter, setFilter] = useState<'all' | 'chips' | 'energy' | 'points'>('all');

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.currency === filter
  );

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'chips': return <Image src="/chip-icon.png" alt="Chip" width={20} height={20} className="w-5 h-5" />;
      case 'energy': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'points': return <CreditCard className="w-5 h-5 text-blue-400" />;
      default: return null;
    }
  };

  const stats = {
    total: transactions.length,
    earned: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    spent: Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
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
            <Link href="/profile" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <div className="glass px-3 py-2 rounded-full flex items-center">
              <Image src="/chip-icon.png" alt="Chip" width={20} height={20} className="inline mr-2" />
              <span className="text-white font-semibold">{(currency?.realChips || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* 統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <div className="card hover-lift">
            <div className="flex items-center space-x-3 mb-2">
              <BarChart3 className="text-blue-400 text-2xl" />
              <span className="text-gray-400">総取引数</span>
            </div>
            <div className="text-4xl font-bold text-white">{stats.total}</div>
          </div>

          <div className="card-blue hover-lift">
            <div className="flex items-center space-x-3 mb-2">
              <Image src="/chip-icon.png" alt="Chip" width={32} height={32} />
              <span className="text-gray-400">獲得</span>
            </div>
            <div className="text-4xl font-bold text-green-400">+{stats.earned.toLocaleString()}</div>
          </div>

          <div className="card hover-lift">
            <div className="flex items-center space-x-3 mb-2">
              <Image src="/chip-icon.png" alt="Chip" width={32} height={32} />
              <span className="text-gray-400">消費</span>
            </div>
            <div className="text-4xl font-bold text-blue-400">-{stats.spent.toLocaleString()}</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex justify-center space-x-4 mb-8 animate-scale-in">
          {[
            { id: 'all', label: 'すべて', icon: <Filter className="text-gray-400" /> },
            { id: 'chips', label: 'チップ', icon: <Image src="/chip-icon.png" alt="Chip" width={20} height={20} /> },
            { id: 'energy', label: 'エネルギー', icon: <Zap className="text-yellow-400" /> },
            { id: 'points', label: 'ポイント', icon: <CreditCard className="text-blue-400" /> }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === option.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {/* 取引一覧 */}
        <div className="space-y-3 animate-slide-in-up">
          {filteredTransactions.length === 0 ? (
            <div className="card text-center py-20">
              <p className="text-gray-500 text-xl">取引履歴がありません</p>
            </div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="card hover-lift"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full glass-strong flex items-center justify-center">
                      {getCurrencyIcon(transaction.currency)}
                    </div>
                    <div>
                      <div className="text-white font-semibold mb-1">
                        {transaction.description}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {new Date(transaction.timestamp).toLocaleString('ja-JP')}
                      </div>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <TransactionsContent />
    </ProtectedRoute>
  );
}