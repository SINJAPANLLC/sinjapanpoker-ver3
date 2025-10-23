'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

export default function CreateTournamentPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'sit-n-go' | 'scheduled' | 'bounty'>('sit-n-go');
  const [buyIn, setBuyIn] = useState(1000);
  const [maxPlayers, setMaxPlayers] = useState(9);
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const entryFee = Math.floor(buyIn * 0.1);
  const totalCost = buyIn + entryFee;
  const prizePool = buyIn * maxPlayers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          type,
          buyIn,
          maxPlayers,
          startTime: startTime || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'トーナメント作成に失敗しました');
      }

      router.push(`/tournament/${data.tournament.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">トーナメント作成</h1>
          <Link href="/tournament">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
              戻る
            </button>
          </Link>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-sm p-8 rounded-lg border-2 border-white/30">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* トーナメント名 */}
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              トーナメント名 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/20 text-white px-4 py-3 rounded-lg border border-white/40 focus:outline-none focus:border-cyan-400"
              placeholder="例: 毎日トーナメント"
            />
          </div>

          {/* 説明 */}
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              説明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/20 text-white px-4 py-3 rounded-lg border border-white/40 focus:outline-none focus:border-cyan-400 resize-none"
              placeholder="トーナメントの説明を入力..."
            />
          </div>

          {/* タイプ */}
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              タイプ *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['sit-n-go', 'scheduled', 'bounty'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    type === t
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {t === 'sit-n-go' ? 'S&G' : t === 'scheduled' ? 'スケジュール' : 'バウンティ'}
                </button>
              ))}
            </div>
          </div>

          {/* バイイン */}
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              バイイン（円） *
            </label>
            <input
              type="number"
              value={buyIn}
              onChange={(e) => setBuyIn(Number(e.target.value))}
              min="100"
              step="100"
              required
              className="w-full bg-white/20 text-white px-4 py-3 rounded-lg border border-white/40 focus:outline-none focus:border-cyan-400"
            />
            <p className="text-white/60 text-xs mt-1">
              参加料: {entryFee}円（10%） / 総コスト: {totalCost}円
            </p>
          </div>

          {/* 最大プレイヤー数 */}
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              最大プレイヤー数 *
            </label>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full bg-white/20 text-white px-4 py-3 rounded-lg border border-white/40 focus:outline-none focus:border-cyan-400"
            >
              {[6, 9, 18, 27, 45, 90, 180].map((num) => (
                <option key={num} value={num} className="bg-gray-800">
                  {num}人
                </option>
              ))}
            </select>
            <p className="text-white/60 text-xs mt-1">
              満員時の賞金プール: {prizePool.toLocaleString()}円
            </p>
          </div>

          {/* 開始時刻（スケジュールのみ） */}
          {type === 'scheduled' && (
            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2">
                開始時刻
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white/20 text-white px-4 py-3 rounded-lg border border-white/40 focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          {/* 賞金分配プレビュー */}
          <div className="mb-6 bg-white/10 p-4 rounded-lg">
            <h3 className="text-white font-bold mb-3">賞金分配（満員時）</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">1位:</span>
                <span className="text-yellow-400 font-bold">{Math.floor(prizePool * 0.5).toLocaleString()}円（50%）</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">2位:</span>
                <span className="text-gray-300 font-bold">{Math.floor(prizePool * 0.3).toLocaleString()}円（30%）</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">3位:</span>
                <span className="text-orange-400 font-bold">{Math.floor(prizePool * 0.2).toLocaleString()}円（20%）</span>
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <Link href="/tournament" className="flex-1">
              <button
                type="button"
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition-colors"
              >
                キャンセル
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-bold transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? '作成中...' : 'トーナメント作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
