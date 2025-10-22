'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { FaGoogle, FaApple } from 'react-icons/fa';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
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
      // デバッグ用：テストユーザーでログイン
      if (email === 'test@example.com' && password === 'password') {
        const mockUser = {
          id: '1',
          email: 'test@example.com',
          username: 'TestUser',
          chips: 0,
          level: 1,
          experience: 0
        };
        const mockToken = 'mock_token_' + Date.now();
        login(mockUser, mockToken);
        router.push('/lobby');
        return;
      }

      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      login(response.data.user, response.data.token);
      router.push('/lobby');
    } catch (err: any) {
      setError(err.response?.data?.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
      </div>

      {/* フローティングカード */}
      <div className="absolute top-20 left-10 animate-float opacity-20">
        <span className="text-5xl text-blue-400">♠️</span>
      </div>
      <div className="absolute top-40 right-20 animate-float opacity-20" style={{ animationDelay: '1s' }}>
        <span className="text-4xl text-white">♥️</span>
      </div>
      <div className="absolute bottom-40 left-20 animate-float opacity-20" style={{ animationDelay: '2s' }}>
        <span className="text-6xl text-blue-400">♦️</span>
      </div>
      <div className="absolute bottom-20 right-10 animate-float opacity-20" style={{ animationDelay: '3s' }}>
        <span className="text-5xl text-white">♣️</span>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* ロゴセクション */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="relative inline-block mb-6">
              <div className="w-56 h-20 flex items-center justify-center mx-auto animate-glow">
                <img
                  src="/logo.png"
                  alt="SIN JAPAN POKER Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-black text-gradient-blue mb-2 neon-glow">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-lg">プレミアムポーカーの世界へ</p>
          </div>

          {/* ログインフォーム */}
          <div className="card animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-blue-500/20 border border-blue-500 text-blue-200 px-4 py-3 rounded-xl text-sm animate-slide-in-down">
                  {error}
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
                  placeholder="your@email.com"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  パスワード
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[42px] text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-gray-400 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span>ログイン状態を保持</span>
                </label>
                <Link href="/auth/forgot" className="text-blue-400 hover:text-cyan-300 transition-colors">
                  パスワードを忘れた
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-lg"
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1a1a1a] text-gray-500">または</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="glass hover-lift px-4 py-3 rounded-xl border border-white/10 flex items-center justify-center space-x-2"
                >
                  <FaGoogle className="text-xl text-blue-400" />
                  <span className="text-white text-sm">Google</span>
                </button>
                <button
                  type="button"
                  className="glass hover-lift px-4 py-3 rounded-xl border border-white/10 flex items-center justify-center space-x-2"
                >
                  <FaApple className="text-xl text-white" />
                  <span className="text-white text-sm">Apple</span>
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                アカウントをお持ちでない方は{' '}
                <Link href="/auth/register" className="text-blue-400 hover:text-cyan-300 font-medium transition-colors">
                  新規登録
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}