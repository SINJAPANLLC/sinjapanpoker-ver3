const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const {
  calculateSidePots,
  determineWinners,
  distributePots,
  validateBet,
} = require('./poker-helpers');
const { saveGameToDatabase } = require('./game-db');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ゲームルーム管理
const games = new Map();
const players = new Map();

// CPUプレイヤーの名前リスト
const CPU_NAMES = [
  'タケシ', 'ユウキ', 'ケンジ', 'マサヒロ', 'カズヤ',
  'サトシ', 'ヒロシ', 'ダイスケ', 'リョウタ', 'コウジ'
];

// CPUプレイヤー生成関数
function createCPUPlayer(index) {
  return {
    id: `cpu-${index}-${Math.random().toString(36).substring(7)}`,
    userId: `cpu-${index}`,
    username: CPU_NAMES[index % CPU_NAMES.length],
    chips: 1000,
    avatar: `https://i.pravatar.cc/150?img=${10 + index}`,
  };
}

// CPUの意思決定AI（難易度別）
function decideCPUAction(difficulty, currentBet, playerBet, chips, pot) {
  const callAmount = currentBet - playerBet;
  
  if (difficulty === 'easy') {
    // 初心者AI: 保守的、主にコールかフォールド
    if (callAmount === 0) return { action: 'check' };
    if (callAmount > chips * 0.3) return { action: 'fold' };
    if (Math.random() < 0.7) return { action: 'call' };
    if (Math.random() < 0.2) return { action: 'raise', amount: Math.min(currentBet * 2, chips) };
    return { action: 'fold' };
  } else if (difficulty === 'medium') {
    // 中級者AI: バランス型
    if (callAmount === 0) {
      if (Math.random() < 0.6) return { action: 'check' };
      return { action: 'raise', amount: Math.min(pot * 0.5, chips) };
    }
    if (callAmount > chips * 0.5) return { action: 'fold' };
    if (Math.random() < 0.5) return { action: 'call' };
    if (Math.random() < 0.3) return { action: 'raise', amount: Math.min(currentBet * 2.5, chips) };
    return { action: 'fold' };
  } else {
    // 上級者AI: アグレッシブ
    if (callAmount === 0) {
      if (Math.random() < 0.4) return { action: 'check' };
      return { action: 'raise', amount: Math.min(pot * 0.75, chips) };
    }
    if (callAmount > chips * 0.7) {
      if (Math.random() < 0.3) return { action: 'call' };
      return { action: 'fold' };
    }
    if (Math.random() < 0.4) return { action: 'call' };
    if (Math.random() < 0.4) return { action: 'raise', amount: Math.min(currentBet * 3, chips) };
    return { action: 'fold' };
  }
}

// ポーカーゲームクラス
class PokerGame {
  constructor(gameId, type, blinds, difficulty = 'medium') {
    this.id = gameId;
    this.type = type;
    this.phase = 'waiting';
    this.players = [];
    this.deck = [];
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.currentPlayerIndex = 0;
    this.dealerIndex = 0;
    this.smallBlind = blinds.small;
    this.bigBlind = blinds.big;
    this.winner = null;
    this.winningHand = null;
    this.totalBets = new Map();
    this.difficulty = difficulty; // 練習モード用の難易度
    this.awayPlayers = new Set(); // 離席中のプレイヤーID
  }

