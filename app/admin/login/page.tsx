'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import { Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 実際のAdmin認証
      if (email === 'info@sinjapan.jp' && password === 'Kazuya8008') {
        const adminUser = {
          id: 'admin_sinjapan',
          email: 'info@sinjapan.jp',
          username: 'SIN JAPAN Admin',
          role: 'admin' as const,
          permissions: ['tournament.create', 'tournament.edit', 'tournament.delete', 'user.manage', 'analytics.view', 'currency.manage', 'revenue.view', 'monitor.view', 'table.manage', 'realmoney.manage', 'settings.manage']
        };
        const token = 'admin_token_' + Date.now();
        login(adminUser, token);
        router.push('/admin/dashboard');
        return;
      }

      // 他のAdminユーザーの場合はAPI経由で認証
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ログインに失敗しました');
      }

      const { adminUser, token } = await response.json();
      login(adminUser, token);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ・ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">SIN JAPAN POKER</p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="info@sinjapan.jp"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>ログイン中...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>ログイン</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* フッター */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← メインサイトに戻る
          </button>
        </div>
      </div>
    </div>
  );
}