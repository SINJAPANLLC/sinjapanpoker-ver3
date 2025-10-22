'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaGem, FaHistory, FaStar, FaEdit, FaHeart, FaShieldAlt, FaRocket, FaTrophy } from 'react-icons/fa';
import { Flame, Crown, BarChart3, Gamepad2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import ProtectedRoute from '@/components/ProtectedRoute';

interface GameStats {
  totalGames: number;
  winRate: number;
  totalWinnings: number;
  currentStreak: number;
  longestStreak: number;
  biggestWin: number;
  vpip: number;
  pfr: number;
  aggressionFactor: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Live2DCharacter {
  id: string;
  name: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  obtainedAt: Date;
}

interface PurchaseHistory {
  id: string;
  item: string;
  amount: number;
  date: Date;
  type: 'chips' | 'outfit' | 'character' | 'vip';
}

function EnhancedProfileContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<GameStats>({
    totalGames: 1247,
    winRate: 68.5,
    totalWinnings: 45680,
    currentStreak: 12,
    longestStreak: 28,
    biggestWin: 12500,
    vpip: 22.3,
    pfr: 18.7,
    aggressionFactor: 2.1
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      name: 'ポーカーマスター',
      description: '1000回のゲームに勝利',
      icon: '🏆',
      unlockedAt: new Date('2024-01-15'),
      rarity: 'legendary'
    },
    {
      id: '2',
      name: '連勝の王',
      description: '20連勝を達成',
      icon: '🔥',
      unlockedAt: new Date('2024-01-10'),
      rarity: 'epic'
    },
    {
      id: '3',
      name: 'VIP会員',
      description: 'VIP特典を購入',
      icon: '👑',
      unlockedAt: new Date('2024-01-05'),
      rarity: 'rare'
    }
  ]);

  const [characters] = useState<Live2DCharacter[]>([
    {
      id: '1',
      name: 'エレガントディーラー',
      image: '/characters/elegant-dealer.png',
      rarity: 'legendary',
      obtainedAt: new Date('2024-01-12')
    },
    {
      id: '2',
      name: 'カジュアルディーラー',
      image: '/characters/casual-dealer.png',
      rarity: 'common',
      obtainedAt: new Date('2024-01-01')
    }
  ]);

  const [purchaseHistory] = useState<PurchaseHistory[]>([
    {
      id: '1',
      item: 'プラチナVIP (30日)',
      amount: 5000,
      date: new Date('2024-01-20'),
      type: 'vip'
    },
    {
      id: '2',
      item: 'エレガントドレス',
      amount: 500,
      date: new Date('2024-01-18'),
      type: 'outfit'
    },
    {
      id: '3',
      item: 'チップ 10,000枚',
      amount: 10000,
      date: new Date('2024-01-15'),
      type: 'chips'
    }
  ]);

  const tabs = [
    { id: 'overview', name: '概要', icon: BarChart3 },
    { id: 'achievements', name: '実績', icon: FaTrophy },
    { id: 'characters', name: 'キャラクター', icon: FaHeart },
    { id: 'history', name: '履歴', icon: FaHistory }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 text-gray-400';
      case 'rare': return 'border-blue-500 text-blue-400';
      case 'epic': return 'border-purple-500 text-purple-400';
      case 'legendary': return 'border-yellow-500 text-yellow-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-900/50';
      case 'rare': return 'bg-blue-900/30';
      case 'epic': return 'bg-purple-900/30';
      case 'legendary': return 'bg-yellow-900/30';
      default: return 'bg-gray-900/50';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-900/50 to-blue-800/50 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-400 text-sm font-semibold">総ゲーム数</div>
              <div className="text-white text-2xl font-bold">{stats.totalGames.toLocaleString()}</div>
            </div>
            <Gamepad2 className="text-blue-400 text-2xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-400 text-sm font-semibold">勝率</div>
              <div className="text-white text-2xl font-bold">{stats.winRate}%</div>
            </div>
            <FaTrophy className="text-green-400 text-2xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-yellow-400 text-sm font-semibold">総獲得</div>
              <div className="text-white text-2xl font-bold">${stats.totalWinnings.toLocaleString()}</div>
            </div>
            <FaGem className="text-yellow-400 text-2xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-orange-400 text-sm font-semibold">現在連勝</div>
              <div className="text-white text-2xl font-bold">{stats.currentStreak}</div>
            </div>
            <Flame className="text-orange-400 text-2xl" />
          </div>
        </div>
      </div>

      {/* 詳細統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
          <h3 className="text-white font-bold text-lg mb-4">プレイスタイル</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">VPIP</span>
                <span className="text-white">{stats.vpip}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.vpip}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">PFR</span>
                <span className="text-white">{stats.pfr}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.pfr}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">アグレッション</span>
                <span className="text-white">{stats.aggressionFactor}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(stats.aggressionFactor * 20, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
          <h3 className="text-white font-bold text-lg mb-4">記録</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">最高連勝</span>
              <span className="text-white font-semibold">{stats.longestStreak}回</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">最高獲得</span>
              <span className="text-yellow-400 font-semibold">${stats.biggestWin.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">ランキング</span>
              <span className="text-green-400 font-semibold">#127</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <div key={achievement.id} className={`${getRarityBg(achievement.rarity)} rounded-xl p-4 border ${getRarityColor(achievement.rarity)}`}>
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{achievement.icon}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-white font-bold">{achievement.name}</h3>
                <Crown className={`text-xs ${getRarityColor(achievement.rarity).split(' ')[1]}`} />
              </div>
              <p className="text-gray-400 text-sm">{achievement.description}</p>
              <p className="text-gray-500 text-xs mt-1">
                解除日: {achievement.unlockedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCharacters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((character) => (
        <div key={character.id} className={`${getRarityBg(character.rarity)} rounded-xl p-4 border ${getRarityColor(character.rarity)}`}>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-3 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-4xl">👩‍💼</span>
            </div>
            <h3 className="text-white font-bold mb-1">{character.name}</h3>
            <p className={`text-xs mb-2 ${getRarityColor(character.rarity).split(' ')[1]}`}>
              {character.rarity.toUpperCase()}
            </p>
            <p className="text-gray-400 text-xs">
              獲得日: {character.obtainedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      {purchaseHistory.map((purchase) => (
        <div key={purchase.id} className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                {purchase.type === 'vip' && <Crown className="text-yellow-400 text-xl" />}
                {purchase.type === 'outfit' && <FaStar className="text-purple-400 text-xl" />}
                {purchase.type === 'character' && <FaHeart className="text-pink-400 text-xl" />}
                {purchase.type === 'chips' && <FaGem className="text-blue-400 text-xl" />}
              </div>
              <div>
                <h3 className="text-white font-semibold">{purchase.item}</h3>
                <p className="text-gray-400 text-sm">
                  {purchase.date.toLocaleDateString()} {purchase.date.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold">${purchase.amount.toLocaleString()}</div>
              <div className="text-gray-400 text-sm capitalize">{purchase.type}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-[#1a0a0a] to-black">
        {/* 背景エフェクト */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* ヘッダー */}
        <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-blue-500/30 p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/profile" className="text-blue-400 hover:text-cyan-300 transition-colors">
              ← 戻る
            </Link>
            <h1 className="text-2xl font-bold text-white">プロフィール詳細</h1>
            <button className="text-blue-400 hover:text-cyan-300 transition-colors">
              <FaEdit className="text-xl" />
            </button>
          </div>
        </header>

        {/* プロフィール概要 */}
        <div className="relative z-10 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 mb-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Crown className="text-black text-sm" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">プレイヤー名</h2>
                    <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm font-bold">VIP</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-blue-400 text-sm">レベル</div>
                      <div className="text-white text-xl font-bold">47</div>
                    </div>
                    <div>
                      <div className="text-blue-400 text-sm">経験値</div>
                      <div className="text-white text-xl font-bold">12,450 / 15,000</div>
                    </div>
                    <div>
                      <div className="text-blue-400 text-sm">ランク</div>
                      <div className="text-white text-xl font-bold">ゴールド</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="flex space-x-1 bg-black/30 rounded-lg p-1 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span className="font-semibold">{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* タブコンテンツ */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'achievements' && renderAchievements()}
              {activeTab === 'characters' && renderCharacters()}
              {activeTab === 'history' && renderHistory()}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function EnhancedProfilePage() {
  return (
    <ProtectedRoute>
      <EnhancedProfileContent />
    </ProtectedRoute>
  );
}