  addPlayer(player) {
    if (this.players.length >= 9) {
      return false;
    }

    this.players.push({
      id: player.id,
      userId: player.userId,
      username: player.username,
      chips: player.chips,
      bet: 0,
      cards: [],
      folded: false,
      isAllIn: false,
      position: this.players.length,
      isDealer: this.players.length === 0,
      hasActed: false,
      avatar: player.avatar || null,
    });

    return true;
  }

  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
    if (this.players.length < 2) {
      this.phase = 'waiting';
    }
  }

  startGame() {
    if (this.players.length < 2) return;

    this.phase = 'preflop';
    this.deck = this.createAndShuffleDeck();
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = this.bigBlind;
    this.totalBets.clear();
    
    // カードを配る
    this.players.forEach(player => {
      player.cards = [this.deck.pop(), this.deck.pop()];
      player.bet = 0;
      player.folded = false;
      player.hasActed = false;
      this.totalBets.set(player.id, 0);
    });

    // ブラインドを徴収
    const sbIndex = (this.dealerIndex + 1) % this.players.length;
    const bbIndex = (this.dealerIndex + 2) % this.players.length;
    
    this.players[sbIndex].chips -= this.smallBlind;
    this.players[sbIndex].bet = this.smallBlind;
    this.totalBets.set(this.players[sbIndex].id, this.smallBlind);
    this.pot += this.smallBlind;

    this.players[bbIndex].chips -= this.bigBlind;
    this.players[bbIndex].bet = this.bigBlind;
    this.totalBets.set(this.players[bbIndex].id, this.bigBlind);
    this.pot += this.bigBlind;

    this.currentPlayerIndex = (this.dealerIndex + 3) % this.players.length;
  }

  createAndShuffleDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank, id: `${rank}_${suit}` });
      }
    }

    // 基本のシャッフル
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // ドラマチックな展開を演出する偏り
    // 練習モード：30%の確率、本番環境：10%の確率
    const biasChance = this.difficulty ? 0.30 : 0.10;
    if (Math.random() < biasChance) {
      this.applyDramaticBias(deck);
    }

    return deck;
  }

  // ドラマチックな展開を演出する微妙な偏り
  applyDramaticBias(deck) {
    const highCards = ['A', 'K', 'Q', 'J', '10'];
    const midCards = ['9', '8', '7', '6'];
    
    // 25%の確率で強いカードを上部に配置（プレイヤーに強い手札）
    if (Math.random() < 0.25) {
      const topCards = deck.filter(card => highCards.includes(card.rank));
      const otherCards = deck.filter(card => !highCards.includes(card.rank));
      
      // 上位カードの一部をデッキ上部に移動
      for (let i = 0; i < Math.min(8, topCards.length); i++) {
        if (Math.random() < 0.6) {
          const randomIndex = Math.floor(Math.random() * topCards.length);
          const card = topCards.splice(randomIndex, 1)[0];
          otherCards.splice(Math.floor(Math.random() * 20), 0, card);
        }
      }
      
      deck.splice(0, deck.length, ...otherCards.concat(topCards));
    }
    
    // 25%の確率でペアを作りやすくする
    else if (Math.random() < 0.33) {
      for (let i = 0; i < deck.length - 1; i += 2) {
        // 同じランクのカードを近くに配置
        if (Math.random() < 0.4) {
          const currentRank = deck[i].rank;
          const sameRankIndex = deck.findIndex((card, idx) => 
            idx > i + 2 && card.rank === currentRank
          );
          
          if (sameRankIndex !== -1 && Math.random() < 0.5) {
            [deck[i + 1], deck[sameRankIndex]] = [deck[sameRankIndex], deck[i + 1]];
          }
        }
      }
    }
    
    // 25%の確率で中位カードをバランス良く配置（接戦演出）
    else if (Math.random() < 0.5) {
      const balancedCards = deck.filter(card => 
        midCards.includes(card.rank) || highCards.includes(card.rank)
      );
      const lowCards = deck.filter(card => 
        !midCards.includes(card.rank) && !highCards.includes(card.rank)
      );
      
      // バランス良く混ぜる
      const result = [];
      while (balancedCards.length > 0 || lowCards.length > 0) {
        if (balancedCards.length > 0 && Math.random() < 0.6) {
          result.push(balancedCards.pop());
        }
        if (lowCards.length > 0) {
          result.push(lowCards.pop());
        }
      }
      
      deck.splice(0, deck.length, ...result);
    }
    
    // 25%の確率でフラッシュの可能性を少し高める
    else {
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      const selectedSuit = suits[Math.floor(Math.random() * suits.length)];
      const suitCards = deck.filter(card => card.suit === selectedSuit);
      const otherSuitCards = deck.filter(card => card.suit !== selectedSuit);
      
      // 選択されたスートのカードの一部を上部に配置
      for (let i = 0; i < Math.min(5, suitCards.length); i++) {
        if (Math.random() < 0.4) {
          const randomIndex = Math.floor(Math.random() * suitCards.length);
          const card = suitCards.splice(randomIndex, 1)[0];
          otherSuitCards.splice(Math.floor(Math.random() * 15), 0, card);
        }
      }
      
      deck.splice(0, deck.length, ...otherSuitCards.concat(suitCards));
    }
  }

  playerAction(playerId, action, amount = 0) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.folded) return { success: false, error: 'プレイヤーが見つかりません' };

    const validation = validateBet(
      action,
      amount,
      player.chips,
      player.bet,
      this.currentBet,
      this.bigBlind
    );

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    switch (action) {
      case 'fold':
        player.folded = true;
        break;
        
      case 'check':
        break;
        
      case 'call':
        const callAmount = validation.adjustedAmount || (this.currentBet - player.bet);
        const actualCallAmount = Math.min(callAmount, player.chips);
        player.chips -= actualCallAmount;
        player.bet += actualCallAmount;
        this.pot += actualCallAmount;
        const currentTotal = this.totalBets.get(player.id) || 0;
        this.totalBets.set(player.id, currentTotal + actualCallAmount);
        if (player.chips === 0) {
          player.isAllIn = true;
        }
        break;
        
      case 'raise':
        const raiseAmount = validation.adjustedAmount || amount;
        player.chips -= raiseAmount;
        player.bet += raiseAmount;
        this.pot += raiseAmount;
        const raiseTotalBet = this.totalBets.get(player.id) || 0;
        this.totalBets.set(player.id, raiseTotalBet + raiseAmount);
        this.currentBet = player.bet;
        break;
        
      case 'all-in':
        const allInAmount = player.chips;
        this.pot += allInAmount;
        player.bet += allInAmount;
        player.chips = 0;
        player.isAllIn = true;
        const allInTotalBet = this.totalBets.get(player.id) || 0;
        this.totalBets.set(player.id, allInTotalBet + allInAmount);
        if (player.bet > this.currentBet) {
          this.currentBet = player.bet;
        }
        break;
    }

    player.hasActed = true;
    this.nextPlayer();
    return { success: true };
  }

  nextPlayer() {
    const activePlayers = this.players.filter(p => !p.folded && !p.isAllIn);
    
    if (activePlayers.length <= 1) {
      this.endRound();
      return;
    }

    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (this.players[this.currentPlayerIndex].folded || this.players[this.currentPlayerIndex].isAllIn);

    // 全員がアクションを完了したか確認
    const allActed = activePlayers.every(p => p.hasActed && p.bet === this.currentBet);
    if (allActed) {
      this.nextPhase();
    }
  }

  // CPUプレイヤーかどうかを判定
  isCPUPlayer(player) {
    return player.userId && player.userId.toString().startsWith('cpu-');
  }

  // CPUプレイヤーの自動アクション（練習モード用）
  executeCPUAction(callback) {
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (!currentPlayer || !this.isCPUPlayer(currentPlayer)) {
      return;
    }

    // 1-3秒のランダムな待機時間でよりリアルに
    const thinkingTime = 1000 + Math.random() * 2000;
    
    setTimeout(() => {
      const decision = decideCPUAction(
        this.difficulty,
        this.currentBet,
        currentPlayer.bet,
        currentPlayer.chips,
        this.pot
      );
      
      // CPUのアクションを実行
      const result = this.playerAction(currentPlayer.id, decision.action, decision.amount);
      
      // コールバックを実行（ゲーム状態を更新するため）
      if (callback) {
        callback(result);
      }
    }, thinkingTime);
  }

  nextPhase() {
    this.players.forEach(p => p.hasActed = false);
    
    switch (this.phase) {
      case 'preflop':
        this.phase = 'flop';
        this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
        this.currentBet = 0;
        this.players.forEach(p => p.bet = 0);
        break;
      case 'flop':
        this.phase = 'turn';
        this.communityCards.push(this.deck.pop());
        this.currentBet = 0;
        this.players.forEach(p => p.bet = 0);
        break;
      case 'turn':
        this.phase = 'river';
        this.communityCards.push(this.deck.pop());
        this.currentBet = 0;
        this.players.forEach(p => p.bet = 0);
        break;
      case 'river':
        this.phase = 'showdown';
        this.endRound();
        break;
    }
  }

  async endRound() {
    this.phase = 'showdown';
    
    const activePlayers = this.players.filter(p => !p.folded);
    let winners = [];
    
    if (activePlayers.length === 1) {
      activePlayers[0].chips += this.pot;
      this.winner = activePlayers[0].username;
      this.winningHand = '全員フォールド';
      winners = [{
        id: activePlayers[0].id,
        playerId: activePlayers[0].id,
        handRank: '全員フォールド',
        winAmount: this.pot,
      }];
    } else {
      const playerBets = this.players.map(p => ({
        playerId: p.id,
        bet: this.totalBets.get(p.id) || 0,
        folded: p.folded,
      }));
      
      const sidePots = calculateSidePots(playerBets);
      winners = determineWinners(activePlayers, this.communityCards);
      
      if (winners.length > 0) {
        this.winner = winners.map(w => {
          const player = this.players.find(p => p.id === w.playerId);
          return player ? player.username : '';
        }).join(', ');
        this.winningHand = winners[0].handDescription;
      }
      
      distributePots(sidePots, winners, this.players);
    }

    // Save game to PostgreSQL database
    try {
      await saveGameToDatabase(this, winners);
      console.log(`Game ${this.id} saved to database`);
    } catch (error) {
      console.error('Error saving game to database:', error);
    }

    this.phase = 'finished';
    
    setTimeout(() => {
      this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
      this.startGame();
    }, 5000);
  }

  getGameState() {
    return {
      id: this.id,
      type: this.type,
      phase: this.phase,
      players: this.players.map(p => ({
        ...p,
        cards: p.cards, // 実際には自分のカードのみ表示
      })),
      communityCards: this.communityCards,
      pot: this.pot,
      currentBet: this.currentBet,
      currentPlayerIndex: this.currentPlayerIndex,
    };
  }
}

