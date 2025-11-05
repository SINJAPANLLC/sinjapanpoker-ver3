'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useTournamentStore, Tournament } from '@/store/useTournamentStore';
import { io, Socket } from 'socket.io-client';

interface Table {
  id: string;
  name: string;
  type: 'cash' | 'sit-and-go';
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

// Tournament interface is now imported from useTournamentStore
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Trophy, Users, LogOut, Zap, Coins, Flame, Crown, ShoppingCart, BarChart3, User, Plus, Gamepad2, Share2, MessageCircle } from 'lucide-react';
import TableCreationModal from '@/components/TableCreationModal';
import { saveTables, loadTables, saveTournaments, loadTournaments } from '@/lib/storage';

function LobbyContent() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { currency } = useCurrencyStore();
  const { getActiveTournaments, joinTournament } = useTournamentStore();

  const [showCreateTable, setShowCreateTable] = useState(false);
  const [tables, setTables] = useState<Table[]>([]); // ユーザーが作成したテーブルのみ表示
  const [tournaments, setTournaments] = useState<Tournament[]>([]); // Adminが作成したトーナメントのみ表示
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  // Socket.io接続してリアルタイム更新を受信
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('Lobby socket connected');
    });

    newSocket.on('lobby-update', ({ games }) => {
      console.log('Lobby update received:', games);
      
      // LocalStorageから保存されたテーブルを読み込む
      const savedTables = loadTables();
      
      // サーバーからの更新でcurrentPlayersとstatusを更新
      const updatedTables = savedTables.map(table => {
        const serverGame = games.find((g: any) => g.id === table.id);
        if (serverGame) {
          return {
            ...table,
            currentPlayers: serverGame.currentPlayers,
            status: serverGame.status as 'waiting' | 'playing' | 'full',
            createdAt: new Date(table.createdAt)
          };
        }
        return {
          ...table,
          createdAt: new Date(table.createdAt)
        };
      });
      
      setTables(updatedTables);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // LocalStorageとAPIからデータを読み込む
  useEffect(() => {
    // テーブルデータを読み込み
    const savedTables = loadTables();
    if (savedTables.length > 0) {
      // Date型に変換
      const parsedTables = savedTables.map(table => ({
        ...table,
        createdAt: new Date(table.createdAt)
      }));
      setTables(parsedTables);
    }

    // トーナメントデータをAPIから取得
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournament?status=registering');
      const data = await response.json();
      if (Array.isArray(data)) {
        setTournaments(data.map(t => ({
          ...t,
          startTime: t.startTime ? new Date(t.startTime) : undefined,
        })));
      }
    } catch (error) {
      console.error('トーナメント取得エラー:', error);
      // フォールバック：Zustand storeとLocalStorageから読み込み
      const activeTournaments = getActiveTournaments();
      const savedTournaments = loadTournaments();
      const mergedTournaments = [...activeTournaments];
      savedTournaments.forEach(saved => {
        if (!mergedTournaments.find(t => t.id === saved.id)) {
          mergedTournaments.push({
            ...saved,
            startTime: saved.startTime ? new Date(saved.startTime) : undefined
          });
        }
      });
      setTournaments(mergedTournaments);
    }
  };

  // テーブルが変更されたらLocalStorageに保存
  useEffect(() => {
    if (tables.length > 0) {
      saveTables(tables);
    }
  }, [tables]);

  // トーナメントが変更されたらLocalStorageに保存
  useEffect(() => {
    if (tournaments.length > 0) {
      saveTournaments(tournaments);
    }
  }, [tournaments]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCreateTable = (tableData: any) => {
    const newTable = {
      id: tableData.id || Date.now().toString(),
      ...tableData,
      currentPlayers: 1,
      status: 'waiting' as const,
      createdBy: user?.username || 'You',
      createdAt: new Date()
    };
    setTables(prev => [newTable, ...prev]);
    setShowCreateTable(false);
  };

  const handleJoinTable = (tableId: string, password?: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table?.isPrivate && !password) {
      // プライベートテーブルの場合はパスワード入力を求める
      setSelectedTableId(tableId);
      setShowPasswordModal(true);
      return;
    }
    
    console.log('Joining table:', tableId, 'with password:', password);
    // 実際の実装では、テーブル参加のAPIを呼び出す
    const url = password ? `/game/active?table=${tableId}&password=${encodeURIComponent(password)}` : `/game/active?table=${tableId}`;
    router.push(url);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput.trim()) {
      handleJoinTable(selectedTableId, passwordInput);
      setShowPasswordModal(false);
      setPasswordInput('');
      setSelectedTableId('');
    }
  };

  const handleSpectateTable = (tableId: string) => {
    console.log('Spectating table:', tableId);
    router.push(`/game/active?table=${tableId}&spectate=true`);
  };

  const handleShareTable = (tableId: string) => {
    const shareUrl = `${window.location.origin}/game/active?table=${tableId}`;
    navigator.clipboard.writeText(shareUrl);
    // トースト通知など
    console.log('Table shared:', shareUrl);
  };

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景アニメーション */}
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
            <h1 className="text-2xl font-bold text-gradient-blue">ロビー</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 glass px-3 py-2 rounded-full">
              <Zap className="text-yellow-400" />
              <span className="text-white font-semibold">{currency.energy}</span>
            </div>
            <div className="flex items-center space-x-2 glass px-3 py-2 rounded-full">
              <img src="/chip-icon.png" alt="Chips" className="w-6 h-6 object-contain" />
              <span className="text-white font-semibold">{(currency?.realChips || 0).toLocaleString()}</span>
            </div>
            <button
              onClick={handleLogout}
              className="glass hover-lift px-4 py-2 rounded-xl text-blue-400 border border-blue-400/30 hover:border-blue-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8 pb-20 md:pb-24">
        {/* クイックプレイセクション */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-4 md:mb-6 flex items-center space-x-2 md:space-x-3">
            <Flame className="text-blue-400 animate-pulse text-lg md:text-2xl" />
            <span className="text-gradient-blue">クイックプレイ</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/game/practice"
              className="card-blue hover-lift hover-glow group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex items-center space-x-3 md:space-x-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center animate-pulse-slow flex-shrink-0">
                  <span className="text-2xl md:text-3xl text-white">♠</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-2xl font-bold text-white mb-1">練習モード</h3>
                  <p className="text-gray-400 text-sm md:text-base">AIと対戦</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* テーブル一覧 */}
        <div className="mb-6 md:mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-white flex items-center space-x-2 md:space-x-3">
              <Gamepad2 className="text-blue-400 animate-pulse text-lg md:text-2xl" />
              <span className="text-gradient-blue">テーブル</span>
              <span className="text-gray-400 text-sm md:text-base">({tables.length}件)</span>
            </h2>
            <button
              onClick={() => setShowCreateTable(true)}
              className="flex items-center space-x-2 px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all hover:scale-105"
            >
              <Plus className="text-sm md:text-base" />
              <span className="hidden md:inline">テーブル作成</span>
              <span className="md:hidden">作成</span>
            </button>
          </div>

          {/* テーブル一覧 */}
          {tables.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              </div>
              <p className="text-gray-400 text-lg mb-2">まだテーブルが作成されていません</p>
              <p className="text-gray-500 text-sm">テーブル作成ボタンから新しいテーブルを作成しましょう</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {tables.map((table, index) => (
              <div 
                key={table.id} 
                className="card-blue hover-lift hover-glow group relative overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* 背景エフェクト */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {/* テーブルアイコン */}
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        table.type === 'cash' ? 'bg-gradient-to-br from-green-500/20 to-green-700/20 border border-green-500/30' :
                        table.type === 'sit-and-go' ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 border border-yellow-500/30' :
                        'bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/30'
                      }`}>
                        <span className="text-2xl md:text-3xl">
                          {table.type === 'cash' ? '💰' : table.type === 'sit-and-go' ? '🏆' : '⚡'}
                        </span>
                      </div>
                      
                      {/* テーブル情報 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base md:text-lg mb-1 truncate">{table.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          {/* プライバシーバッジ */}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            table.isPrivate ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {table.isPrivate ? '🔒 プライベート' : '🔓 パブリック'}
                          </span>
                          
                          {/* ステータスバッジ */}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            table.status === 'waiting' ? 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse-slow' :
                            table.status === 'playing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {table.status === 'waiting' ? '● 募集中' :
                             table.status === 'playing' ? '● プレイ中' : '● 満員'}
                          </span>
                        </div>
                        
                        {/* 説明 */}
                        {table.description && (
                          <p className="text-gray-400 text-xs md:text-sm line-clamp-1">{table.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* シェアボタン */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareTable(table.id);
                      }}
                      className="text-gray-400 hover:text-blue-400 transition-colors p-2 hover:bg-blue-500/10 rounded-lg"
                    >
                      <Share2 className="text-sm" />
                    </button>
                  </div>

                  {/* 統計情報 */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/10">
                    <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <img src="/chip-icon.png" alt="Chips" className="w-4 h-4 object-contain" />
                        <span className="text-gray-400 text-xs">バイイン</span>
                      </div>
                      <div className="text-white font-bold text-sm md:text-base">
                        ${table.buyIn.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="text-blue-400 text-sm" />
                        <span className="text-gray-400 text-xs">プレイヤー</span>
                      </div>
                      <div className="text-white font-bold text-sm md:text-base">
                        {table.currentPlayers}/{table.maxPlayers}
                      </div>
                    </div>
                  </div>

                  {/* 追加情報 */}
                  <div className="space-y-2 mb-4">
                    {table.blinds && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs md:text-sm flex items-center space-x-1">
                          <span>🎯</span>
                          <span>ブラインド</span>
                        </span>
                        <span className="text-white font-semibold text-xs md:text-sm">
                          ${table.blinds.small}/${table.blinds.big}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs md:text-sm flex items-center space-x-1">
                        <span>👤</span>
                        <span>作成者</span>
                      </span>
                      <span className="text-white text-xs md:text-sm font-medium">{table.createdBy}</span>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    {table.currentPlayers >= table.maxPlayers ? (
                      <button
                        onClick={() => handleSpectateTable(table.id)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all hover:scale-105 flex items-center justify-center space-x-2 text-sm"
                      >
                        <span>👁️</span>
                        <span>観戦</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleJoinTable(table.id)}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all hover:scale-105 flex items-center justify-center space-x-2 text-sm"
                        >
                          <span>🎮</span>
                          <span>{table.isPrivate ? '参加' : '参加'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleSpectateTable(table.id)}
                          className="px-4 py-2.5 bg-black/50 hover:bg-black/70 text-gray-300 hover:text-white rounded-lg transition-all border border-white/10 hover:border-white/30"
                        >
                          👁️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* トーナメント（Admin作成） */}
        <div className="mb-6 md:mb-8 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-white flex items-center space-x-2 md:space-x-3">
              <Trophy className="text-yellow-500 animate-pulse text-lg md:text-2xl" />
              <span className="text-gradient-blue">トーナメント</span>
              <span className="text-gray-400 text-sm md:text-base">({tournaments.length}件)</span>
            </h2>
            <Link href="/tournaments" className="text-blue-400 hover:text-cyan-300 text-sm md:text-base">
              すべて見る →
            </Link>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              </div>
              <p className="text-gray-400 text-lg mb-2">まだトーナメントが開催されていません</p>
              <p className="text-gray-500 text-sm">管理者がトーナメントを作成するまでお待ちください</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {tournaments.map((tournament, index) => (
              <div 
                key={tournament.id} 
                className="card-blue hover-lift hover-glow group relative overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                        <Trophy className="text-2xl md:text-3xl text-yellow-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base md:text-lg mb-1 truncate">{tournament.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            🏆 トーナメント
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            tournament.status === 'waiting' ? 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse-slow' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {tournament.status === 'waiting' ? '● 募集中' : '● 満員'}
                          </span>
                        </div>
                        
                        {tournament.description && (
                          <p className="text-gray-400 text-xs md:text-sm line-clamp-1">{tournament.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">バイイン</div>
                      <div className="text-white font-semibold">{(tournament.buyIn || 0).toLocaleString()}チップ</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">参加者</div>
                      <div className="text-white font-semibold">{tournament.currentPlayers}/{tournament.maxPlayers}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">賞金総額</div>
                      <div className="text-yellow-400 font-semibold">{(tournament.prize || 0).toLocaleString()}チップ</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">開始予定</div>
                      <div className="text-white font-semibold text-xs">
                        {tournament.startTime ? tournament.startTime.toLocaleDateString('ja-JP', { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        }) : 'TBD'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          if (user) {
                            const success = joinTournament(tournament.id, user.id, user.username);
                            if (success) {
                              alert('トーナメントに参加しました！手数料（10%）が徴収されました。');
                              // トーナメントページに遷移
                              router.push(`/game/active?tournament=${tournament.id}`);
                            } else {
                              alert('トーナメントに参加できませんでした。');
                            }
                          } else {
                            alert('ログインが必要です。');
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-yellow-700 hover:to-orange-600 text-white py-2 px-4 rounded-lg font-semibold transition-all hover:scale-105"
                      >
                        参加する
                      </button>
                      
                      <button 
                        onClick={() => {
                          // 観戦モードでトーナメントページに遷移
                          router.push(`/game/active?tournament=${tournament.id}&spectate=true`);
                        }}
                        className="px-4 py-2 bg-black/50 hover:bg-black/70 text-gray-300 hover:text-white rounded-lg transition-all border border-white/10 hover:border-white/30"
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 p-6 z-20 safe-area-bottom">
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
          <Link href="/lobby" prefetch={true} className="flex flex-col items-center space-y-1 text-blue-400 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
            </div>
            <span className="text-sm font-semibold">ロビー</span>
          </Link>
          <Link href="/career" prefetch={true} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-blue-400 active:text-blue-500 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">キャリア</span>
          </Link>
          <Link href="/profile" prefetch={true} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-blue-400 active:text-blue-500 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-500">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">プロフ</span>
          </Link>
        </div>
      </nav>

      {/* テーブル作成モーダル */}
      <TableCreationModal
        isOpen={showCreateTable}
        onClose={() => setShowCreateTable(false)}
        onCreateTable={handleCreateTable}
        isAdmin={user?.isAdmin || false}
      />

      {/* パスワード入力モーダル */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">プライベートテーブル</h2>
              <p className="text-gray-400">パスワードを入力してください</p>
            </div>
            
            <div className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="パスワードを入力..."
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordInput('');
                    setSelectedTableId('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!passwordInput.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default function LobbyPage() {
  return (
    <ProtectedRoute>
      <LobbyContent />
    </ProtectedRoute>
  );
}