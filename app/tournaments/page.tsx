'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trophy, Crown, Users, Clock, Coins } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function TournamentsContent() {
  const [filter, setFilter] = useState('all');

  const tournaments = [
    {
      id: '1',
      name: 'Daily Main Event',
      buyIn: 100,
      fee: 10,
      guarantee: 25000,
      players: 256,
      maxPlayers: 500,
      startTime: '20:00 JST',
      status: 'registering',
      type: 'featured'
    },
    {
      id: '2',
      name: 'Turbo Knockout',
      buyIn: 50,
      fee: 5,
      guarantee: 10000,
      players: 128,
      maxPlayers: 200,
      startTime: '21:00 JST',
      status: 'registering',
      type: 'turbo'
    },
    {
      id: '3',
      name: 'Sunday Million',
      buyIn: 500,
      fee: 50,
      guarantee: 1000000,
      players: 1845,
      maxPlayers: 10000,
      startTime: '日曜 19:00 JST',
      status: 'upcoming',
      type: 'featured'
    },
    {
      id: '4',
      name: 'Freeroll Tournament',
      buyIn: 0,
      fee: 0,
      guarantee: 500,
      players: 512,
      maxPlayers: 1000,
      startTime: '毎時00分',
      status: 'running',
      type: 'freeroll'
    }
  ];

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
            <Link href="/lobby" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Image
              src="https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/70686fc0-87b1-013e-fa57-0a58a9feac02/SJsP-thumbnail.png"
              alt="SIN JAPAN POKER"
              width={128}
              height={40}
              className="w-32 h-10 rounded-lg object-cover"
            />
            <h1 className="text-2xl font-bold text-gradient-blue">トーナメント</h1>
          </div>
        </div>
      </header>

      {/* フィルター */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-center space-x-4 glass-strong rounded-2xl p-2">
          {[
            { id: 'all', label: 'すべて' },
            { id: 'featured', label: '注目' },
            { id: 'turbo', label: 'ターボ' },
            { id: 'freeroll', label: 'フリーロール' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* トーナメント一覧 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 pb-24">
        <div className="space-y-4">
          {tournaments
            .filter(t => filter === 'all' || t.type === filter)
            .map((tournament, index) => (
              <div
                key={tournament.id}
                className="card hover-lift neon-border animate-slide-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Crown className="text-yellow-500 text-2xl" />
                      <h3 className="text-2xl font-bold text-white">{tournament.name}</h3>
                      {tournament.type === 'featured' && (
                        <span className="badge-primary">注目</span>
                      )}
                      {tournament.status === 'running' && (
                        <span className="badge bg-blue-500 text-white animate-pulse">進行中</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 mb-1">バイイン</div>
                        <div className="text-white font-semibold">
                          ${tournament.buyIn} + ${tournament.fee}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">賞金保証</div>
                        <div className="text-yellow-400 font-semibold">
                          ${tournament.guarantee.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">参加者</div>
                        <div className="text-white font-semibold">
                          {tournament.players} / {tournament.maxPlayers}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">開始時刻</div>
                        <div className="text-white font-semibold">{tournament.startTime}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      className="btn-primary px-8 py-3 w-full md:w-auto"
                      onClick={() => alert('トーナメント参加機能は実装中です')}
                    >
                      参加する
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}

export default function TournamentsPage() {
  return (
    <ProtectedRoute>
      <TournamentsContent />
    </ProtectedRoute>
  );
}