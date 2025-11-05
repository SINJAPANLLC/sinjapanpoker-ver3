'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Coins, History, MessageCircle, Settings, Info, Shield, Mail, ShoppingCart, BarChart3, User, Receipt, Crown, Star, Trophy, Edit, Gamepad2, Award, Flame, Sparkles, Image, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AvatarSelector from '@/components/AvatarSelector';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { saveUserProfile, loadUserProfile, saveOwnedAvatars, loadOwnedAvatars } from '@/lib/storage';

function ProfileContent() {
  const { user: appUser } = useAppStore();
  const { user: authUser } = useAuthStore();
  const { currency } = useCurrencyStore();
  
  // メールアドレスはauthStoreから、その他の情報はappStoreから取得
  const user = {
    ...appUser,
    email: authUser?.email || appUser?.email,
    username: authUser?.username || appUser?.username,
    id: authUser?.id || appUser?.id
  };
  const [userStats, setUserStats] = useState<any>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState('default');
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [ownedAvatars, setOwnedAvatars] = useState<string[]>(['default']);
  const [profileData, setProfileData] = useState<any>(null);
  
  // 出金機能関連
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    branchName: '',
    accountType: 'savings',
    accountNumber: '',
    accountName: ''
  });
  const [cryptoInfo, setCryptoInfo] = useState({
    currency: 'BTC',
    walletAddress: '',
    network: 'BTC'
  });
  const [isRealMoneyEnabled, setIsRealMoneyEnabled] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [withdrawMessage, setWithdrawMessage] = useState('');

  // プロフィール情報を読み込む
  useEffect(() => {
    // LocalStorageからプロフィール情報を読み込み
    const savedProfile = loadUserProfile();
    if (savedProfile) {
      setCurrentAvatar(savedProfile.currentAvatar || 'default');
      setUploadedAvatar(savedProfile.uploadedAvatar || null);
      setProfileData(savedProfile);
    }

    // 所有アバターを読み込み
    const owned = loadOwnedAvatars();
    setOwnedAvatars(owned);

    if (user?.id) {
      // データベースからユーザー情報（avatar含む）を取得
      fetch(`/api/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setUserStats(data);
          // データベースからavatarを取得してstoreを更新
          if (data.avatar) {
            const { updateUser } = useAuthStore.getState();
            updateUser({ avatar: data.avatar });
            // LocalStorageのavatarも更新
            if (data.avatar.startsWith('data:')) {
              setUploadedAvatar(data.avatar);
              setCurrentAvatar('uploaded');
            } else {
              setCurrentAvatar(data.avatar);
            }
          }
        })
        .catch(err => console.error('Failed to fetch user stats:', err));
    }
  }, [user?.id]);

  // プロフィール情報が変更されたら保存
  useEffect(() => {
    const profile = {
      currentAvatar,
      uploadedAvatar,
      lastUpdated: new Date().toISOString()
    };
    saveUserProfile(profile);
    
    // データベースにも保存
    if (user?.id && (currentAvatar || uploadedAvatar)) {
      const avatarValue = currentAvatar === 'uploaded' ? uploadedAvatar : currentAvatar;
      fetch(`/api/user/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: avatarValue }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            console.log('✅ Avatar saved to database:', data.message);
          }
        })
        .catch(err => console.error('Failed to save avatar to database:', err));
    }
  }, [currentAvatar, uploadedAvatar, user?.id]);

  // 所有アバターが変更されたら保存
  useEffect(() => {
    if (ownedAvatars.length > 0) {
      saveOwnedAvatars(ownedAvatars);
    }
  }, [ownedAvatars]);

  // リアルマネーモードのチェック
  useEffect(() => {
    const realMoneyMode = localStorage.getItem('admin_real_money_mode');
    setIsRealMoneyEnabled(realMoneyMode === 'true');
    
    const handleStorageChange = () => {
      const newMode = localStorage.getItem('admin_real_money_mode');
      setIsRealMoneyEnabled(newMode === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      const currentMode = localStorage.getItem('admin_real_money_mode');
      if (currentMode !== (isRealMoneyEnabled ? 'true' : 'false')) {
        setIsRealMoneyEnabled(currentMode === 'true');
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isRealMoneyEnabled]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedAvatar(reader.result as string);
        setCurrentAvatar('uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWithdrawSubmit = async () => {
    // バリデーション
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawStatus('error');
      setWithdrawMessage('有効な金額を入力してください');
      return;
    }

    if (amount > (currency?.realChips || 0)) {
      setWithdrawStatus('error');
      setWithdrawMessage('残高が不足しています');
      return;
    }

    if (amount < 1000) {
      setWithdrawStatus('error');
      setWithdrawMessage('最小出金額は1000チップです');
      return;
    }

    // 銀行情報のバリデーション
    if (withdrawMethod === 'bank') {
      if (!bankInfo.bankName || !bankInfo.branchName || !bankInfo.accountNumber || !bankInfo.accountName) {
        setWithdrawStatus('error');
        setWithdrawMessage('すべての銀行情報を入力してください');
        return;
      }
    }

    // 仮想通貨情報のバリデーション
    if (withdrawMethod === 'crypto') {
      if (!cryptoInfo.walletAddress) {
        setWithdrawStatus('error');
        setWithdrawMessage('ウォレットアドレスを入力してください');
        return;
      }
      // アドレスの基本的なバリデーション
      if (cryptoInfo.walletAddress.length < 26) {
        setWithdrawStatus('error');
        setWithdrawMessage('有効なウォレットアドレスを入力してください');
        return;
      }
    }

    setWithdrawStatus('processing');
    setWithdrawMessage('出金申請を処理中...');

    try {
      // 実際の実装では、APIエンドポイントに出金申請を送信
      await new Promise(resolve => setTimeout(resolve, 2000)); // シミュレーション

      setWithdrawStatus('success');
      setWithdrawMessage(`${amount}チップの出金申請が完了しました。通常1-3営業日以内に処理されます。`);
      
      // 出金履歴をLocalStorageに保存
      const withdrawHistory = JSON.parse(localStorage.getItem('withdraw_history') || '[]');
      withdrawHistory.push({
        id: Date.now().toString(),
        amount,
        method: withdrawMethod,
        bankInfo: withdrawMethod === 'bank' ? bankInfo : null,
        cryptoInfo: withdrawMethod === 'crypto' ? cryptoInfo : null,
        status: 'pending',
        date: new Date().toISOString(),
        userId: user?.id
      });
      localStorage.setItem('withdraw_history', JSON.stringify(withdrawHistory));

      // モーダルを3秒後に閉じる
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawStatus('idle');
        setWithdrawMessage('');
      }, 3000);
    } catch (error) {
      setWithdrawStatus('error');
      setWithdrawMessage('出金申請中にエラーが発生しました。もう一度お試しください。');
    }
  };

  const profileFeatures = [
    { id: 'history', icon: <History className="w-6 h-6 text-blue-400" />, label: 'ハンド履歴', href: '/history' },
    { id: 'transactions', icon: <Receipt className="w-6 h-6 text-blue-400" />, label: '取引履歴', href: '/transactions' },
    { id: 'settings', icon: <Settings className="w-6 h-6 text-blue-400" />, label: '設定', href: '/settings' },
    { id: 'feedback', icon: <MessageCircle className="w-6 h-6 text-blue-400" />, label: 'ご意見箱', href: '/feedback' },
    { id: 'company', icon: <Info className="w-6 h-6 text-blue-400" />, label: '会社概要', href: '/company' },
    { id: 'compliance', icon: <Shield className="w-6 h-6 text-blue-400" />, label: '法令遵守', href: '/compliance' },
    { id: 'invite', icon: <Mail className="w-6 h-6 text-blue-400" />, label: '招待コード', href: '/invite' },
    { id: 'kyc', icon: <User className="w-6 h-6 text-blue-400" />, label: 'KYC認証', href: '/kyc' }
  ];

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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src="/logo.png"
              alt="SIN JAPAN POKER"
              className="w-32 h-10 object-contain"
            />
            <h1 className="text-base font-bold text-gradient-blue">プロファイル</h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* エネルギー */}
            <div className="flex items-center space-x-2 glass px-3 py-2 rounded-full hover-lift">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">{currency.energy}</span>
              <Link href="/purchase" className="text-blue-400 hover:text-cyan-300 text-xs">+</Link>
            </div>
            
            {/* チップ */}
            <div className="flex items-center space-x-2 glass px-3 py-2 rounded-full hover-lift">
              <img src="/chip-icon.png" alt="Chips" className="w-5 h-5 object-contain" />
              <span className="text-white font-semibold">{currency?.realChips?.toLocaleString() || '0'}</span>
              <Link href="/purchase" className="text-blue-400 hover:text-cyan-300 text-xs">+</Link>
            </div>
            
            {/* 出金（リアルマネーモード有効時のみ表示） */}
            {isRealMoneyEnabled && (
              <button 
                onClick={() => setShowWithdrawModal(true)}
                className="glass px-3 py-2 rounded-full hover-lift flex items-center space-x-2 group"
                title="出金"
              >
                <DollarSign className="w-5 h-5 text-green-400 group-hover:text-green-300" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* プロフィールカード */}
        <div className="card mb-8 animate-fade-in">
          <div className="text-center">
            {/* アバター */}
            <div className="relative inline-block mb-6">
              <div 
                className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-black border-4 border-blue-400 overflow-hidden mx-auto animate-glow"
              >
                {uploadedAvatar && currentAvatar === 'uploaded' ? (
                  <img src={uploadedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    {currentAvatar === 'default' ? <Award className="w-20 h-20" /> : 
                     currentAvatar === 'poker1' ? <Trophy className="w-20 h-20" /> :
                     currentAvatar === 'poker2' ? <Zap className="w-20 h-20" /> :
                     currentAvatar === 'lucky' ? <Star className="w-20 h-20" /> :
                     currentAvatar === 'diamond' ? <Crown className="w-20 h-20" /> :
                     currentAvatar === 'crown' ? <Crown className="w-20 h-20" /> :
                     currentAvatar === 'fire' ? <Flame className="w-20 h-20" /> :
                     currentAvatar === 'rainbow' ? <Sparkles className="w-20 h-20" /> :
                     currentAvatar === 'star' ? <Star className="w-20 h-20 fill-current" /> : <Award className="w-20 h-20" />}
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <label className="bg-black/50 rounded-full p-1 cursor-pointer hover:bg-black/70 transition">
                    <Image className="w-4 h-4 text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      className="hidden"
                    />
                  </label>
                  <button 
                    onClick={() => setShowAvatarSelector(true)}
                    className="bg-black/50 rounded-full p-1 hover:bg-black/70 transition"
                  >
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 badge-primary px-4 py-1">
                Lv. {user?.level || 1}
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              {profileData?.username || user?.username || 'Player'}
            </h2>
            <p className="text-gray-400 mb-4">{user?.email || 'メールアドレス未設定'}</p>
            {profileData?.bio && (
              <p className="text-gray-300 text-sm max-w-md mx-auto mb-4">{profileData.bio}</p>
            )}

            <div className="flex justify-center items-center space-x-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient-blue">
                  {userStats?.totalGamesPlayed || 0}
                </div>
                <div className="text-gray-500 text-sm">総ゲーム数</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient-blue">
                  {userStats?.totalGamesPlayed > 0 
                    ? ((userStats.totalWins / userStats.totalGamesPlayed) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-gray-500 text-sm">勝率</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient-blue">
                  ${userStats?.totalEarnings?.toFixed(2) || '0.00'}
                </div>
                <div className="text-gray-500 text-sm">総獲得</div>
              </div>
            </div>

            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 text-yellow-500" />
              ))}
            </div>
          </div>
        </div>

        {/* 機能ボタングリッド */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          {profileFeatures.map((feature) => (
            <Link
              key={feature.id}
              href={feature.href}
              className="card hover-lift hover-glow group text-center"
            >
              <div className="mb-3">
                {feature.icon}
              </div>
              <div className="text-white text-sm font-medium">{feature.label}</div>
            </Link>
          ))}
        </div>

        {/* 実績・称号 */}
        <div className="mt-8 card animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>実績・称号</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: '初勝利', icon: <Award className="w-12 h-12" />, unlocked: true, color: 'text-blue-400' },
              { name: '連勝王', icon: <Flame className="w-12 h-12" />, unlocked: true, color: 'text-blue-400' },
              { name: 'ハイローラー', icon: <Sparkles className="w-12 h-12" />, unlocked: false, color: 'text-gray-600' },
              { name: 'レジェンド', icon: <Crown className="w-12 h-12" />, unlocked: false, color: 'text-gray-600' }
            ].map((achievement, i) => (
              <div
                key={i}
                className={`glass-strong rounded-xl p-6 text-center transition-all ${
                  achievement.unlocked ? 'border border-blue-400/30 hover-lift' : 'opacity-50'
                }`}
              >
                <div className={`mb-3 flex justify-center ${achievement.color}`}>
                  {achievement.icon}
                </div>
                <div className="text-white text-sm font-medium">{achievement.name}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 p-6 z-20">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link href="/shop" prefetch={true} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-blue-400 active:text-blue-500 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">ショップ</span>
          </Link>
          <Link href="/forum" prefetch={true} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-blue-400 active:text-blue-500 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">フォーラム</span>
          </Link>
          <Link href="/lobby" prefetch={true} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-blue-400 active:text-blue-500 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">ロビー</span>
          </Link>
          <Link href="/career" prefetch={true} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-blue-400 active:text-blue-500 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">キャリア</span>
          </Link>
          <Link href="/profile" prefetch={true} className="flex flex-col items-center space-y-1 text-blue-400 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
            </div>
            <span className="text-sm font-semibold">プロフ</span>
          </Link>
        </div>
      </nav>

      {/* 出金モーダル */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* ヘッダー */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <DollarSign className="text-green-400" />
                  <span>出金申請</span>
                </h2>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6">
              <div className="space-y-6">
                  {/* ステータスメッセージ */}
                  {withdrawStatus !== 'idle' && (
                    <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                      withdrawStatus === 'success' ? 'bg-green-900/30 border border-green-500/30 text-green-300' :
                      withdrawStatus === 'error' ? 'bg-red-900/30 border border-red-500/30 text-red-300' :
                      'bg-blue-900/30 border border-blue-500/30 text-blue-300'
                    }`}>
                      {withdrawStatus === 'success' && <CheckCircle className="w-5 h-5" />}
                      {withdrawStatus === 'error' && <AlertCircle className="w-5 h-5" />}
                      {withdrawStatus === 'processing' && <div className="spinner-white w-5 h-5" />}
                      <span>{withdrawMessage}</span>
                    </div>
                  )}

                  {/* 現在の残高 */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">現在の残高</div>
                    <div className="text-3xl font-bold text-white flex items-center space-x-2">
                      <img src="/chip-icon.png" alt="Chips" className="w-8 h-8 object-contain" />
                      <span>{(currency?.realChips || 0).toLocaleString()}</span>
                      <span className="text-sm text-gray-400">チップ</span>
                    </div>
                  </div>

                  {/* 出金額 */}
                  <div>
                    <label className="block text-white font-semibold mb-2">出金額</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="1000チップ以上"
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                      min="1000"
                      disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                    />
                    <p className="text-gray-400 text-xs mt-1">最小出金額: 1,000チップ</p>
                  </div>

                  {/* 出金方法 */}
                  <div>
                    <label className="block text-white font-semibold mb-2">出金方法</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setWithdrawMethod('bank')}
                        disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          withdrawMethod === 'bank'
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-white font-semibold">銀行振込</div>
                      </button>
                      <button
                        onClick={() => setWithdrawMethod('crypto')}
                        disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          withdrawMethod === 'crypto'
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-white font-semibold">仮想通貨</div>
                      </button>
                    </div>
                  </div>

                  {/* 銀行情報入力 */}
                  {withdrawMethod === 'bank' && (
                    <div className="space-y-4 bg-gray-800/30 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-3">銀行情報</h3>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">銀行名</label>
                        <input
                          type="text"
                          value={bankInfo.bankName}
                          onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})}
                          placeholder="例: 三菱UFJ銀行"
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-sm"
                          disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm mb-1">支店名</label>
                        <input
                          type="text"
                          value={bankInfo.branchName}
                          onChange={(e) => setBankInfo({...bankInfo, branchName: e.target.value})}
                          placeholder="例: 新宿支店"
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-sm"
                          disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm mb-1">口座種別</label>
                        <select
                          value={bankInfo.accountType}
                          onChange={(e) => setBankInfo({...bankInfo, accountType: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-sm"
                          disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                        >
                          <option value="savings">普通</option>
                          <option value="checking">当座</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm mb-1">口座番号</label>
                        <input
                          type="text"
                          value={bankInfo.accountNumber}
                          onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                          placeholder="7桁の数字"
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-sm"
                          disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm mb-1">口座名義（カタカナ）</label>
                        <input
                          type="text"
                          value={bankInfo.accountName}
                          onChange={(e) => setBankInfo({...bankInfo, accountName: e.target.value})}
                          placeholder="例: ヤマダタロウ"
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-sm"
                          disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                        />
                      </div>
                    </div>
                  )}

                  {/* 仮想通貨情報入力 */}
                  {withdrawMethod === 'crypto' && (
                    <div className="space-y-4 bg-gray-800/30 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-3">仮想通貨情報</h3>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">通貨選択</label>
                        <select
                          value={cryptoInfo.currency}
                          onChange={(e) => {
                            const newCurrency = e.target.value;
                            setCryptoInfo({
                              ...cryptoInfo, 
                              currency: newCurrency,
                              network: newCurrency === 'USDT' || newCurrency === 'USDC' ? 'ERC20' : newCurrency
                            });
                          }}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-sm"
                          disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                        >
                          <option value="BTC">Bitcoin (BTC)</option>
                          <option value="ETH">Ethereum (ETH)</option>
                          <option value="USDT">Tether (USDT)</option>
                          <option value="USDC">USD Coin (USDC)</option>
                          <option value="LTC">Litecoin (LTC)</option>
                        </select>
                      </div>

                      {(cryptoInfo.currency === 'USDT' || cryptoInfo.currency === 'USDC') && (
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">ネットワーク</label>
                          <select
                            value={cryptoInfo.network}
                            onChange={(e) => setCryptoInfo({...cryptoInfo, network: e.target.value})}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-sm"
                            disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                          >
                            <option value="ERC20">ERC20 (Ethereum)</option>
                            <option value="TRC20">TRC20 (Tron)</option>
                            <option value="BEP20">BEP20 (BSC)</option>
                          </select>
                          <p className="text-yellow-400 text-xs mt-1">
                            ⚠️ 必ず正しいネットワークを選択してください
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-gray-300 text-sm mb-1">
                          ウォレットアドレス
                        </label>
                        <input
                          type="text"
                          value={cryptoInfo.walletAddress}
                          onChange={(e) => setCryptoInfo({...cryptoInfo, walletAddress: e.target.value})}
                          placeholder={
                            cryptoInfo.currency === 'BTC' ? '例: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' :
                            cryptoInfo.currency === 'ETH' ? '例: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' :
                            '受取アドレスを入力'
                          }
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-sm font-mono"
                          disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                        />
                        <p className="text-gray-400 text-xs mt-1">
                          間違ったアドレスに送金すると資金を失う可能性があります
                        </p>
                      </div>

                      <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                        <h5 className="text-orange-400 font-semibold text-sm mb-1">重要な確認事項</h5>
                        <ul className="text-gray-300 text-xs space-y-1">
                          <li>• アドレスは必ずコピー&ペーストしてください</li>
                          <li>• {cryptoInfo.currency}ネットワークのアドレスであることを確認してください</li>
                          <li>• 最低出金額: 1,000チップ（≈ {cryptoInfo.currency === 'BTC' ? '0.001 BTC' : cryptoInfo.currency === 'ETH' ? '0.01 ETH' : '10 USDT'}）</li>
                          <li>• ネットワーク手数料が別途かかります</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 注意事項 */}
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">注意事項</h4>
                    <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                      <li>出金には手数料がかかる場合があります</li>
                      <li>通常1-3営業日以内に処理されます</li>
                      <li>本人確認（KYC）が必要な場合があります</li>
                      <li>出金申請後のキャンセルはできません</li>
                    </ul>
                  </div>

                  {/* 申請ボタン */}
                  <button
                    onClick={handleWithdrawSubmit}
                    disabled={withdrawStatus === 'processing' || withdrawStatus === 'success'}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {withdrawStatus === 'processing' ? '処理中...' : withdrawStatus === 'success' ? '申請完了' : '出金申請'}
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* アバターセレクター */}
      <AvatarSelector
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        currentAvatar={currentAvatar}
        onSelectAvatar={setCurrentAvatar}
        userCurrency={{ chips: currency?.realChips || 0, diamonds: currency?.diamonds || 0 }}
        ownedAvatars={ownedAvatars}
        onPurchaseAvatar={(avatarId) => {
          if (!ownedAvatars.includes(avatarId)) {
            setOwnedAvatars([...ownedAvatars, avatarId]);
          }
        }}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}