// Socket.io接続処理
io.on('connection', (socket) => {
  console.log('クライアント接続:', socket.id);

  // ゲーム作成
  socket.on('create-game', (data) => {
    const { gameId, type, blinds, player } = data;
    const game = new PokerGame(gameId, type, blinds);
    game.addPlayer({ ...player, id: socket.id });
    games.set(gameId, game);
    players.set(socket.id, gameId);
    
    socket.join(gameId);
    io.to(gameId).emit('game-state', game.getGameState());
  });

  // ゲーム参加
  socket.on('join-game', (data) => {
    const { gameId, player, difficulty } = data;
    let game = games.get(gameId);
    
    // 練習モードの場合、ゲームが存在しなければ作成
    if (!game && gameId === 'practice-game') {
      game = new PokerGame(gameId, 'texas-holdem', { small: 50, big: 100 }, difficulty || 'medium');
      games.set(gameId, game);
    }
    
    if (game && game.addPlayer({ ...player, id: socket.id })) {
      players.set(socket.id, gameId);
      socket.join(gameId);
      
      // 練習モードで最初のプレイヤー（実際のユーザー）の場合、CPUプレイヤーを追加
      if (gameId === 'practice-game' && game.players.length === 1) {
        // 5人のCPUプレイヤーを追加
        for (let i = 0; i < 5; i++) {
          const cpuPlayer = createCPUPlayer(i);
          game.addPlayer(cpuPlayer);
        }
        console.log('練習モード: CPUプレイヤー5人を追加しました');
      }
      
      io.to(gameId).emit('game-state', game.getGameState());
      
      if (game.players.length >= 2 && game.phase === 'waiting') {
        game.startGame();
        io.to(gameId).emit('game-state', game.getGameState());
        
        // ゲーム開始後、最初のプレイヤーがCPUの場合は自動アクションを実行
        if (game.isCPUPlayer(game.players[game.currentPlayerIndex])) {
          game.executeCPUAction((result) => {
            if (result.success) {
              io.to(gameId).emit('game-state', game.getGameState());
              // 次のプレイヤーもCPUの場合は再帰的に実行
              if (game.isCPUPlayer(game.players[game.currentPlayerIndex])) {
                game.executeCPUAction((result) => {
                  if (result.success) io.to(gameId).emit('game-state', game.getGameState());
                });
              }
            }
          });
        }
      }
    } else {
      socket.emit('error', { message: 'ゲームに参加できません' });
    }
  });

  // プレイヤーアクション
  // 離席状態の設定
  socket.on('set-away-status', (data) => {
    const gameId = players.get(socket.id);
    const game = games.get(gameId);
    
    if (game) {
      if (data.isAway) {
        game.awayPlayers.add(socket.id);
      } else {
        game.awayPlayers.delete(socket.id);
      }
    }
  });

  socket.on('player-action', (data) => {
    const gameId = players.get(socket.id);
    const game = games.get(gameId);
    
    if (game) {
      const { action, amount } = data;
      const result = game.playerAction(socket.id, action, amount);
      
      if (result.success) {
        io.to(gameId).emit('game-state', game.getGameState());
        
        // アクション後、次のプレイヤーがCPUまたは離席中の場合は自動アクションを実行
        const currentPlayer = game.players[game.currentPlayerIndex];
        
        // CPU自動アクション
        if (currentPlayer && game.isCPUPlayer(currentPlayer) && game.phase !== 'finished' && game.phase !== 'showdown') {
          game.executeCPUAction((result) => {
            if (result.success) {
              io.to(gameId).emit('game-state', game.getGameState());
            }
          });
        }
        
        // 離席中プレイヤーの自動アクション
        if (currentPlayer && game.awayPlayers.has(currentPlayer.id) && game.phase !== 'finished' && game.phase !== 'showdown') {
          setTimeout(() => {
            // 離席中は自動的にチェック/フォールド
            const autoAction = game.currentBet === currentPlayer.bet ? 'check' : 'fold';
            const autoResult = game.playerAction(currentPlayer.id, autoAction);
            
            if (autoResult.success) {
              io.to(gameId).emit('game-state', game.getGameState());
              io.to(gameId).emit('chat-message', {
                username: 'システム',
                message: `${currentPlayer.username}は離席中のため${autoAction === 'check' ? 'チェック' : 'フォールド'}しました`,
                timestamp: Date.now()
              });
            }
          }, 1000); // 1秒後に自動アクション
        }
      } else {
        socket.emit('action-error', { message: result.error || 'アクションが失敗しました' });
      }
    }
  });

  // チャットメッセージ
  socket.on('chat-message', (data) => {
    const gameId = players.get(socket.id);
    if (gameId) {
      io.to(gameId).emit('chat-message', {
        ...data,
        timestamp: new Date(),
      });
    }
  });

  // クイックゲーム
  socket.on('quick-game', (data) => {
    const { shareLink, hostId, gameType, blinds } = data;
    const gameId = shareLink;
    const game = new PokerGame(gameId, gameType, blinds);
    games.set(gameId, game);
    
    socket.emit('quick-game-created', { gameId, shareLink });
  });

  // 切断処理
  socket.on('disconnect', () => {
    console.log('クライアント切断:', socket.id);
    const gameId = players.get(socket.id);
    
    if (gameId) {
      const game = games.get(gameId);
      if (game) {
        game.removePlayer(socket.id);
        io.to(gameId).emit('game-state', game.getGameState());
        
        if (game.players.length === 0) {
          games.delete(gameId);
        }
      }
      players.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.ioサーバーが起動しました: http://localhost:${PORT}`);
});

