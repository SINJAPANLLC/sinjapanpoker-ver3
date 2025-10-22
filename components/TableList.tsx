'use client';

import { useState } from 'react';
import { FaUsers, FaLock, FaUnlock, FaShare, FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';

interface Table {
  id: string;
  name: string;
  type: 'cash' | 'tournament' | 'sit-and-go';
  buyIn: number;
  currentPlayers: number;
  maxPlayers: number;
  isPrivate: boolean;
  blinds?: { small: number; big: number };
  status: 'waiting' | 'playing' | 'full';
  createdBy: string;
  createdAt: Date;
  description?: string;
}

interface TableListProps {
  tables: Table[];
  onJoinTable: (tableId: string, password?: string) => void;
  onSpectateTable: (tableId: string) => void;
  onShareTable: (tableId: string) => void;
}

export default function TableList({
  tables,
  onJoinTable,
  onSpectateTable,
  onShareTable
}: TableListProps) {
  const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPrivateTables, setShowPrivateTables] = useState(false);

  const handleJoinClick = (table: Table) => {
    if (table.isPrivate) {
      setShowPasswordModal(table.id);
    } else {
      onJoinTable(table.id);
    }
  };

  const handlePasswordSubmit = () => {
    if (showPasswordModal) {
      onJoinTable(showPasswordModal, password);
      setShowPasswordModal(null);
      setPassword('');
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-green-400';
      case 'playing': return 'text-yellow-400';
      case 'full': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getTableStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return '参加待ち';
      case 'playing': return 'ゲーム中';
      case 'full': return '満員';
      default: return '不明';
    }
  };

  const getGameTypeIcon = (type: string) => {
    switch (type) {
      case 'cash': return '💰';
      case 'tournament': return '🏆';
      case 'sit-and-go': return '⚡';
      default: return '🎮';
    }
  };

  const filteredTables = showPrivateTables 
    ? tables 
    : tables.filter(table => !table.isPrivate);

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-white">利用可能なテーブル</h2>
          <span className="text-gray-400">({filteredTables.length}件)</span>
        </div>
        <button
          onClick={() => setShowPrivateTables(!showPrivateTables)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          {showPrivateTables ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
          <span className="text-white text-sm">
            {showPrivateTables ? 'プライベートを非表示' : 'プライベートを表示'}
          </span>
        </button>
      </div>

      {/* テーブル一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTables.map((table) => (
          <div key={table.id} className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600 hover:border-blue-500/50 transition-all">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getGameTypeIcon(table.type)}</span>
                <div>
                  <h3 className="text-white font-semibold truncate">{table.name}</h3>
                  <div className="flex items-center space-x-2">
                    {table.isPrivate ? (
                      <FaLock className="text-blue-400 text-sm" />
                    ) : (
                      <FaUnlock className="text-green-400 text-sm" />
                    )}
                    <span className={`text-sm font-medium ${getTableStatusColor(table.status)}`}>
                      {getTableStatusText(table.status)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onShareTable(table.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaShare />
              </button>
            </div>

            {/* テーブル情報 */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">バイイン</span>
                <span className="text-white font-semibold">${table.buyIn.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">プレイヤー</span>
                <div className="flex items-center space-x-2">
                  <FaUsers className="text-gray-400 text-sm" />
                  <span className="text-white font-semibold">
                    {table.currentPlayers}/{table.maxPlayers}
                  </span>
                </div>
              </div>

              {table.blinds && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">ブラインド</span>
                  <span className="text-white font-semibold">
                    ${table.blinds.small}/${table.blinds.big}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">作成者</span>
                <span className="text-white text-sm">{table.createdBy}</span>
              </div>
            </div>

            {/* 説明 */}
            {table.description && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm line-clamp-2">{table.description}</p>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex space-x-2">
              {table.status === 'full' ? (
                <button
                  onClick={() => onSpectateTable(table.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  観戦
                </button>
              ) : (
                <button
                  onClick={() => handleJoinClick(table)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {table.isPrivate ? '参加（パスワード）' : '参加'}
                </button>
              )}
              
              {table.status !== 'full' && (
                <button
                  onClick={() => onSpectateTable(table.id)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  観戦
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-bold text-white mb-2">利用可能なテーブルがありません</h3>
          <p className="text-gray-400">新しいテーブルを作成するか、しばらく待ってから再度確認してください。</p>
        </div>
      )}

      {/* パスワード入力モーダル */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">パスワードを入力</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力..."
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(null);
                    setPassword('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!password}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  参加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
