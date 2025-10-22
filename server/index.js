const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const {
  calculateSidePots,
  determineWinners,
  distributePots,
  validateBet,
} = require('./poker-helpers');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// MongoDB接続
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/poker-app';
mongoose.connect(MONGODB_URI).then(() => {
  console.log('MongoDB接続成功');
}).catch((err) => {
  console.error('MongoDB接続エラー:', err);
});

// ゲームルーム管理
const games = new Map();
const players = new Map();

// ポーカーゲームクラス
class PokerGame {
  constructor(gameId, type, blinds) {
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

    // シャッフル
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
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

  endRound() {
    this.phase = 'showdown';
    
    const activePlayers = this.players.filter(p => !p.folded);
    
    if (activePlayers.length === 1) {
      activePlayers[0].chips += this.pot;
      this.winner = activePlayers[0].username;
      this.winningHand = '全員フォールド';
    } else {
      const playerBets = this.players.map(p => ({
        playerId: p.id,
        bet: this.totalBets.get(p.id) || 0,
        folded: p.folded,
      }));
      
      const sidePots = calculateSidePots(playerBets);
      const winners = determineWinners(activePlayers, this.communityCards);
      
      if (winners.length > 0) {
        this.winner = winners.map(w => {
          const player = this.players.find(p => p.id === w.playerId);
          return player ? player.username : '';
        }).join(', ');
        this.winningHand = winners[0].handDescription;
      }
      
      distributePots(sidePots, winners, this.players);
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
    const { gameId, player } = data;
    const game = games.get(gameId);
    
    if (game && game.addPlayer({ ...player, id: socket.id })) {
      players.set(socket.id, gameId);
      socket.join(gameId);
      io.to(gameId).emit('game-state', game.getGameState());
      
      if (game.players.length >= 2 && game.phase === 'waiting') {
        game.startGame();
        io.to(gameId).emit('game-state', game.getGameState());
      }
    } else {
      socket.emit('error', { message: 'ゲームに参加できません' });
    }
  });

  // プレイヤーアクション
  socket.on('player-action', (data) => {
    const gameId = players.get(socket.id);
    const game = games.get(gameId);
    
    if (game) {
      const { action, amount } = data;
      const result = game.playerAction(socket.id, action, amount);
      
      if (result.success) {
        io.to(gameId).emit('game-state', game.getGameState());
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

