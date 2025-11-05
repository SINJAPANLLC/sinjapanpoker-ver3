'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Volume2, VolumeX, Bell, BellOff, Shield, User, Globe, Palette, Save, RotateCcw } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function SettingsContent() {
  const [settings, setSettings] = useState({
    sound: true,
    music: true,
    notifications: true,
    vibration: true,
    autoPlay: false,
    showCards: true,
    showAnimations: true,
    language: 'ja',
    theme: 'dark',
    privacy: 'friends'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // LocalStorageから設定を読み込み
    const savedSettings = localStorage.getItem('game_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('game_settings', JSON.stringify(settings));
      await new Promise(resolve => setTimeout(resolve, 1000)); // シミュレーション
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      sound: true,
      music: true,
      notifications: true,
      vibration: true,
      autoPlay: false,
      showCards: true,
      showAnimations: true,
      language: 'ja',
      theme: 'dark',
      privacy: 'friends'
    };
    setSettings(defaultSettings);
  };

  const settingCategories = [
    {
      title: '音声設定',
      icon: <Volume2 className="w-5 h-5" />,
      settings: [
        {
          key: 'sound',
          label: '効果音',
          description: 'ゲーム中の効果音を再生する',
          type: 'toggle'
        },
        {
          key: 'music',
          label: 'BGM',
          description: 'バックグラウンドミュージックを再生する',
          type: 'toggle'
        }
      ]
    },
    {
      title: '通知設定',
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          key: 'notifications',
          label: 'プッシュ通知',
          description: 'ゲームの通知を受け取る',
          type: 'toggle'
        },
        {
          key: 'vibration',
          label: 'バイブレーション',
          description: '通知時にバイブレーションする',
          type: 'toggle'
        }
      ]
    },
    {
      title: 'ゲーム設定',
      icon: <Settings className="w-5 h-5" />,
      settings: [
        {
          key: 'autoPlay',
          label: 'オートプレイ',
          description: '自動的にアクションを選択する',
          type: 'toggle'
        },
        {
          key: 'showCards',
          label: 'カード表示',
          description: '相手のカードを表示する',
          type: 'toggle'
        },
        {
          key: 'showAnimations',
          label: 'アニメーション',
          description: 'カードやチップのアニメーションを表示する',
          type: 'toggle'
        }
      ]
    },
    {
      title: 'プライバシー',
      icon: <Shield className="w-5 h-5" />,
      settings: [
        {
          key: 'privacy',
          label: 'プロフィール表示',
          description: 'プロフィールの表示範囲',
          type: 'select',
          options: [
            { value: 'public', label: '公開' },
            { value: 'friends', label: 'フレンドのみ' },
            { value: 'private', label: '非公開' }
          ]
        }
      ]
    },
    {
      title: '言語・テーマ',
      icon: <Globe className="w-5 h-5" />,
      settings: [
        {
          key: 'language',
          label: '言語',
          description: '表示言語を選択',
          type: 'select',
          options: [
            { value: 'ja', label: '日本語' },
            { value: 'en', label: 'English' },
            { value: 'ko', label: '한국어' }
          ]
        },
        {
          key: 'theme',
          label: 'テーマ',
          description: '画面のテーマを選択',
          type: 'select',
          options: [
            { value: 'dark', label: 'ダーク' },
            { value: 'light', label: 'ライト' },
            { value: 'auto', label: '自動' }
          ]
        }
      ]
    }
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/lobby" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
          </div>
          
          {/* 保存ボタン */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-600/40 to-gray-700/40 hover:from-gray-500/50 hover:to-gray-600/50 rounded-lg text-white transition-all border border-gray-500/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>リセット</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600/40 to-blue-700/40 hover:from-blue-500/50 hover:to-blue-600/50 rounded-lg text-white transition-all border border-blue-500/30 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? '保存中...' : '保存'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* 保存ステータス */}
        {saveStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500/30 text-green-300 rounded-lg animate-fade-in">
            ✅ 設定が保存されました
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-lg animate-fade-in">
            ❌ 設定の保存に失敗しました
          </div>
        )}

        {/* 設定カテゴリ */}
        <div className="space-y-6">
          {settingCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="card-blue animate-fade-in" style={{ animationDelay: `${categoryIndex * 0.1}s` }}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  {category.icon}
                </div>
                <h2 className="text-xl font-bold text-white">{category.title}</h2>
              </div>

              <div className="space-y-4">
                {category.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-blue-700/10 rounded-lg border border-blue-400/20">
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">{setting.label}</div>
                      <div className="text-gray-400 text-sm">{setting.description}</div>
                    </div>
                    
                    <div className="ml-4">
                      {setting.type === 'toggle' ? (
                        <button
                          onClick={() => handleSettingChange(setting.key, !settings[setting.key as keyof typeof settings])}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings[setting.key as keyof typeof settings] 
                              ? 'bg-blue-500' 
                              : 'bg-gray-600'
                          }`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings[setting.key as keyof typeof settings] 
                              ? 'translate-x-6' 
                              : 'translate-x-0.5'
                          }`} />
                        </button>
                      ) : setting.type === 'select' ? (
                        <select
                          value={settings[setting.key as keyof typeof settings] as string}
                          onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                          className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        >
                          {'options' in setting && setting.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* アカウント設定 */}
        <div className="card-blue animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">アカウント設定</h2>
          </div>

          <div className="space-y-4">
            <Link href="/profile/edit" className="block">
              <button className="w-full text-left p-4 bg-gradient-to-r from-blue-500/10 to-blue-700/10 hover:from-blue-400/20 hover:to-blue-600/20 rounded-lg border border-blue-400/20 hover:border-blue-300/40 transition-all">
                <div className="text-white font-medium">プロフィール編集</div>
                <div className="text-gray-400 text-sm">ユーザー名やアバターを変更</div>
              </button>
            </Link>
            
            <Link href="/password/change" className="block">
              <button className="w-full text-left p-4 bg-gradient-to-r from-blue-500/10 to-blue-700/10 hover:from-blue-400/20 hover:to-blue-600/20 rounded-lg border border-blue-400/20 hover:border-blue-300/40 transition-all">
                <div className="text-white font-medium">パスワード変更</div>
                <div className="text-gray-400 text-sm">アカウントのパスワードを変更</div>
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 p-6 z-20">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link href="/lobby" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">ロビー</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">プロフ</span>
          </Link>
          <Link href="/career" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">キャリア</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}