'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';

function ChangePasswordContent() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const validatePassword = (password: string): string[] => {
    const validationErrors: string[] = [];

    if (password.length < 8) {
      validationErrors.push('パスワードは8文字以上にしてください');
    }
    if (!/[A-Z]/.test(password)) {
      validationErrors.push('大文字を1文字以上含めてください');
    }
    if (!/[a-z]/.test(password)) {
      validationErrors.push('小文字を1文字以上含めてください');
    }
    if (!/[0-9]/.test(password)) {
      validationErrors.push('数字を1文字以上含めてください');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      validationErrors.push('特殊文字(!@#$%^&*)を1文字以上含めてください');
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setMessage('');
    setErrors([]);

    // バリデーション
    if (!formData.currentPassword) {
      setStatus('error');
      setMessage('現在のパスワードを入力してください');
      return;
    }

    if (!formData.newPassword) {
      setStatus('error');
      setMessage('新しいパスワードを入力してください');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus('error');
      setMessage('新しいパスワードが一致しません');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setStatus('error');
      setMessage('新しいパスワードは現在のパスワードと異なるものにしてください');
      return;
    }

    // パスワード強度チェック
    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      setStatus('error');
      setErrors(passwordErrors);
      setMessage('パスワードが要件を満たしていません');
      return;
    }

    setStatus('processing');
    setMessage('パスワードを変更しています...');

    try {
      // 実際の実装では、APIエンドポイントにパスワード変更リクエストを送信
      await new Promise(resolve => setTimeout(resolve, 2000)); // シミュレーション

      // LocalStorageにパスワード変更履歴を保存（実際はサーバー側で処理）
      const passwordHistory = JSON.parse(localStorage.getItem('password_history') || '[]');
      passwordHistory.push({
        userId: user?.id,
        changedAt: new Date().toISOString(),
        ipAddress: 'xxx.xxx.xxx.xxx' // 実際はサーバー側で取得
      });
      localStorage.setItem('password_history', JSON.stringify(passwordHistory));

      setStatus('success');
      setMessage('パスワードが正常に変更されました');

      // フォームをクリア
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // 3秒後に設定ページにリダイレクト
      setTimeout(() => {
        router.push('/settings');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage('パスワードの変更に失敗しました。もう一度お試しください。');
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*]/.test(password)) strength += 15;

    let label = '';
    let color = '';

    if (strength < 40) {
      label = '弱い';
      color = 'bg-red-500';
    } else if (strength < 70) {
      label = '普通';
      color = 'bg-yellow-500';
    } else {
      label = '強い';
      color = 'bg-green-500';
    }

    return { strength, label, color };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-4 animate-slide-in-down">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <Link href="/settings" className="text-blue-400 hover:text-cyan-300">
            <ArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gradient-blue">パスワード変更</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 pb-24">
        <div className="card animate-fade-in">
          {/* ステータスメッセージ */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
              status === 'success' ? 'bg-green-900/30 border border-green-500/30' :
              status === 'error' ? 'bg-red-900/30 border border-red-500/30' :
              'bg-blue-900/30 border border-blue-500/30'
            }`}>
              {status === 'success' && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />}
              {status === 'error' && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
              {status === 'processing' && <div className="spinner-white w-5 h-5 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className={`font-semibold ${
                  status === 'success' ? 'text-green-300' :
                  status === 'error' ? 'text-red-300' :
                  'text-blue-300'
                }`}>
                  {message}
                </p>
                {errors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-300 space-y-1 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 現在のパスワード */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>現在のパスワード</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                  placeholder="現在のパスワードを入力"
                  disabled={status === 'processing' || status === 'success'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 新しいパスワード */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>新しいパスワード</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                  placeholder="新しいパスワードを入力"
                  disabled={status === 'processing' || status === 'success'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* パスワード強度インジケーター */}
              {formData.newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">パスワード強度</span>
                    <span className={`text-sm font-semibold ${
                      passwordStrength.strength < 40 ? 'text-red-400' :
                      passwordStrength.strength < 70 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>パスワード確認</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                  placeholder="新しいパスワードを再入力"
                  disabled={status === 'processing' || status === 'success'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* パスワード一致チェック */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center space-x-2">
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">パスワードが一致しています</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400">パスワードが一致しません</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 変更ボタン */}
            <div className="flex space-x-4 pt-4">
              <Link 
                href="/settings"
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-center"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={status === 'processing' || status === 'success'}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'processing' ? '変更中...' : status === 'success' ? '変更完了' : 'パスワード変更'}
              </button>
            </div>
          </form>
        </div>

        {/* パスワード要件 */}
        <div className="card-blue mt-6 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-400" />
            <span>パスワード要件</span>
          </h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>8文字以上の長さ</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>大文字を1文字以上含む (A-Z)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>小文字を1文字以上含む (a-z)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>数字を1文字以上含む (0-9)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>特殊文字を1文字以上含む (!@#$%^&*)</span>
            </li>
          </ul>
        </div>

        {/* セキュリティのヒント */}
        <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-yellow-400 font-semibold mb-2">💡 セキュリティのヒント</h3>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>誕生日や電話番号など、推測しやすいパスワードは避けてください</li>
            <li>他のサービスと同じパスワードを使用しないでください</li>
            <li>定期的にパスワードを変更することをお勧めします</li>
            <li>パスワードは誰にも教えないでください</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ChangePasswordContent />
    </ProtectedRoute>
  );
}

