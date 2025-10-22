'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  Shield, 
  ArrowLeft, 
  Settings, 
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Server,
  Database,
  Mail,
  Bell,
  Lock,
  Globe,
  Zap,
  Shield as SecurityIcon,
  Users,
  DollarSign,
  Gamepad2,
  BarChart3
} from 'lucide-react';

interface SystemSettings {
  id: string;
  category: string;
  name: string;
  description: string;
  value: any;
  type: 'boolean' | 'number' | 'string' | 'select';
  options?: { value: any; label: string }[];
  icon: any;
}

function SystemSettingsContent() {
  const router = useRouter();
  const { adminUser } = useAdminStore();
  
  const [settings, setSettings] = useState<SystemSettings[]>([
    // ゲーム設定
    {
      id: 'game_rake_percentage',
      category: 'game',
      name: 'レーキ率',
      description: 'テーブルゲームでのレーキ率（%）',
      value: 5,
      type: 'number',
      icon: Gamepad2
    },
    {
      id: 'tournament_fee_percentage',
      category: 'game',
      name: 'トーナメント手数料率',
      description: 'トーナメント参加時の手数料率（%）',
      value: 10,
      type: 'number',
      icon: Gamepad2
    },
    {
      id: 'max_players_per_table',
      category: 'game',
      name: 'テーブル最大人数',
      description: '1つのテーブルの最大プレイヤー数',
      value: 9,
      type: 'number',
      icon: Users
    },
    {
      id: 'auto_disconnect_timeout',
      category: 'game',
      name: '自動切断タイムアウト',
      description: 'プレイヤーの自動切断までの時間（分）',
      value: 15,
      type: 'number',
      icon: Zap
    },

    // システム設定
    {
      id: 'maintenance_mode',
      category: 'system',
      name: 'メンテナンスモード',
      description: 'システムメンテナンス中のアクセス制限',
      value: false,
      type: 'boolean',
      icon: Server
    },
    {
      id: 'registration_enabled',
      category: 'system',
      name: '新規登録許可',
      description: '新規ユーザーの登録を許可する',
      value: true,
      type: 'boolean',
      icon: Users
    },
    {
      id: 'default_currency',
      category: 'system',
      name: 'デフォルト通貨',
      description: '新規ユーザーの初期通貨',
      value: 'JPY',
      type: 'select',
      options: [
        { value: 'JPY', label: '日本円 (¥)' },
        { value: 'USD', label: '米ドル ($)' },
        { value: 'EUR', label: 'ユーロ (€)' }
      ],
      icon: DollarSign
    },
    {
      id: 'session_timeout',
      category: 'system',
      name: 'セッションタイムアウト',
      description: 'ユーザーセッションの有効期限（時間）',
      value: 24,
      type: 'number',
      icon: Lock
    },

    // 通知設定
    {
      id: 'email_notifications',
      category: 'notifications',
      name: 'メール通知',
      description: 'システムメール通知の送信',
      value: true,
      type: 'boolean',
      icon: Mail
    },
    {
      id: 'push_notifications',
      category: 'notifications',
      name: 'プッシュ通知',
      description: 'ブラウザプッシュ通知の送信',
      value: true,
      type: 'boolean',
      icon: Bell
    },
    {
      id: 'tournament_reminders',
      category: 'notifications',
      name: 'トーナメントリマインダー',
      description: 'トーナメント開始前の通知',
      value: true,
      type: 'boolean',
      icon: Bell
    },

    // セキュリティ設定
    {
      id: 'two_factor_required',
      category: 'security',
      name: '二要素認証必須',
      description: 'Adminユーザーの二要素認証を必須にする',
      value: false,
      type: 'boolean',
      icon: SecurityIcon
    },
    {
      id: 'password_min_length',
      category: 'security',
      name: 'パスワード最小長',
      description: 'ユーザーパスワードの最小文字数',
      value: 8,
      type: 'number',
      icon: Lock
    },
    {
      id: 'max_login_attempts',
      category: 'security',
      name: '最大ログイン試行回数',
      description: 'アカウントロック前の最大ログイン試行回数',
      value: 5,
      type: 'number',
      icon: SecurityIcon
    },

    // 分析設定
    {
      id: 'analytics_enabled',
      category: 'analytics',
      name: '分析データ収集',
      description: 'ユーザー行動の分析データを収集する',
      value: true,
      type: 'boolean',
      icon: BarChart3
    },
    {
      id: 'data_retention_days',
      category: 'analytics',
      name: 'データ保持期間',
      description: '分析データの保持期間（日）',
      value: 365,
      type: 'number',
      icon: Database
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'すべて', icon: Settings },
    { id: 'game', name: 'ゲーム設定', icon: Gamepad2 },
    { id: 'system', name: 'システム設定', icon: Server },
    { id: 'notifications', name: '通知設定', icon: Bell },
    { id: 'security', name: 'セキュリティ', icon: SecurityIcon },
    { id: 'analytics', name: '分析設定', icon: BarChart3 }
  ];

  const filteredSettings = selectedCategory === 'all' 
    ? settings 
    : settings.filter(setting => setting.category === selectedCategory);

  const handleSettingChange = (settingId: string, value: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, value }
        : setting
    ));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 2000)); // モック遅延
      
      setMessage('設定が保存されました');
      setMessageType('success');
    } catch (error) {
      setMessage('設定の保存に失敗しました');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    // デフォルト値にリセット
    setSettings(prev => prev.map(setting => ({
      ...setting,
      value: setting.id === 'game_rake_percentage' ? 5 :
             setting.id === 'tournament_fee_percentage' ? 10 :
             setting.id === 'max_players_per_table' ? 9 :
             setting.id === 'auto_disconnect_timeout' ? 15 :
             setting.id === 'maintenance_mode' ? false :
             setting.id === 'registration_enabled' ? true :
             setting.id === 'default_currency' ? 'JPY' :
             setting.id === 'session_timeout' ? 24 :
             setting.id === 'email_notifications' ? true :
             setting.id === 'push_notifications' ? true :
             setting.id === 'tournament_reminders' ? true :
             setting.id === 'two_factor_required' ? false :
             setting.id === 'password_min_length' ? 8 :
             setting.id === 'max_login_attempts' ? 5 :
             setting.id === 'analytics_enabled' ? true :
             setting.id === 'data_retention_days' ? 365 :
             setting.value
    })));
    
    setMessage('設定がリセットされました');
    setMessageType('success');
  };

  const renderSettingInput = (setting: SystemSettings) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <button
            onClick={() => handleSettingChange(setting.id, !setting.value)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              setting.value 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <span className="text-sm font-medium">
              {setting.value ? '有効' : '無効'}
            </span>
          </button>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      
      case 'string':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">システム設定</h1>
                  <p className="text-gray-400 text-sm">システム全体の設定管理</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleResetSettings}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>リセット</span>
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>保存</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            messageType === 'success' 
              ? 'bg-green-500/10 border border-green-500/20' 
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <span className={messageType === 'success' ? 'text-green-400' : 'text-red-400'}>
              {message}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* カテゴリ選択 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
              <h2 className="text-lg font-bold text-white mb-4">カテゴリ</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <category.icon className="w-5 h-5" />
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 設定一覧 */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-xl font-bold text-white">
                  {categories.find(c => c.id === selectedCategory)?.name || 'すべての設定'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {filteredSettings.length}件の設定項目
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {filteredSettings.map((setting) => (
                    <div key={setting.id} className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-gray-600/50 rounded-lg">
                            <setting.icon className="w-6 h-6 text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-1">{setting.name}</h3>
                            <p className="text-gray-400 text-sm">{setting.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                          {renderSettingInput(setting)}
                        </div>
                        <div className="lg:col-span-1">
                          <div className="bg-gray-600/30 rounded-lg p-3">
                            <p className="text-gray-400 text-xs mb-1">カテゴリ</p>
                            <p className="text-white text-sm font-medium">
                              {categories.find(c => c.id === setting.category)?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SystemSettingsPage() {
  return (
    <AdminProtectedRoute requiredPermission="settings.manage">
      <SystemSettingsContent />
    </AdminProtectedRoute>
  );
}
