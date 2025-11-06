'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Upload, X } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { saveUserProfile, loadUserProfile } from '@/lib/storage';

function EditProfileContent() {
  const router = useRouter();
  const { user: appUser, updateUserStats } = useAppStore();
  const { user: authUser, token } = useAuthStore();
  
  // メールアドレスはauthStoreから、その他の情報はappStoreから取得
  const user = {
    ...appUser,
    email: authUser?.email || appUser?.email,
    username: authUser?.username || appUser?.username,
    id: authUser?.id || appUser?.id
  };

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: '',
    address: '',
    birthday: '',
    bio: ''
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // LocalStorageからプロフィール情報を読み込み
    const savedProfile = loadUserProfile();
    if (savedProfile) {
      setProfileImage(savedProfile.uploadedAvatar || null);
      if (savedProfile.phone) setFormData(prev => ({ ...prev, phone: savedProfile.phone }));
      if (savedProfile.address) setFormData(prev => ({ ...prev, address: savedProfile.address }));
      if (savedProfile.birthday) setFormData(prev => ({ ...prev, birthday: savedProfile.birthday }));
      if (savedProfile.bio) setFormData(prev => ({ ...prev, bio: savedProfile.bio }));
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // プロフィール情報をLocalStorageに保存
      const profileData = {
        ...formData,
        uploadedAvatar: profileImage,
        lastUpdated: new Date().toISOString()
      };
      saveUserProfile(profileData);

      // 画像をデータベースに保存
      if (user?.id && profileImage && token) {
        const response = await fetch(`/api/user/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: profileImage }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Avatar save failed:', response.status, errorData);
          throw new Error('画像の保存に失敗しました');
        }

        // AuthStoreも更新
        const { updateUser } = useAuthStore.getState();
        updateUser({ avatar: profileImage });
      }

      // ユーザー名が変更された場合はストアも更新
      if (formData.username !== user?.username) {
        updateUserStats({ username: formData.username });
      }

      setSaveMessage('保存しました');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error) {
      console.error('保存エラー:', error);
      setSaveMessage('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/profile" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-gradient-blue">プロフィール編集</h1>
          </div>
          
          {saveMessage && (
            <div className={`px-4 py-2 rounded-lg ${
              saveMessage.includes('失敗') 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-green-500/20 text-green-400'
            }`}>
              {saveMessage}
            </div>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="card animate-fade-in">
          {/* プロフィール画像 */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-blue-400 mx-auto">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-3 rounded-full cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {profileImage && (
                <button
                  onClick={() => setProfileImage(null)}
                  className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 p-2 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-3">最大5MBまで</p>
          </div>

          {/* フォーム */}
          <div className="space-y-6">
            {/* ユーザー名 */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-400" />
                <span>ユーザー名</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                placeholder="ユーザー名を入力"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>メールアドレス</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                placeholder="email@example.com"
                disabled
              />
              <p className="text-gray-400 text-xs mt-1">メールアドレスは変更できません</p>
            </div>

            {/* 電話番号 */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>電話番号</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                placeholder="090-1234-5678"
              />
            </div>

            {/* 住所 */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>住所</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                placeholder="東京都渋谷区..."
              />
            </div>

            {/* 生年月日 */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>生年月日</span>
              </label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
              />
            </div>

            {/* 自己紹介 */}
            <div>
              <label className="block text-white font-semibold mb-2">自己紹介</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                placeholder="自己紹介を入力..."
                maxLength={200}
              />
              <p className="text-gray-400 text-xs mt-1 text-right">{formData.bio.length}/200</p>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="mt-8 flex space-x-4">
            <Link 
              href="/profile"
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-center"
            >
              キャンセル
            </Link>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="spinner-white w-5 h-5" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>保存</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="card-blue mt-6 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-white font-semibold mb-3">📌 注意事項</h3>
          <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
            <li>プロフィール画像は最大5MBまでアップロードできます</li>
            <li>メールアドレスは変更できません</li>
            <li>不適切な内容は削除される場合があります</li>
            <li>個人情報の入力は任意です</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfileContent />
    </ProtectedRoute>
  );
}

