'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaLock, FaGlobe } from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import ProtectedRoute from '@/components/ProtectedRoute';

function ClubCreateContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxMembers, setMaxMembers] = useState(50);
  const [rakePercentage, setRakePercentage] = useState(20);

  const handleCreate = async () => {
    if (!clubName.trim()) {
      alert('クラブ名を入力してください');
      return;
    }

    try {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clubName,
          ownerId: user?.id,
          ownerUsername: user?.username,
          description,
          rakePercentage,
          isPrivate,
          maxMembers
        })
      });

      const data = await response.json();
      alert('クラブを作成しました！');
      router.push(`/clubs/${data.club.id}`);
    } catch (error) {
      alert('クラブの作成に失敗しました');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-3 md:p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 md:space-x-4">
          <Link href="/clubs" className="text-blue-400 hover:text-cyan-300">
            <FaArrowLeft className="text-lg md:text-xl" />
          </Link>
          <h1 className="text-lg md:text-2xl font-bold text-gradient-blue">クラブ作成</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="card animate-scale-in">
          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-white font-medium mb-2 text-sm md:text-base">クラブ名</label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="例: エース倶楽部"
                className="text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2 text-sm md:text-base">説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="クラブの説明を入力..."
                className="h-24 md:h-32 resize-none text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-3 text-sm md:text-base">
                レーキシェア: {rakePercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={rakePercentage}
                onChange={(e) => setRakePercentage(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-2">
                <span>0%（オーナーが全額）</span>
                <span>50%（クラブとオーナーで折半）</span>
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-3 text-sm md:text-base">
                最大メンバー数: {maxMembers}人
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={maxMembers}
                onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-3 text-sm md:text-base">公開設定</label>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={() => setIsPrivate(false)}
                  className={`flex items-center justify-center space-x-2 p-3 md:p-4 rounded-xl transition-all ${
                    !isPrivate
                      ? 'bg-gradient-to-r from-green-500 to-green-700 text-white'
                      : 'glass text-gray-400'
                  }`}
                >
                  <FaGlobe className="text-base md:text-xl" />
                  <span className="text-sm md:text-base">公開</span>
                </button>
                <button
                  onClick={() => setIsPrivate(true)}
                  className={`flex items-center justify-center space-x-2 p-3 md:p-4 rounded-xl transition-all ${
                    isPrivate
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                      : 'glass text-gray-400'
                  }`}
                >
                  <FaLock className="text-base md:text-xl" />
                  <span className="text-sm md:text-base">プライベート</span>
                </button>
              </div>
            </div>

            <div className="pt-4 md:pt-6 border-t border-gray-700">
              <button
                onClick={handleCreate}
                className="btn-primary w-full text-base md:text-lg py-3 md:py-4"
              >
                クラブを作成
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ClubCreatePage() {
  return (
    <ProtectedRoute>
      <ClubCreateContent />
    </ProtectedRoute>
  );
}
