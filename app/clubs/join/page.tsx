'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import { Users } from 'lucide-react';

export default function JoinClubPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [clubCode, setClubCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(
        '/api/clubs/join',
        { clubCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('クラブに参加しました！');
      router.push('/lobby');
    } catch (err: any) {
      setError(err.response?.data?.message || 'クラブへの参加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/lobby')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            <FaArrowLeft />
            <span>戻る</span>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Users className="text-6xl text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">クラブに参加</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-blue-500/20 border border-blue-500 text-blue-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                クラブコード
              </label>
              <input
                type="text"
                value={clubCode}
                onChange={(e) => setClubCode(e.target.value.toUpperCase())}
                required
                maxLength={6}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl font-bold tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="XXXXXX"
              />
              <p className="mt-2 text-sm text-gray-400">
                6桁のクラブコードを入力してください
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || clubCode.length !== 6}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-bold rounded-lg transition"
            >
              {loading ? '参加中...' : 'クラブに参加'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

