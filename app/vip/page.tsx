'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaTimes, FaCheck, FaQuestionCircle } from 'react-icons/fa';
import { Crown } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const VIP_TIERS = [
  {
    id: 'silver',
    name: 'シルバー',
    color: '#C0C0C0',
    price: 1000,
    level: 1
  },
  {
    id: 'black',
    name: 'ブラック',
    color: '#2D2D2D',
    price: 1580,
    level: 2
  },
  {
    id: 'platinum',
    name: 'プラチナ',
    color: '#8B5CF6',
    price: 2500,
    level: 3
  }
];

const BENEFITS = [
  {
    id: 'allInWinRate',
    name: 'All-in勝率',
    description: 'オールイン勝率統計の表示'
  },
  {
    id: 'rabbitHunt',
    name: 'ラビットハント',
    description: 'ラビットハント機能の利用'
  },
  {
    id: 'additionalLoginRewards',
    name: '追加のログインリワード',
    description: '追加ログインボーナス'
  },
  {
    id: 'playData',
    name: 'プレイデータ',
    description: '詳細プレイデータの確認'
  },
  {
    id: 'simpleHUD',
    name: '簡易HUD',
    description: '簡易HUDの表示'
  },
  {
    id: 'currentClubData',
    name: '現在のクラブデータ',
    description: '現在のクラブデータ表示'
  },
  {
    id: 'networkDisconnectionProtection',
    name: 'ネット切断保護',
    description: 'ネット切断保護機能'
  },
  {
    id: 'exclusiveStamps',
    name: '専用スタンプ',
    description: '専用スタンプの利用'
  },
  {
    id: 'clubEstablishment',
    name: 'クラブ設立',
    description: 'クラブ設立権限'
  },
  {
    id: 'freeBasicStamps',
    name: '無料基本スタンプ回数',
    description: '無料基本スタンプ回数'
  },
  {
    id: 'freeTimeBank',
    name: '無料タイムバンクの回数',
    description: '無料タイムバンク回数'
  }
];

const VIP_BENEFITS = {
  silver: {
    allInWinRate: true,
    rabbitHunt: true,
    additionalLoginRewards: true,
    playData: false,
    simpleHUD: false,
    currentClubData: false,
    networkDisconnectionProtection: false,
    exclusiveStamps: 3,
    clubEstablishment: 1,
    freeBasicStamps: 200,
    freeTimeBank: 15
  },
  black: {
    allInWinRate: true,
    rabbitHunt: true,
    additionalLoginRewards: true,
    playData: true,
    simpleHUD: true,
    currentClubData: false,
    networkDisconnectionProtection: false,
    exclusiveStamps: 3,
    clubEstablishment: 3,
    freeBasicStamps: 800,
    freeTimeBank: 80
  },
  platinum: {
    allInWinRate: true,
    rabbitHunt: true,
    additionalLoginRewards: true,
    playData: true,
    simpleHUD: true,
    currentClubData: true,
    networkDisconnectionProtection: true,
    exclusiveStamps: 3,
    clubEstablishment: 3,
    freeBasicStamps: 1200,
    freeTimeBank: 120
  }
};

function VIPContent() {
  const [selectedDuration, setSelectedDuration] = useState('30日間');
  const [selectedTier, setSelectedTier] = useState('black');
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  const getBenefitValue = (tierId: string, benefitId: string) => {
    const tierBenefits = VIP_BENEFITS[tierId as keyof typeof VIP_BENEFITS];
    const benefit = BENEFITS.find(b => b.id === benefitId);
    
    if (!tierBenefits || !benefit) return null;

    if (benefitId === 'exclusiveStamps' || benefitId === 'clubEstablishment' || 
        benefitId === 'freeBasicStamps' || benefitId === 'freeTimeBank') {
      return tierBenefits[benefitId as keyof typeof tierBenefits];
    } else {
      return tierBenefits[benefitId as keyof typeof tierBenefits] ? true : false;
    }
  };

  const renderBenefitCell = (tierId: string, benefitId: string) => {
    const value = getBenefitValue(tierId, benefitId);
    
    if (value === null) return null;

    if (typeof value === 'boolean') {
      return (
        <div className="flex justify-center">
          {value ? (
            <FaCheck className="text-green-500 text-lg" />
          ) : (
            <div className="w-5 h-5"></div>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-center text-white font-semibold">
          {value}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FaQuestionCircle className="text-gray-400 text-xl" />
            <h1 className="text-2xl font-bold text-white">VIP特権</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
            >
              <option value="30日間">30日間</option>
              <option value="90日間">90日間</option>
              <option value="1年間">1年間</option>
            </select>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">特典</th>
                    {VIP_TIERS.map((tier) => (
                      <th key={tier.id} className="text-center py-4 px-4">
                        <div className="flex flex-col items-center space-y-2">
                          <div 
                            className={`w-16 h-24 rounded-lg border-2 flex items-center justify-center relative cursor-pointer transition-all ${
                              selectedTier === tier.id ? 'border-green-500 shadow-green-500/50 shadow-lg' : 'border-gray-600'
                            }`}
                            style={{ backgroundColor: tier.color }}
                            onClick={() => setSelectedTier(tier.id)}
                          >
                            <div className="text-white font-bold text-sm">VIP</div>
                            {tier.level >= 2 && (
                              <Crown className="absolute -top-1 -right-1 text-yellow-400 text-xs" />
                            )}
                          </div>
                          <div className="text-white font-semibold">{tier.name}</div>
                          <div className="text-gray-400 text-sm">{tier.price} 💎</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BENEFITS.map((benefit, index) => (
                    <tr key={benefit.id} className={index % 2 === 0 ? 'bg-gray-800/50' : 'bg-transparent'}>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-white font-semibold">{benefit.name}</div>
                          <div className="text-gray-400 text-sm">{benefit.description}</div>
                        </div>
                      </td>
                      {VIP_TIERS.map((tier) => (
                        <td key={tier.id} className="py-4 px-4 text-center">
                          {renderBenefitCell(tier.id, benefit.id)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              選択した期間: {selectedDuration}
            </div>
            <div className="flex space-x-4">
              <Link
                href="/shop"
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all flex items-center space-x-2"
              >
                <span>{VIP_TIERS.find(t => t.id === selectedTier)?.price}</span>
                <span className="text-green-400">💎</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VIPPage() {
  return (
    <ProtectedRoute>
      <VIPContent />
    </ProtectedRoute>
  );
}
