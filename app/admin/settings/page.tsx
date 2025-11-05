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
  
  const [settings, setSettings] = useState<SystemSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // アイコンを追加
        const settingsWithIcons = data.settings.map((s: any) => ({
          ...s,
          icon: getCategoryIcon(s.category),
        }));
        setSettings(settingsWithIcons);
      } else {
        setMessage('設定の取得に失敗しました');
        setMessageType('error');
      }
    } catch (error) {
      console.error('設定取得エラー:', error);
      setMessage('設定の取得に失敗しました');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'game':
        return Gamepad2;
      case 'system':
        return Server;
      case 'security':
        return SecurityIcon;
      case 'notifications':
        return Bell;
      case 'analytics':
        return BarChart3;
      default:
        return Settings;
    }
  };

  const handleSaveSetting = async (settingId: string, value: any) => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settingId, value }),
      });

      if (response.ok) {
        setMessage('設定を保存しました');
        setMessageType('success');
        fetchSettings(); // リロード
      } else {
        const error = await response.json();
        setMessage(error.message || '設定の保存に失敗しました');
        setMessageType('error');
      }
    } catch (error) {
      console.error('設定保存エラー:', error);
      setMessage('設定の保存に失敗しました');
      setMessageType('error');
    }
  };

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
    // 自動保存
    handleSaveSetting(settingId, value);
  };

  const handleResetSettings = async () => {
    if (!confirm('すべての設定をデフォルト値にリセットしますか？')) {
      return;
    }
    fetchSettings(); // リロードしてデフォルトを取得
  };

  const handleOldReset = () => {
    // デフォルト値にリセット（削除）
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
                onClick={() => {
                  setMessage('設定は変更時に自動保存されています');
                  setMessageType('success');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>自動保存済み</span>
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
