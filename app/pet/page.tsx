'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';
import { FaDragon, FaHeart, FaDrumstickBite } from 'react-icons/fa';
import { ArrowLeft, Flame } from 'lucide-react';
import { Pet } from '@/types';

export default function PetPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetType, setNewPetType] = useState<'dragon' | 'phoenix' | 'tiger' | 'turtle'>('dragon');

  const loadPet = useCallback(async () => {
    try {
      const response = await axios.get(`/api/pets/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPet(response.data.pet);
    } catch (error) {
      console.error('Failed to load pet:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  useEffect(() => {
    if (!token || !user) {
      router.push('/auth/login');
      return;
    }

    loadPet();
  }, [token, user, router, loadPet]);

  const handleCreatePet = async () => {
    setCreating(true);
    try {
      const response = await axios.post(
        '/api/pets/create',
        { name: newPetName, type: newPetType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPet(response.data.pet);
      setNewPetName('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'ペットの作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  const handleFeedPet = async () => {
    try {
      const response = await axios.post(
        '/api/pets/feed',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPet(response.data.pet);
      if (response.data.leveledUp) {
        alert('ペットがレベルアップしました！');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '餌やりに失敗しました');
    }
  };

  const getPetIcon = (type: string) => {
    switch (type) {
      case 'dragon': return '🐉';
      case 'phoenix': return '🦅';
      case 'tiger': return '🐯';
      case 'turtle': return '🐢';
      default: return '🐉';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/lobby')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            <ArrowLeft />
            <span>戻る</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {!pet ? (
          <div className="text-center">
            <FaDragon className="text-8xl text-blue-500 mx-auto mb-8" />
            <h1 className="text-3xl font-bold text-white mb-4">ペットを作成しよう</h1>
            <p className="text-gray-400 mb-8">ペットを育ててゲーム内ボーナスを獲得しよう</p>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 max-w-md mx-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    ペットの名前
                  </label>
                  <input
                    type="text"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="ペットの名前を入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    ペットの種類
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['dragon', 'phoenix', 'tiger', 'turtle'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewPetType(type)}
                        className={`p-4 rounded-lg border-2 transition ${
                          newPetType === type
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-4xl mb-2">{getPetIcon(type)}</div>
                        <div className="text-white font-semibold capitalize">{type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreatePet}
                  disabled={creating || !newPetName}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-bold rounded-lg transition"
                >
                  {creating ? '作成中...' : 'ペットを作成'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8 text-center">マイペット</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ペット表示 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center">
                <div className="text-8xl mb-4">{getPetIcon(pet.type)}</div>
                <h2 className="text-2xl font-bold text-white mb-2">{pet.name}</h2>
                <div className="text-yellow-500 font-semibold mb-6">レベル {pet.level}</div>

                {/* ステータスバー */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span className="flex items-center gap-1">
                        <FaDrumstickBite className="text-orange-500" /> 空腹度
                      </span>
                      <span>{pet.hunger}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-orange-500 h-3 rounded-full transition-all"
                        style={{ width: `${pet.hunger}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span className="flex items-center gap-1">
                        <FaHeart className="text-pink-500" /> 幸福度
                      </span>
                      <span>{pet.happiness}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-pink-500 h-3 rounded-full transition-all"
                        style={{ width: `${pet.happiness}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span className="flex items-center gap-1">
                        <Flame className="text-blue-500" /> 経験値
                      </span>
                      <span>{pet.experience}/{pet.level * 100}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${(pet.experience / (pet.level * 100)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFeedPet}
                  className="mt-8 w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition"
                >
                  餌を与える
                </button>
              </div>

              {/* アビリティ */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">アビリティ</h3>
                <div className="space-y-3">
                  {pet.abilities.map((ability, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-semibold">{ability.name}</h4>
                        <span className="text-yellow-500 font-bold">+{ability.value}%</span>
                      </div>
                      <p className="text-gray-400 text-sm">{ability.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    💡 ヒント: レベル5ごとに新しいアビリティがアンロックされます
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

