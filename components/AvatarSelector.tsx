'use client';

import { useState } from 'react';
import { X, Check, Gem, Crown, Star, Sparkles, Flame, Award, Trophy, Zap } from 'lucide-react';

interface Avatar {
  id: string;
  name: string;
  icon: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  isOwned: boolean;
  isDefault: boolean;
}

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelectAvatar: (avatarId: string) => void;
  userCurrency: { chips: number; diamonds: number };
  ownedAvatars?: string[];
  onPurchaseAvatar?: (avatarId: string) => void;
}

export default function AvatarSelector({
  isOpen,
  onClose,
  currentAvatar,
  onSelectAvatar,
  userCurrency,
  ownedAvatars = ['default'],
  onPurchaseAvatar
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  const baseAvatars: Omit<Avatar, 'isOwned'>[] = [
    { id: 'default', name: 'デフォルト', icon: <Award className="w-16 h-16" />, rarity: 'common' as const, price: 0, isDefault: true },
    { id: 'poker1', name: 'プレイヤー', icon: <Trophy className="w-16 h-16" />, rarity: 'common' as const, price: 100, isDefault: false },
    { id: 'poker2', name: 'ディーラー', icon: <Zap className="w-16 h-16" />, rarity: 'common' as const, price: 150, isDefault: false },
    { id: 'lucky', name: 'ラッキー', icon: <Star className="w-16 h-16" />, rarity: 'rare' as const, price: 300, isDefault: false },
    { id: 'diamond', name: 'ダイヤモンド', icon: <Gem className="w-16 h-16" />, rarity: 'rare' as const, price: 400, isDefault: false },
    { id: 'crown', name: 'ロイヤル', icon: <Crown className="w-16 h-16" />, rarity: 'epic' as const, price: 800, isDefault: false },
    { id: 'fire', name: 'ファイヤー', icon: <Flame className="w-16 h-16" />, rarity: 'epic' as const, price: 900, isDefault: false },
    { id: 'rainbow', name: 'レインボー', icon: <Sparkles className="w-16 h-16" />, rarity: 'legendary' as const, price: 1500, isDefault: false },
    { id: 'star', name: 'スター', icon: <Star className="w-16 h-16 fill-current" />, rarity: 'legendary' as const, price: 2000, isDefault: false },
  ];

  // 所有情報を反映したアバターリスト
  const avatars: Avatar[] = baseAvatars.map(avatar => ({
    ...avatar,
    isOwned: ownedAvatars.includes(avatar.id)
  }));

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

  const handlePurchase = (avatar: Avatar) => {
    if (userCurrency.diamonds >= avatar.price) {
      // 購入処理
      console.log('Purchasing avatar:', avatar.id);
      if (onPurchaseAvatar) {
        onPurchaseAvatar(avatar.id);
      }
      // 実際の実装ではAPIを呼び出して購入処理とダイヤモンドの減算を行う
    }
  };

  const handleSelect = () => {
    onSelectAvatar(selectedAvatar);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">アバター選択</h1>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 現在の通貨表示 */}
        <div className="p-4 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <Gem className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">{userCurrency.diamonds}</span>
              <span className="text-gray-400 text-sm">ダイヤモンド</span>
            </div>
          </div>
        </div>

        {/* アバター一覧 */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  selectedAvatar === avatar.id
                    ? 'border-blue-500 bg-blue-500/20'
                    : avatar.isOwned
                    ? 'border-green-500 bg-green-500/10 hover:border-green-400'
                    : getRarityBg(avatar.rarity)
                }`}
                onClick={() => avatar.isOwned && setSelectedAvatar(avatar.id)}
              >
                {/* レアリティ表示 */}
                <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold ${getRarityColor(avatar.rarity)}`}>
                  {avatar.rarity.toUpperCase()}
                </div>

                {/* アバター */}
                <div className="text-center">
                  <div className="mb-3 flex justify-center text-white">
                    {avatar.icon}
                  </div>
                  <div className="text-white font-semibold text-sm mb-1">{avatar.name}</div>
                  
                  {/* 価格または所有状況 */}
                  {avatar.isOwned ? (
                    <div className="flex items-center justify-center space-x-1 text-green-400 text-xs">
                      <Check className="w-3 h-3" />
                      <span>所有済み</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-1 text-blue-400 text-xs">
                      <Gem className="w-3 h-3" />
                      <span>{avatar.price}</span>
                    </div>
                  )}
                </div>

                {/* 購入ボタン */}
                {!avatar.isOwned && !avatar.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(avatar);
                    }}
                    disabled={userCurrency.diamonds < avatar.price}
                    className={`w-full mt-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      userCurrency.diamonds >= avatar.price
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    購入
                  </button>
                )}

                {/* 選択済み表示 */}
                {selectedAvatar === avatar.id && avatar.isOwned && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Check className="text-blue-400 w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSelect}
              disabled={!avatars.find(a => a.id === selectedAvatar)?.isOwned}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              選択
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
