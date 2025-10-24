'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  Shield, 
  ArrowLeft, 
  Monitor, 
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Play,
  Pause,
  Square,
  RefreshCw,
  Clock,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface GameSession {
  id: string;
  type: 'cash' | 'tournament' | 'sit-and-go';
  tableId?: string;
  tournamentId?: string;
  players: {
    id: string;
    name: string;
    chips: number;
    status: 'active' | 'sitting_out' | 'disconnected';
    joinTime: Date;
    lastAction: Date;
    position: number;
    holeCards?: {
      rank: string;
      suit: string;
      visible: boolean;
    }[];
    currentBet: number;
    totalBet: number;
    isDealer: boolean;
    isSmallBlind: boolean;
    isBigBlind: boolean;
    isAllIn: boolean;
    hasFolded: boolean;
  }[];
  pot: number;
  currentHand: number;
  status: 'waiting' | 'playing' | 'paused' | 'finished';
  startedAt: Date;
  updatedAt: Date;
  rakeCollected: number;
  handsPlayed: number;
  avgPot: number;
  communityCards: {
    rank: string;
    suit: string;
    visible: boolean;
  }[];
  currentStage: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  currentBet: number;
  smallBlind: number;
  bigBlind: number;
  dealerPosition: number;
}

function GameMonitorContent() {
  const router = useRouter();
  const { adminUser, adminToken } = useAdminStore();
  
  const [games, setGames] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameSession | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // 実際のゲームデータを取得
  const fetchGames = async () => {
    if (!adminToken) return;
    
    try {
      const response = await fetch('/api/admin/games?active=true&limit=20', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      
      if (!response.ok) {
        console.error('Failed to fetch games');
        return;
      }
      
      const data = await response.json();
      
      console.log('API Response:', data);
      console.log('Games count:', data.games?.length || 0);
      
      // データを GameSession フォーマットに変換
      const formattedGames: GameSession[] = data.games.map((game: any) => ({
        id: game.id,
        type: 'cash' as const,
        players: (game.playersData || []).map((p: any, index: number) => ({
          id: p.userId || p.id,
          name: p.username,
          chips: p.chips || 0,
          status: 'active' as const,
          joinTime: new Date(game.createdAt),
          lastAction: new Date(game.updatedAt || game.createdAt),
          position: p.position || index + 1,
          holeCards: (p.cards || []).map((card: any) => ({
            rank: card.rank,
            suit: card.suit,
            visible: true,
          })),
          currentBet: p.bet || 0,
          totalBet: p.bet || 0,
          isDealer: p.isDealer || false,
          isSmallBlind: p.position === 1,
          isBigBlind: p.position === 2,
          isAllIn: p.isAllIn || false,
          hasFolded: p.folded || false,
        })),
        pot: game.pot || 0,
        currentHand: game.handsPlayed || 0,
        status: game.phase === 'ended' ? 'finished' : 'playing',
        startedAt: new Date(game.createdAt),
        updatedAt: new Date(game.updatedAt || game.createdAt),
        rakeCollected: game.totalRake || 0,
        handsPlayed: game.handsPlayed || 0,
        avgPot: game.pot || 0,
        communityCards: (game.communityCards || []).map((card: any) => ({
          rank: card.rank,
          suit: card.suit,
          visible: true,
        })),
        currentStage: game.phase as any || 'preflop',
        currentBet: game.currentBet || 0,
        smallBlind: game.smallBlind || 10,
        bigBlind: game.bigBlind || 20,
        dealerPosition: game.dealerIndex || 0,
      }));
      
      setGames(formattedGames);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [adminToken]);


  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // リアルタイムでゲームデータを取得
        fetchGames();
      }, 5000); // 5秒ごとに更新
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh]);

  const handleGameAction = (gameId: string, action: 'pause' | 'resume' | 'stop') => {
    setGames(prev => prev.map(game => {
      if (game.id === gameId) {
        let newStatus = game.status;
        switch (action) {
          case 'pause':
            newStatus = 'paused';
            break;
          case 'resume':
            newStatus = 'playing';
            break;
          case 'stop':
            newStatus = 'finished';
            break;
        }
        return { ...game, status: newStatus, updatedAt: new Date() };
      }
      return game;
    }));
  };

  const getStatusBadge = (status: GameSession['status']) => {
    switch (status) {
      case 'waiting':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">待機中</span>;
      case 'playing':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium animate-pulse">プレイ中</span>;
      case 'paused':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">一時停止</span>;
      case 'finished':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">終了</span>;
    }
  };

  const getPlayerStatusIcon = (status: GameSession['players'][0]['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'sitting_out':
        return <Pause className="w-4 h-4 text-yellow-400" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getGameTypeLabel = (type: GameSession['type']) => {
    switch (type) {
      case 'cash':
        return 'キャッシュゲーム';
      case 'tournament':
        return 'トーナメント';
      case 'sit-and-go':
        return 'シット&ゴー';
    }
  };

  const getSuitColor = (suit: string) => {
    switch (suit) {
      case '♥':
      case '♦':
        return 'text-red-500';
      case '♠':
      case '♣':
        return 'text-white';
      default:
        return 'text-gray-400';
    }
  };

  const CardComponent = ({ card, size = 'normal' }: { card: { rank: string; suit: string; visible: boolean }, size?: 'small' | 'normal' | 'large' }) => {
    const sizeClasses = {
      small: 'w-8 h-10 text-xs',
      normal: 'w-12 h-16 text-sm',
      large: 'w-16 h-20 text-base'
    };

    if (!card.visible) {
      return (
        <div className={`${sizeClasses[size]} bg-blue-900 border-2 border-blue-700 rounded flex items-center justify-center`}>
          <div className="text-blue-300">?</div>
        </div>
      );
    }

    return (
      <div className={`${sizeClasses[size]} bg-white border-2 border-gray-300 rounded flex flex-col items-center justify-center shadow-lg`}>
        <div className={`${getSuitColor(card.suit)} font-bold`}>
          {card.rank}
        </div>
        <div className={`${getSuitColor(card.suit)} text-xs`}>
          {card.suit}
        </div>
      </div>
    );
  };

  const PlayerCard = ({ player, game }: { player: GameSession['players'][0], game: GameSession }) => {
    return (
      <div className={`bg-gray-700/50 rounded-lg p-3 border ${
        player.isDealer ? 'border-yellow-500/50' :
        player.isSmallBlind ? 'border-blue-500/50' :
        player.isBigBlind ? 'border-green-500/50' :
        'border-gray-600/50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white font-medium text-sm">{player.name}</h4>
          <div className="flex items-center space-x-1">
            {player.isDealer && <span className="bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded text-xs">D</span>}
            {player.isSmallBlind && <span className="bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded text-xs">SB</span>}
            {player.isBigBlind && <span className="bg-green-500/20 text-green-400 px-1 py-0.5 rounded text-xs">BB</span>}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-green-400 text-sm">{player.chips.toLocaleString()}</span>
            <span className="text-gray-400 text-xs">チップ</span>
          </div>
          
          {player.holeCards && (
            <div className="flex items-center space-x-1">
              {player.holeCards.map((card, index) => (
                <CardComponent key={index} card={card} size="small" />
              ))}
            </div>
          )}
          
          {player.currentBet > 0 && (
            <div className="text-center">
              <span className="text-yellow-400 text-xs">ベット: {player.currentBet}</span>
            </div>
          )}
          
          {player.isAllIn && (
            <div className="text-center">
              <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">オールイン</span>
            </div>
          )}
          
          {player.hasFolded && (
            <div className="text-center">
              <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs">フォールド</span>
            </div>
          )}
        </div>
      </div>
    );
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
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">ゲーム監視</h1>
                  <p className="text-gray-400 text-sm">リアルタイムゲーム監視</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{autoRefresh ? '自動更新ON' : '自動更新OFF'}</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>手動更新</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
                <Monitor className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-blue-400 text-sm font-semibold">{games.length}ゲーム</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">アクティブゲーム</p>
              <p className="text-white text-lg md:text-xl font-bold">{games.filter(g => g.status === 'playing').length}</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-green-400 text-sm font-semibold">
                  {games.reduce((sum, game) => sum + game.players.length, 0)}人
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総プレイヤー数</p>
              <p className="text-white text-lg md:text-xl font-bold">
                {games.reduce((sum, game) => sum + game.players.filter(p => p.status === 'active').length, 0)}
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-yellow-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <p className="text-yellow-400 text-sm font-semibold">
                  ¥{games.reduce((sum, game) => sum + game.pot, 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総ポット</p>
              <p className="text-white text-lg md:text-xl font-bold">
                ¥{games.reduce((sum, game) => sum + game.avgPot, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <p className="text-purple-400 text-sm font-semibold">
                  ¥{games.reduce((sum, game) => sum + game.rakeCollected, 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総レーキ収益</p>
              <p className="text-white text-lg md:text-xl font-bold">
                {games.reduce((sum, game) => sum + game.handsPlayed, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* ゲーム一覧 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">アクティブゲーム</h2>
              <span className="text-gray-400 text-sm">{games.length}ゲーム</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="min-w-full">
                {/* デスクトップ表示 */}
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="text-left p-4 text-gray-400 font-medium">ゲーム情報</th>
                        <th className="text-left p-4 text-gray-400 font-medium">プレイヤー</th>
                        <th className="text-left p-4 text-gray-400 font-medium">ポット</th>
                        <th className="text-left p-4 text-gray-400 font-medium">統計</th>
                        <th className="text-left p-4 text-gray-400 font-medium">ステータス</th>
                        <th className="text-left p-4 text-gray-400 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.map((game) => (
                        <tr key={game.id} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                          <td className="p-4">
                            <div>
                              <h3 className="text-white font-semibold">{getGameTypeLabel(game.type)}</h3>
                              <p className="text-gray-400 text-sm">ID: {game.id}</p>
                              {game.tableId && <p className="text-gray-400 text-xs">テーブル: {game.tableId}</p>}
                              {game.tournamentId && <p className="text-gray-400 text-xs">トーナメント: {game.tournamentId}</p>}
                              <p className="text-gray-400 text-xs">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {Math.floor((Date.now() - game.startedAt.getTime()) / (1000 * 60))}分経過
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-2">
                              {game.players.map((player) => (
                                <div key={player.id} className="flex items-center space-x-2">
                                  {getPlayerStatusIcon(player.status)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{player.name}</p>
                                    <p className="text-gray-400 text-xs">¥{player.chips.toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-green-400 font-bold">¥{game.pot.toLocaleString()}</p>
                              <p className="text-gray-400 text-xs">ハンド #{game.currentHand}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <p className="text-white">{game.handsPlayed}ハンド</p>
                              <p className="text-blue-400">平均: ¥{game.avgPot.toLocaleString()}</p>
                              <p className="text-yellow-400">レーキ: ¥{game.rakeCollected.toLocaleString()}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(game.status)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedGame(game)}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                                title="詳細表示"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {game.status === 'playing' ? (
                                <button
                                  onClick={() => handleGameAction(game.id, 'pause')}
                                  className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-all"
                                  title="一時停止"
                                >
                                  <Pause className="w-4 h-4" />
                                </button>
                              ) : game.status === 'paused' ? (
                                <button
                                  onClick={() => handleGameAction(game.id, 'resume')}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                                  title="再開"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              ) : null}
                              <button
                                onClick={() => handleGameAction(game.id, 'stop')}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                                title="終了"
                              >
                                <Square className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* モバイル表示 */}
                <div className="lg:hidden">
                  <div className="space-y-4 p-6">
                    {games.map((game) => (
                      <div key={game.id} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold">{getGameTypeLabel(game.type)}</h3>
                            <p className="text-gray-400 text-sm">ID: {game.id}</p>
                            {getStatusBadge(game.status)}
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold">¥{game.pot.toLocaleString()}</p>
                            <p className="text-gray-400 text-xs">ハンド #{game.currentHand}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div>
                            <p className="text-gray-400">プレイヤー</p>
                            <div className="space-y-1">
                              {game.players.slice(0, 3).map((player) => (
                                <div key={player.id} className="flex items-center space-x-2">
                                  {getPlayerStatusIcon(player.status)}
                                  <span className="text-white text-xs">{player.name}</span>
                                </div>
                              ))}
                              {game.players.length > 3 && (
                                <p className="text-gray-400 text-xs">+{game.players.length - 3}人</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-400">統計</p>
                            <p className="text-white text-xs">{game.handsPlayed}ハンド</p>
                            <p className="text-blue-400 text-xs">平均: ¥{game.avgPot.toLocaleString()}</p>
                            <p className="text-yellow-400 text-xs">レーキ: ¥{game.rakeCollected.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedGame(game)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {game.status === 'playing' ? (
                            <button
                              onClick={() => handleGameAction(game.id, 'pause')}
                              className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-all"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          ) : game.status === 'paused' ? (
                            <button
                              onClick={() => handleGameAction(game.id, 'resume')}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleGameAction(game.id, 'stop')}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ゲーム詳細モーダル */}
        {selectedGame && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">ゲーム詳細 - {getGameTypeLabel(selectedGame.type)}</h2>
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* ゲーム情報 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">ゲーム情報</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">ゲームID:</span>
                        <span className="text-white">{selectedGame.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ハンド番号:</span>
                        <span className="text-white">#{selectedGame.currentHand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ステージ:</span>
                        <span className="text-white capitalize">{selectedGame.currentStage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ブラインド:</span>
                        <span className="text-white">{selectedGame.smallBlind}/{selectedGame.bigBlind}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">ポット情報</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">メインポット:</span>
                        <span className="text-green-400 font-bold">¥{selectedGame.pot.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">現在のベット:</span>
                        <span className="text-yellow-400">¥{selectedGame.currentBet}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">レーキ収益:</span>
                        <span className="text-purple-400">¥{selectedGame.rakeCollected}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">統計</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">プレイ済みハンド:</span>
                        <span className="text-white">{selectedGame.handsPlayed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">平均ポット:</span>
                        <span className="text-blue-400">¥{selectedGame.avgPot.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">開始時間:</span>
                        <span className="text-white">{selectedGame.startedAt.toLocaleTimeString('ja-JP')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* コミュニティカード */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">コミュニティカード</h3>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2">
                      {selectedGame.communityCards.map((card, index) => (
                        <CardComponent key={index} card={card} size="large" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* プレイヤー情報 */}
                <div>
                  <h3 className="text-white font-semibold mb-3">プレイヤー ({selectedGame.players.length}人)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedGame.players.map((player) => (
                      <PlayerCard key={player.id} player={player} game={selectedGame} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GameMonitorPage() {
  return (
    <AdminProtectedRoute requiredPermission="monitor.view">
      <GameMonitorContent />
    </AdminProtectedRoute>
  );
}