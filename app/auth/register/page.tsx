'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGoogle, FaApple, FaWallet } from 'react-icons/fa';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'method' | 'email' | 'wallet'>('method');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    if (!acceptTerms) {
      setError('利用規約に同意してください');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        email,
        username,
        password
      });

      // デバイスタイプを判定
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setDeviceType('ios');
      } else if (/android/.test(userAgent)) {
        setDeviceType('android');
      } else {
        setDeviceType('desktop');
      }

      // ホーム画面追加案内を表示
      setShowInstallGuide(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '登録に失敗しました');
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
        <div className="w-full max-w-md animate-scale-in">
          {/* ロゴ */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="SIN JAPAN POKER Logo"
                className="w-56 h-20 mx-auto object-contain"
              />
            </div>
            <h1 className="text-5xl font-black text-gradient-blue mb-2 neon-glow">
              Join Us
            </h1>
            <p className="text-gray-400">アカウントを作成して始めましょう</p>
          </div>

          {/* 登録方法選択 */}
          {step === 'method' && (
            <div className="card space-y-4 animate-fade-in">
              <button
                onClick={() => setStep('email')}
                className="btn-primary w-full"
              >
                メールアドレスで登録
              </button>

              <div className="text-center pt-4">
                <p className="text-gray-400 text-sm">
                  既にアカウントをお持ちの方は{' '}
                  <Link href="/auth/login" className="text-blue-400 hover:text-cyan-300 font-medium transition-colors">
                    ログイン
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* メール登録フォーム */}
          {step === 'email' && (
            <div className="card animate-slide-in-left">
              <button
                onClick={() => setStep('method')}
                className="text-gray-400 hover:text-white mb-6 text-sm transition-colors"
              >
                ← 戻る
              </button>

              <form onSubmit={handleEmailRegister} className="space-y-4">
                {error && (
                  <div className="bg-blue-500/20 border border-blue-500 text-blue-200 px-4 py-3 rounded-xl text-sm animate-slide-in-down">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    ユーザー名
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="プレイヤー名を入力"
                  />
                </div>

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
                      placeholder="8文字以上"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    パスワード（確認）
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="もう一度入力"
                  />
                </div>


                <div className="flex items-start space-x-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    <Link href="/compliance" className="text-blue-400 hover:text-cyan-300 transition-colors">
                      利用規約
                    </Link>
                    および
                    <Link href="/compliance" className="text-blue-400 hover:text-cyan-300 transition-colors">
                      プライバシーポリシー
                    </Link>
                    に同意します
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !acceptTerms}
                  className="btn-primary w-full"
                >
                  {loading ? '登録中...' : '登録する'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ホーム画面追加案内モーダル */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl max-w-md w-full border border-white/10 animate-scale-in">
            {/* ヘッダー */}
            <div className="p-6 border-b border-white/10">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="SIN JAPAN POKER"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">登録完了！🎉</h2>
                <p className="text-gray-400">ホーム画面にアプリを追加しましょう</p>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6">
              {deviceType === 'ios' && (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm mb-4">
                    ホーム画面にアイコンを追加すると、アプリのように簡単にアクセスできます。
                  </p>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div className="flex-1">
                        <p className="text-white text-sm">画面下部の <span className="font-semibold">共有ボタン</span> をタップ</p>
                        <p className="text-gray-400 text-xs mt-1">（四角に↑のアイコン）</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div className="flex-1">
                        <p className="text-white text-sm">「<span className="font-semibold">ホーム画面に追加</span>」を選択</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div className="flex-1">
                        <p className="text-white text-sm">右上の「<span className="font-semibold">追加</span>」をタップ</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {deviceType === 'android' && (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm mb-4">
                    ホーム画面にアイコンを追加すると、アプリのように簡単にアクセスできます。
                  </p>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div className="flex-1">
                        <p className="text-white text-sm">画面右上の <span className="font-semibold">︙</span> メニューをタップ</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div className="flex-1">
                        <p className="text-white text-sm">「<span className="font-semibold">ホーム画面に追加</span>」を選択</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div className="flex-1">
                        <p className="text-white text-sm">「<span className="font-semibold">追加</span>」をタップ</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {deviceType === 'desktop' && (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    デスクトップブラウザからご利用いただいています。<br />
                    モバイルデバイスからアクセスすると、ホーム画面に追加できます。
                  </p>
                </div>
              )}
            </div>

            {/* ボタン */}
            <div className="p-6 border-t border-white/10 space-y-3">
              <button
                onClick={() => {
                  setShowInstallGuide(false);
                  router.push('/auth/login');
                }}
                className="btn-primary w-full"
              >
                わかりました
              </button>
              <button
                onClick={() => {
                  setShowInstallGuide(false);
                  router.push('/auth/login');
                }}
                className="w-full px-6 py-3 text-gray-400 hover:text-white transition-colors text-sm"
              >
                後で追加する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}