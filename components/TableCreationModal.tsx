'use client';

import { useState } from 'react';
import { X, Users, Lock, Unlock, Share2, Copy, QrCode } from 'lucide-react';

interface TableCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTable: (tableData: TableData) => void;
  isAdmin?: boolean;
}

interface TableData {
  id?: string;
  name: string;
  type: 'cash' | 'tournament' | 'sit-and-go';
  buyIn: number;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  description?: string;
  settings: {
    blinds: { small: number; big: number };
    timeLimit: number;
    rebuyAllowed: boolean;
    addonAllowed: boolean;
  };
}

export default function TableCreationModal({
  isOpen,
  onClose,
  onCreateTable,
  isAdmin = false
}: TableCreationModalProps) {
  const [formData, setFormData] = useState<TableData>({
    name: '',
    type: 'cash',
    buyIn: 1000,
    maxPlayers: 9,
    isPrivate: false,
    password: '',
    description: '',
    settings: {
      blinds: { small: 10, big: 20 },
      timeLimit: 15,
      rebuyAllowed: false,
      addonAllowed: false
    }
  });

  const [step, setStep] = useState(1);
  const [createdTable, setCreatedTable] = useState<TableData | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  const handleSubmit = () => {
    const tableData = { ...formData };
    if (!tableData.isPrivate) {
      delete tableData.password;
    }
    
    // 一意のテーブルIDを生成
    const tableId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    tableData.id = tableId;
    
    setCreatedTable(tableData);
    setShareUrl(`${window.location.origin}/game/active?table=${tableId}`);
    setStep(2);
    onCreateTable(tableData);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    // トースト通知など
  };

  const handleCopyQRCode = () => {
    // QRコード生成処理
    console.log('QR Code generated for:', shareUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">
            {step === 1 ? 'テーブル作成' : 'テーブル作成完了'}
          </h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="text-xl" />
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {step === 1 ? (
            <div className="space-y-6">
              {/* テーブル名 */}
              <div>
                <label className="block text-white font-semibold mb-2">テーブル名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="テーブル名を入力..."
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                />
              </div>

              {/* ゲームタイプ */}
              <div>
                <label className="block text-white font-semibold mb-2">ゲームタイプ</label>
                {!isAdmin && (
                  <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                    ⚠️ トーナメントとシット&ゴーは管理者のみ作成できます
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'cash', label: 'キャッシュゲーム', icon: '💰', adminOnly: false },
                    { value: 'tournament', label: 'トーナメント', icon: '🏆', adminOnly: true },
                    { value: 'sit-and-go', label: 'シット&ゴー', icon: '⚡', adminOnly: true }
                  ].map((type) => {
                    const isDisabled = type.adminOnly && !isAdmin;
                    return (
                      <button
                        key={type.value}
                        onClick={() => !isDisabled && setFormData({ ...formData, type: type.value as any })}
                        disabled={isDisabled}
                        className={`p-4 rounded-lg border-2 transition-all relative ${
                          formData.type === type.value
                            ? 'border-blue-500 bg-blue-500/20'
                            : isDisabled
                            ? 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        {isDisabled && (
                          <div className="absolute top-1 right-1 text-xs bg-gray-700 rounded px-1.5 py-0.5 text-gray-400">
                            🔒
                          </div>
                        )}
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className={`text-sm font-semibold ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
                          {type.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ベット設定 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">バイイン</label>
                  <input
                    type="number"
                    value={formData.buyIn}
                    onChange={(e) => setFormData({ ...formData, buyIn: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">最大プレイヤー数</label>
                  <select
                    value={formData.maxPlayers}
                    onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                  >
                    <option value={6}>6人</option>
                    <option value={7}>7人</option>
                    <option value={8}>8人</option>
                    <option value={9}>9人</option>
                  </select>
                </div>
              </div>

              {/* ブラインド設定（キャッシュゲームの場合） */}
              {formData.type === 'cash' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">スモールブラインド</label>
                    <input
                      type="number"
                      value={formData.settings.blinds.small}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          blinds: { ...formData.settings.blinds, small: parseInt(e.target.value) }
                        }
                      })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">ビッグブラインド</label>
                    <input
                      type="number"
                      value={formData.settings.blinds.big}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          blinds: { ...formData.settings.blinds, big: parseInt(e.target.value) }
                        }
                      })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* プライバシー設定 */}
              <div>
                <label className="block text-white font-semibold mb-4">プライバシー設定</label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Unlock className="text-green-400 text-xl" />
                      <div>
                        <div className="text-white font-semibold">オープンテーブル</div>
                        <div className="text-gray-400 text-sm">誰でも参加可能</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, isPrivate: false })}
                      className={`w-6 h-6 rounded-full border-2 ${
                        !formData.isPrivate ? 'border-green-500 bg-green-500' : 'border-gray-500'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock className="text-blue-400 text-xl" />
                      <div>
                        <div className="text-white font-semibold">プライベートテーブル</div>
                        <div className="text-gray-400 text-sm">パスワードが必要</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, isPrivate: true })}
                      className={`w-6 h-6 rounded-full border-2 ${
                        formData.isPrivate ? 'border-blue-500 bg-blue-500' : 'border-gray-500'
                      }`}
                    />
                  </div>
                </div>

                {formData.isPrivate && (
                  <div className="mt-4">
                    <label className="block text-white font-semibold mb-2">パスワード</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="パスワードを入力..."
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-white font-semibold mb-2">説明（任意）</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="テーブルの説明を入力..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Users className="text-white text-3xl" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">テーブルが作成されました！</h2>
                <p className="text-gray-400">{createdTable?.name}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-white font-semibold mb-2">共有リンク</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    <Copy />
                  </button>
                  <button
                    onClick={handleCopyQRCode}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    <QrCode />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-green-400 font-bold text-2xl">
                    {createdTable?.maxPlayers}
                  </div>
                  <div className="text-gray-400 text-sm">最大プレイヤー</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-yellow-400 font-bold text-2xl">
                    {createdTable?.isPrivate ? '🔒' : '🔓'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {createdTable?.isPrivate ? 'プライベート' : 'オープン'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex justify-between">
            {step === 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.name}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  テーブル作成
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors mx-auto"
              >
                完了
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
