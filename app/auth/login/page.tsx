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
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a1a] to-black"></div>
        
        {/* 流れるトランプカード */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          {/* カード1 - スペードのA */}
          <div className="absolute w-16 h-24 animate-card-fall-1 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/ace_of_spades.png" alt="Ace of Spades" className="w-full h-full object-contain p-1" />
          </div>
          
          {/* カード2 - ハートのK */}
          <div className="absolute w-16 h-24 animate-card-fall-2 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/king_of_hearts.png" alt="King of Hearts" className="w-full h-full object-contain p-1" />
          </div>
          
          {/* カード3 - クラブのQ */}
          <div className="absolute w-16 h-24 animate-card-fall-3 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/queen_of_clubs.png" alt="Queen of Clubs" className="w-full h-full object-contain p-1" />
          </div>
          
          {/* カード4 - ダイヤのJ */}
          <div className="absolute w-16 h-24 animate-card-fall-4 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/jack_of_diamonds.png" alt="Jack of Diamonds" className="w-full h-full object-contain p-1" />
          </div>
          
          {/* カード5 - スペードの10 */}
          <div className="absolute w-16 h-24 animate-card-fall-5 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/10_of_spades.png" alt="10 of Spades" className="w-full h-full object-contain p-1" />
          </div>
          
          {/* カード6 - ハートの9 */}
          <div className="absolute w-16 h-24 animate-card-fall-6 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/9_of_hearts.png" alt="9 of Hearts" className="w-full h-full object-contain p-1" />
          </div>
          
          {/* カード7 - クラブの8 */}
          <div className="absolute w-16 h-24 animate-card-fall-7 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/8_of_clubs.png" alt="8 of Clubs" className="w-full h-full object-contain p-1" />
          </div>
          
          {/* カード8 - ダイヤの7 */}
          <div className="absolute w-16 h-24 animate-card-fall-8 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/7_of_diamonds.png" alt="7 of Diamonds" className="w-full h-full object-contain p-1" />
          </div>
          
          {/* 追加のカード群 */}
          <div className="absolute w-14 h-20 animate-card-fall-9 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/ace_of_hearts.png" alt="Ace of Hearts" className="w-full h-full object-contain p-1" />
          </div>
          
          <div className="absolute w-14 h-20 animate-card-fall-10 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/king_of_spades.png" alt="King of Spades" className="w-full h-full object-contain p-1" />
          </div>
          
          <div className="absolute w-14 h-20 animate-card-fall-11 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/queen_of_diamonds.png" alt="Queen of Diamonds" className="w-full h-full object-contain p-1" />
          </div>
          
          <div className="absolute w-14 h-20 animate-card-fall-12 relative bg-white rounded-lg overflow-hidden shadow-xl">
            <img src="/cards/jack_of_clubs.png" alt="Jack of Clubs" className="w-full h-full object-contain p-1" />
          </div>
        </div>
        
        {/* 背景のドットパターン */}
        <div className="absolute inset-0 bg-dots opacity-10"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* ロゴセクション */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="SIN JAPAN POKER Logo"
                className="w-56 h-20 mx-auto object-contain"
              />
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