const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const {
  calculateSidePots,
  determineWinners,
  distributePots,
  validateBet,
  evaluateHand,
} = require('./server/poker-helpers');
const { saveGameToDatabase } = require('./server/game-db');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '5000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

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
      userId: `cpu-${index}`,
      username: CPU_NAMES[index % CPU_NAMES.length],
      chips: 10000,
      avatar: `https://i.pravatar.cc/150?img=${10 + index}`,
    };
  }

  // CPUの意思決定AI（難易度別）
  function decideCPUAction(difficulty, currentBet, playerBet, chips, pot) {
    const callAmount = currentBet - playerBet;
    
    if (difficulty === 'easy') {
      if (callAmount === 0) return { action: 'check' };
      if (callAmount > chips * 0.3) return { action: 'fold' };
      if (Math.random() < 0.7) return { action: 'call' };
      if (Math.random() < 0.2) return { action: 'raise', amount: Math.min(currentBet * 2, chips) };
      return { action: 'fold' };
    } else if (difficulty === 'medium') {
      if (callAmount === 0) {
        if (Math.random() < 0.6) return { action: 'check' };
        return { action: 'raise', amount: Math.min(pot * 0.5, chips) };
      }
      if (callAmount > chips * 0.5) return { action: 'fold' };
      if (Math.random() < 0.5) return { action: 'call' };
      if (Math.random() < 0.3) return { action: 'raise', amount: Math.min(currentBet * 2.5, chips) };
      return { action: 'fold' };
    } else {
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

  class PokerGame {
    constructor(gameId, type, blinds, difficulty = 'medium') {
      this.id = gameId;
      this.type = type;
      this.phase = 'waiting';
      this.players = [];
      this.communityCards = [];
      this.deck = [];
      this.pot = 0;
      this.sidePots = [];
      this.currentBet = 0;
      this.currentPlayerIndex = 0;
      this.dealerIndex = 0;
      this.blinds = blinds || { small: 10, big: 20 };
      this.minPlayers = 2;
      this.maxPlayers = 9;
      this.lastRaiserIndex = -1;
      this.bettingRound = 0;
      this.difficulty = difficulty;
      this.turnTimer = null;
      this.turnTimeLimit = 15000;
    }

    addPlayer(player) {
      if (this.players.length >= this.maxPlayers) {
        throw new Error('テーブルが満席です');
      }

      const newPlayer = {
        id: player.userId,
        userId: player.userId,
        username: player.username,
        chips: player.chips || 1000,
        bet: 0,
        totalBet: 0,
        cards: [],
        folded: false,
        isAllIn: false,
        isAway: false,
        position: this.players.length,
        avatar: player.avatar,
        isDealer: this.players.length === 0,
        hasActed: false,
        lastAction: null,
      };

      this.players.push(newPlayer);
      return newPlayer;
    }

    setAwayStatus(userId, isAway) {
      const player = this.players.find(p => p.userId === userId);
      if (player) {
        player.isAway = isAway;
      }
    }

    removePlayer(userId) {
      const index = this.players.findIndex(p => p.userId === userId);
      if (index !== -1) {
        if (this.currentPlayerIndex >= index && this.currentPlayerIndex > 0) {
          this.currentPlayerIndex--;
        }
        if (this.dealerIndex >= index && this.dealerIndex > 0) {
          this.dealerIndex--;
        }
        this.players.splice(index, 1);
      }
    }

    createDeck() {
      const suits = ['♠', '♥', '♦', '♣'];
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      this.deck = [];

      for (const suit of suits) {
        for (const rank of ranks) {
          this.deck.push({
            suit,
            rank,
            id: `${suit}${rank}`,
          });
        }
      }

      for (let i = this.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
    }

    dealCards() {
      this.createDeck();
      for (const player of this.players) {
        if (!player.folded) {
          player.cards = [this.deck.pop(), this.deck.pop()];
        }
      }
    }

    dealFlop() {
      this.deck.pop();
      this.communityCards = [this.deck.pop(), this.deck.pop(), this.deck.pop()];
    }

    dealTurn() {
      this.deck.pop();
      this.communityCards.push(this.deck.pop());
    }

    dealRiver() {
      this.deck.pop();
      this.communityCards.push(this.deck.pop());
    }

    startGame() {
      if (this.players.length < this.minPlayers) {
        throw new Error('プレイヤーが不足しています');
      }

      this.resetGameState();
      this.phase = 'preflop';
      this.dealCards();
      this.postBlinds();
    }

    resetGameState() {
      this.communityCards = [];
      this.pot = 0;
      this.sidePots = [];
      this.currentBet = 0;
      this.lastRaiserIndex = -1;
      this.bettingRound = 0;
      
      for (const player of this.players) {
        player.bet = 0;
        player.totalBet = 0;
        player.cards = [];
        player.folded = false;
        player.isAllIn = false;
        player.hasActed = false;
        player.lastAction = null;
        player.isDealer = false;
      }

      if (this.players[this.dealerIndex]) {
        this.players[this.dealerIndex].isDealer = true;
      }
    }

    postBlinds() {
      const activePlayers = this.players.filter(p => p.chips > 0);
      if (activePlayers.length < 2) return;

      const smallBlindIndex = (this.dealerIndex + 1) % this.players.length;
      const bigBlindIndex = (this.dealerIndex + 2) % this.players.length;

      const sbPlayer = this.players[smallBlindIndex];
      const bbPlayer = this.players[bigBlindIndex];

      const sbAmount = Math.min(sbPlayer.chips, this.blinds.small);
      sbPlayer.bet = sbAmount;
      sbPlayer.totalBet = sbAmount;
      sbPlayer.chips -= sbAmount;
      this.pot += sbAmount;
      if (sbPlayer.chips === 0) sbPlayer.isAllIn = true;

      const bbAmount = Math.min(bbPlayer.chips, this.blinds.big);
      bbPlayer.bet = bbAmount;
      bbPlayer.totalBet = bbAmount;
      bbPlayer.chips -= bbAmount;
      this.pot += bbAmount;
      if (bbPlayer.chips === 0) bbPlayer.isAllIn = true;

      this.currentBet = this.blinds.big;
      this.lastRaiserIndex = bigBlindIndex;
      this.currentPlayerIndex = this.getNextActivePlayer((bigBlindIndex + 1) % this.players.length);
    }

    getNextActivePlayer(startIndex) {
      let index = startIndex;
      let iterations = 0;
      
      while (iterations < this.players.length) {
        const player = this.players[index];
        if (player && !player.folded && !player.isAllIn) {
          return index;
        }
        index = (index + 1) % this.players.length;
        iterations++;
      }
      
      return -1;
    }

    isBettingRoundComplete() {
      const activePlayers = this.players.filter(p => !p.folded && !p.isAllIn);
      
      if (activePlayers.length === 0) return true;
      
      for (const player of activePlayers) {
        if (!player.hasActed) return false;
        if (player.bet < this.currentBet) return false;
      }
      
      return true;
    }

    nextPhase() {
      this.bettingRound++;
      
      if (this.phase === 'preflop') {
        this.phase = 'flop';
        this.dealFlop();
      } else if (this.phase === 'flop') {
        this.phase = 'turn';
        this.dealTurn();
      } else if (this.phase === 'turn') {
        this.phase = 'river';
        this.dealRiver();
      } else if (this.phase === 'river') {
        this.phase = 'showdown';
        this.showdown();
        return;
      }

      this.currentBet = 0;
      this.lastRaiserIndex = -1;
      
      for (const player of this.players) {
        player.bet = 0;
        player.hasActed = false;
      }
      
      this.currentPlayerIndex = this.getNextActivePlayer((this.dealerIndex + 1) % this.players.length);
    }

    calculateRake(potSize) {
      // レーキ計算（5%、キャップあり）1チップ=1円
      const rakePercentage = 0.05;
      const stakesLevel = this.blinds.big <= 10 ? 'micro' : 
                         this.blinds.big <= 100 ? 'low' : 
                         this.blinds.big <= 500 ? 'medium' : 'high';
      const rakeCaps = { micro: 300, low: 500, medium: 1000, high: 2000 };
      
      if (potSize < 100) return 0; // 100円未満のポットはレーキなし
      
      const rakeAmount = Math.floor(potSize * rakePercentage);
      return Math.min(rakeAmount, rakeCaps[stakesLevel]);
    }

    showdown() {
      const activePlayers = this.players.filter(p => !p.folded);
      
      if (activePlayers.length === 1) {
        // レーキ徴収
        const rake = this.calculateRake(this.pot);
        const winAmount = this.pot - rake;
        
        activePlayers[0].chips += winAmount;
        this.pot = 0;
        this.winner = activePlayers[0].username;
        this.winningHand = 'フォールド勝ち';
        this.winners = [{
          username: activePlayers[0].username,
          amount: winAmount,
          handDescription: 'フォールド勝ち',
        }];
        this.phase = 'finished';
        console.log(`レーキ徴収: ${rake} チップ（ポット: ${this.pot + rake}）`);
        return;
      }

      const playerBets = this.players.map(p => ({
        playerId: p.userId,
        bet: p.totalBet,
        folded: p.folded,
      }));

      // レーキ徴収（全ポットから）
      const totalPot = this.pot;
      const rake = this.calculateRake(totalPot);
      const potAfterRake = totalPot - rake;
      
      this.sidePots = calculateSidePots(playerBets);
      
      // サイドポットからもレーキを按分して引く
      const rakeRatio = rake / totalPot;
      this.sidePots = this.sidePots.map(pot => ({
        ...pot,
        amount: Math.floor(pot.amount * (1 - rakeRatio))
      }));

      const handsWithInfo = activePlayers.map(player => {
        const allCards = [...player.cards, ...this.communityCards];
        const handResult = evaluateHand(allCards);
        return {
          playerId: player.userId,
          username: player.username,
          handValue: handResult.value,
          handDescription: handResult.description,
          cards: player.cards,
        };
      });

      const winningsMap = new Map();

      for (const pot of this.sidePots) {
        const eligibleHands = handsWithInfo.filter(h => 
          pot.eligiblePlayers.includes(h.playerId)
        );

        if (eligibleHands.length === 0) continue;

        const maxHandValue = Math.max(...eligibleHands.map(h => h.handValue));
        const potWinners = eligibleHands.filter(h => h.handValue === maxHandValue);

        const amountPerWinner = Math.floor(pot.amount / potWinners.length);
        const remainder = pot.amount % potWinners.length;
        
        for (let i = 0; i < potWinners.length; i++) {
          const winner = potWinners[i];
          const currentWinnings = winningsMap.get(winner.playerId) || 0;
          const extraChip = i < remainder ? 1 : 0;
          winningsMap.set(winner.playerId, currentWinnings + amountPerWinner + extraChip);
        }
      }
      
      console.log(`レーキ徴収: ${rake} チップ（ポット: ${totalPot}、配分後: ${potAfterRake}）`);

      const winners = [];
      for (const [playerId, amount] of winningsMap.entries()) {
        const player = this.players.find(p => p.userId === playerId);
        const handInfo = handsWithInfo.find(h => h.playerId === playerId);
        if (player && amount > 0) {
          player.chips += amount;
          winners.push({
            username: player.username,
            amount,
            handDescription: handInfo?.handDescription || '',
          });
        }
      }

      this.pot = 0;
      this.winner = winners.map(w => w.username).join(', ');
      this.winningHand = winners[0]?.handDescription || '';
      this.winners = winners;
      this.phase = 'finished';
    }

    startNextHand() {
      this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
      
      const activePlayers = this.players.filter(p => p.chips > 0);
      if (activePlayers.length < this.minPlayers) {
        this.phase = 'waiting';
        return false;
      }

      this.startGame();
      return true;
    }

    // タイマーをクリア
    clearTurnTimer() {
      if (this.turnTimer) {
        clearTimeout(this.turnTimer);
        this.turnTimer = null;
      }
    }

    // ターンタイマーを開始
    startTurnTimer(io, gameId) {
      this.clearTurnTimer();
      
      const currentPlayer = this.players[this.currentPlayerIndex];
      if (!currentPlayer) return;
      
      // CPU・離席中プレイヤーはタイマーなし
      if (this.isCPUPlayer(currentPlayer) || currentPlayer.isAway) {
        return;
      }
      
      this.turnTimer = setTimeout(() => {
        // タイムアウト：自動的にフォールド/チェック
        const callAmount = this.currentBet - currentPlayer.bet;
        if (callAmount === 0) {
          currentPlayer.hasActed = true;
          currentPlayer.lastAction = 'CHECK';
        } else {
          currentPlayer.folded = true;
          currentPlayer.hasActed = true;
          currentPlayer.lastAction = 'FOLD';
        }
        
        console.log(`タイムアウト ${currentPlayer.username} のアクション: ${currentPlayer.lastAction}`);
        
        // フォールド後に1人しか残っていない場合は直接ショーダウンへ
        const activePlayers = this.players.filter(p => !p.folded);
        if (activePlayers.length === 1) {
          this.phase = 'showdown';
          this.showdown();
          io.to(gameId).emit('game-state', this.getState());
          
          setTimeout(async () => {
            const canContinue = this.startNextHand();
            if (canContinue) {
              io.to(gameId).emit('game-state', this.getState());
              const firstPlayer = this.players[this.currentPlayerIndex];
              if (firstPlayer && this.isCPUPlayer(firstPlayer)) {
                this.executeCPUAction(io, gameId);
              } else if (firstPlayer) {
                this.startTurnTimer(io, gameId);
              }
            }
          }, 3000);
          return;
        }
        
        // 次のプレイヤーに移動
        this.currentPlayerIndex = this.getNextActivePlayer((this.currentPlayerIndex + 1) % this.players.length);
        
        // ベッティングラウンドが終了したかチェック
        const activeNonAllInPlayers = this.players.filter(p => !p.folded && !p.isAllIn);
        const allActed = activeNonAllInPlayers.every(p => p.hasActed && p.bet === this.currentBet);
        
        if (allActed || activeNonAllInPlayers.length === 0) {
          this.nextPhase();
        }
        
        io.to(gameId).emit('game-state', this.getState());
        
        // ゲームが終了していたら次のハンドを開始
        if (this.phase === 'finished') {
          setTimeout(async () => {
            const canContinue = this.startNextHand();
            if (canContinue) {
              io.to(gameId).emit('game-state', this.getState());
              const firstPlayer = this.players[this.currentPlayerIndex];
              if (firstPlayer && this.isCPUPlayer(firstPlayer)) {
                this.executeCPUAction(io, gameId);
              } else if (firstPlayer) {
                this.startTurnTimer(io, gameId);
              }
            }
          }, 3000);
          return;
        }
        
        // 次のプレイヤーもCPU/離席中なら再帰的に実行
        if (this.phase !== 'finished' && this.phase !== 'showdown') {
          const nextPlayer = this.players[this.currentPlayerIndex];
          if (nextPlayer && (this.isCPUPlayer(nextPlayer) || nextPlayer.isAway)) {
            this.executeCPUAction(io, gameId);
          } else if (nextPlayer) {
            this.startTurnTimer(io, gameId);
          }
        }
      }, this.turnTimeLimit);
    }

    // CPUプレイヤーかどうか判定
    isCPUPlayer(player) {
      return player && player.userId && player.userId.toString().startsWith('cpu-');
    }

    // CPUプレイヤー・離席中プレイヤーの自動アクション
    executeCPUAction(io, gameId) {
      const currentPlayer = this.players[this.currentPlayerIndex];
      if (!currentPlayer) {
        return;
      }

      const isCPU = this.isCPUPlayer(currentPlayer);
      const isAway = currentPlayer.isAway;

      if (!isCPU && !isAway) {
        return;
      }

      // 離席中の場合は即座に実行、CPUの場合は1-3秒待機
      const thinkingTime = isAway ? 500 : (1000 + Math.random() * 2000);
      
      setTimeout(() => {
        try {
          let decision;
          
          if (isAway) {
            // 離席中は自動フォールド/チェック
            const callAmount = this.currentBet - currentPlayer.bet;
            decision = callAmount === 0 ? { action: 'check' } : { action: 'fold' };
            console.log(`離席中 ${currentPlayer.username} のアクション: ${decision.action}`);
          } else {
            // CPUの場合は通常の意思決定
            decision = decideCPUAction(
              this.difficulty,
              this.currentBet,
              currentPlayer.bet,
              currentPlayer.chips,
              this.pot
            );
            console.log(`CPU ${currentPlayer.username} のアクション: ${decision.action}`);
          }
          
          // アクションを実行
          switch (decision.action) {
            case 'fold':
              currentPlayer.folded = true;
              currentPlayer.hasActed = true;
              currentPlayer.lastAction = 'FOLD';
              break;
            case 'check':
              currentPlayer.hasActed = true;
              currentPlayer.lastAction = 'CHECK';
              break;
            case 'call':
              const callAmount = Math.min(this.currentBet - currentPlayer.bet, currentPlayer.chips);
              currentPlayer.chips -= callAmount;
              currentPlayer.bet += callAmount;
              currentPlayer.totalBet += callAmount;
              this.pot += callAmount;
              currentPlayer.hasActed = true;
              currentPlayer.lastAction = `CALL`;
              break;
            case 'raise':
              const raiseAmount = Math.min(decision.amount || this.currentBet * 2, currentPlayer.chips);
              currentPlayer.chips -= raiseAmount;
              currentPlayer.bet = raiseAmount;
              currentPlayer.totalBet += raiseAmount;
              this.pot += raiseAmount;
              this.currentBet = Math.max(this.currentBet, raiseAmount);
              currentPlayer.hasActed = true;
              currentPlayer.lastAction = `RAISE`;
              break;
          }
          
          // フォールド後に1人しか残っていない場合は直接ショーダウンへ
          const activePlayers = this.players.filter(p => !p.folded);
          if (activePlayers.length === 1) {
            this.phase = 'showdown';
            this.showdown();
            io.to(gameId).emit('game-state', this.getState());
            
            setTimeout(async () => {
              if (this.id !== 'practice-game') {
                // await saveGameToDatabase(this);
              }
              
              const canContinue = this.startNextHand();
              if (canContinue) {
                io.to(gameId).emit('game-state', this.getState());
                const firstPlayer = this.players[this.currentPlayerIndex];
                if (firstPlayer && this.isCPUPlayer(firstPlayer)) {
                  this.executeCPUAction(io, gameId);
                } else if (firstPlayer) {
                  this.startTurnTimer(io, gameId);
                }
              }
            }, 3000);
            return;
          }
          
          // 次のプレイヤーに移動
          this.currentPlayerIndex = this.getNextActivePlayer((this.currentPlayerIndex + 1) % this.players.length);
          
          // ベッティングラウンドが終了したかチェック
          const activeNonAllInPlayers = this.players.filter(p => !p.folded && !p.isAllIn);
          const allActed = activeNonAllInPlayers.every(p => p.hasActed && p.bet === this.currentBet);
          
          if (allActed || activeNonAllInPlayers.length === 0) {
            this.nextPhase();
          }
          
          io.to(gameId).emit('game-state', this.getState());
          
          // ゲームが終了していたら次のハンドを開始
          if (this.phase === 'finished') {
            setTimeout(async () => {
              // 練習モードでない場合のみデータベースに保存
              if (this.id !== 'practice-game') {
                // await saveGameToDatabase(this);
              }
              
              const canContinue = this.startNextHand();
              if (canContinue) {
                io.to(gameId).emit('game-state', this.getState());
                
                // 次のハンドでCPUがスタートする場合
                const firstPlayer = this.players[this.currentPlayerIndex];
                if (firstPlayer && this.isCPUPlayer(firstPlayer)) {
                  this.executeCPUAction(io, gameId);
                } else if (firstPlayer) {
                  this.startTurnTimer(io, gameId);
                }
              }
            }, 3000);
            return;
          }
          
          // 次のプレイヤーもCPU/離席中なら再帰的に実行
          if (this.phase !== 'finished' && this.phase !== 'showdown') {
            const nextPlayer = this.players[this.currentPlayerIndex];
            if (nextPlayer && (this.isCPUPlayer(nextPlayer) || nextPlayer.isAway)) {
              this.executeCPUAction(io, gameId);
            } else if (nextPlayer) {
              this.startTurnTimer(io, gameId);
            }
          }
        } catch (error) {
          console.error('Auto action error:', error);
        }
      }, thinkingTime);
    }

    getState() {
      return {
        id: this.id,
        type: this.type,
        phase: this.phase,
        players: this.players.map((p) => ({
          ...p,
          cards: p.cards,
        })),
        communityCards: this.communityCards,
        pot: this.pot,
        sidePots: this.sidePots,
        currentBet: this.currentBet,
        currentPlayerIndex: this.currentPlayerIndex,
        dealerIndex: this.dealerIndex,
        winner: this.winner,
        winningHand: this.winningHand,
        winners: this.winners,
        blinds: this.blinds,
      };
    }
  }

  // ロビーにゲーム一覧を送信する関数
  function broadcastLobbyUpdate() {
    const lobbyGames = [];
    for (const [gameId, game] of games.entries()) {
      if (gameId !== 'practice-game') { // 練習モードは除外
        lobbyGames.push({
          id: gameId,
          currentPlayers: game.players.length,
          maxPlayers: game.maxPlayers,
          status: game.phase === 'waiting' ? 'waiting' : game.phase === 'finished' ? 'waiting' : 'playing',
          blinds: game.blinds,
        });
      }
    }
    io.emit('lobby-update', { games: lobbyGames });
  }

  io.on('connection', (socket) => {
    console.log('クライアント接続:', socket.id);
    
    // 接続時に現在のロビー状態を送信
    broadcastLobbyUpdate();

    socket.on('join-game', async ({ gameId, player, blinds, difficulty }) => {
      try {
        console.log('join-game受信:', { gameId, player, blinds, difficulty });
        let game = games.get(gameId);
        
        if (!game) {
          const gameBlinds = blinds || { small: 10, big: 20 };
          console.log('新規ゲーム作成:', { gameId, gameBlinds });
          game = new PokerGame(gameId, 'cash', gameBlinds, difficulty || 'medium');
          console.log('作成されたゲームのブラインド:', game.blinds);
          games.set(gameId, game);
        }

        const existingPlayer = game.players.find(p => p.userId === player.userId);
        if (existingPlayer) {
          socket.join(gameId);
          players.set(socket.id, { gameId, userId: player.userId });
          io.to(gameId).emit('game-state', game.getState());
          return;
        }

        // 練習モード以外はバイインをデータベースから引き落とす
        if (gameId !== 'practice-game' && player.chips > 0) {
          try {
            const { db } = require('./server/db');
            const { users } = require('./shared/schema');
            const { eq } = require('drizzle-orm');

            const [user] = await db.select().from(users).where(eq(users.id, player.userId)).limit(1);
            if (user && user.realChips >= player.chips) {
              // バイイン額を引き落とす
              await db.update(users)
                .set({ realChips: user.realChips - player.chips })
                .where(eq(users.id, player.userId));
              console.log(`プレイヤー ${player.username} がバイイン ${player.chips} チップを支払いました`);
            } else {
              socket.emit('error', { message: 'チップが不足しています' });
              return;
            }
          } catch (dbError) {
            console.error('バイイン処理エラー:', dbError);
            socket.emit('error', { message: 'バイイン処理に失敗しました' });
            return;
          }
        }

        const addedPlayer = game.addPlayer(player);
        socket.join(gameId);
        players.set(socket.id, { gameId, userId: player.userId });

        console.log(`プレイヤー ${player.username} がゲーム ${gameId} に参加しました`);
        
        // 練習モードで最初のプレイヤーの場合、CPUプレイヤーを追加（合計9人）
        if (gameId === 'practice-game' && game.players.length === 1) {
          for (let i = 0; i < 8; i++) {
            const cpuPlayer = createCPUPlayer(i);
            game.addPlayer(cpuPlayer);
          }
          console.log('練習モード: CPUプレイヤー8人を追加しました（合計9人）');
        }
        
        io.to(gameId).emit('game-state', game.getState());
        
        // ロビーに更新を送信
        broadcastLobbyUpdate();

        if (game.players.length >= game.minPlayers && game.phase === 'waiting') {
          setTimeout(() => {
            game.startGame();
            console.log(`ゲーム ${gameId} を開始します`);
            io.to(gameId).emit('game-state', game.getState());
            
            // ロビーに更新を送信（ゲーム開始）
            broadcastLobbyUpdate();
            
            // ゲーム開始後、最初のプレイヤーがCPU/離席中なら自動アクション、それ以外ならタイマー開始
            const firstPlayer = game.players[game.currentPlayerIndex];
            if (firstPlayer && game.isCPUPlayer(firstPlayer)) {
              game.executeCPUAction(io, gameId);
            } else if (firstPlayer) {
              game.startTurnTimer(io, gameId);
            }
          }, 3000);
        }
      } catch (error) {
        console.error('join-game error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('player-action', ({ action, amount }) => {
      try {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) {
          console.log('プレイヤー情報が見つかりません');
          return;
        }

        const game = games.get(playerInfo.gameId);
        if (!game) {
          console.log('ゲームが見つかりません');
          return;
        }

        if (game.phase === 'waiting' || game.phase === 'finished') {
          socket.emit('action-error', { message: 'ゲームが進行中ではありません' });
          return;
        }

        const player = game.players[game.currentPlayerIndex];
        if (!player || player.userId !== playerInfo.userId) {
          socket.emit('action-error', { message: 'あなたのターンではありません' });
          return;
        }

        console.log(`プレイヤー ${player.username} のアクション: ${action}${amount ? ` (${amount})` : ''}`);
        
        // タイマーをクリア
        game.clearTurnTimer();

        switch (action) {
          case 'fold':
            player.folded = true;
            player.hasActed = true;
            player.lastAction = 'FOLD';
            break;

          case 'check':
            if (game.currentBet > player.bet) {
              socket.emit('action-error', { message: 'チェックできません' });
              return;
            }
            player.hasActed = true;
            player.lastAction = 'CHECK';
            break;

          case 'call':
            const callAmount = Math.min(game.currentBet - player.bet, player.chips);
            player.chips -= callAmount;
            player.bet += callAmount;
            player.totalBet += callAmount;
            game.pot += callAmount;
            player.hasActed = true;
            if (player.chips === 0) {
              player.isAllIn = true;
              player.lastAction = 'ALL IN';
            } else {
              player.lastAction = 'CALL';
            }
            break;

          case 'raise':
            if (!amount || amount < game.currentBet + game.blinds.big) {
              socket.emit('action-error', { message: `最小レイズ額は ${game.currentBet + game.blinds.big} です` });
              return;
            }
            const raiseAmount = amount - player.bet;
            if (raiseAmount > player.chips) {
              socket.emit('action-error', { message: 'チップが不足しています' });
              return;
            }
            player.chips -= raiseAmount;
            player.bet = amount;
            player.totalBet += raiseAmount;
            game.pot += raiseAmount;
            game.currentBet = amount;
            game.lastRaiserIndex = game.currentPlayerIndex;
            player.hasActed = true;
            
            for (const p of game.players) {
              if (p.userId !== player.userId && !p.folded && !p.isAllIn) {
                p.hasActed = false;
              }
            }
            
            if (player.chips === 0) {
              player.isAllIn = true;
              player.lastAction = 'ALL IN';
            } else {
              player.lastAction = 'RAISE';
            }
            break;

          case 'all-in':
            const allInAmount = player.chips;
            player.bet += allInAmount;
            player.totalBet += allInAmount;
            game.pot += allInAmount;
            player.chips = 0;
            player.isAllIn = true;
            player.hasActed = true;
            player.lastAction = 'ALL IN';
            
            if (player.bet > game.currentBet) {
              game.currentBet = player.bet;
              game.lastRaiserIndex = game.currentPlayerIndex;
              
              for (const p of game.players) {
                if (p.userId !== player.userId && !p.folded && !p.isAllIn) {
                  p.hasActed = false;
                }
              }
            }
            break;

          default:
            socket.emit('action-error', { message: '無効なアクションです' });
            return;
        }

        const activePlayers = game.players.filter(p => !p.folded);
        if (activePlayers.length === 1) {
          game.phase = 'showdown';
          game.showdown();
          io.to(playerInfo.gameId).emit('game-state', game.getState());

          setTimeout(async () => {
            // 練習モードでない場合のみデータベースに保存
            if (game.id !== 'practice-game') {
              await saveGameToDatabase(game);
            }
            
            const canContinue = game.startNextHand();
            if (canContinue) {
              io.to(playerInfo.gameId).emit('game-state', game.getState());
              
              // 次のハンドでCPUがスタートする場合
              const firstPlayer = game.players[game.currentPlayerIndex];
              if (firstPlayer && game.isCPUPlayer(firstPlayer)) {
                game.executeCPUAction(io, playerInfo.gameId);
              } else if (firstPlayer) {
                game.startTurnTimer(io, playerInfo.gameId);
              }
            } else {
              io.to(playerInfo.gameId).emit('game-ended', { message: 'ゲームが終了しました' });
              games.delete(game.id);
            }
          }, 5000);
          return;
        }

        game.currentPlayerIndex = game.getNextActivePlayer((game.currentPlayerIndex + 1) % game.players.length);

        if (game.isBettingRoundComplete()) {
          game.nextPhase();
          
          if (game.phase === 'finished') {
            io.to(playerInfo.gameId).emit('game-state', game.getState());
            
            setTimeout(async () => {
              // 練習モードでない場合のみデータベースに保存
              if (game.id !== 'practice-game') {
                await saveGameToDatabase(game);
              }
              
              const canContinue = game.startNextHand();
              if (canContinue) {
                io.to(playerInfo.gameId).emit('game-state', game.getState());
                
                // 次のハンドでCPUがスタートする場合
                const firstPlayer = game.players[game.currentPlayerIndex];
                if (firstPlayer && game.isCPUPlayer(firstPlayer)) {
                  game.executeCPUAction(io, playerInfo.gameId);
                } else if (firstPlayer) {
                  game.startTurnTimer(io, playerInfo.gameId);
                }
              } else {
                io.to(playerInfo.gameId).emit('game-ended', { message: 'ゲームが終了しました' });
                games.delete(game.id);
              }
            }, 5000);
            return;
          }
          
          // フェーズ遷移後、次のプレイヤーがCPU/離席中なら自動アクション、それ以外ならタイマー開始
          io.to(playerInfo.gameId).emit('game-state', game.getState());
          const nextPhasePlayer = game.players[game.currentPlayerIndex];
          if (nextPhasePlayer && game.isCPUPlayer(nextPhasePlayer)) {
            game.executeCPUAction(io, playerInfo.gameId);
          } else if (nextPhasePlayer) {
            game.startTurnTimer(io, playerInfo.gameId);
          }
          return;
        }

        io.to(playerInfo.gameId).emit('game-state', game.getState());
        
        // 次のプレイヤーがCPU/離席中なら自動アクション、それ以外ならタイマー開始
        const currentPlayer = game.players[game.currentPlayerIndex];
        if (currentPlayer && game.phase !== 'finished' && game.phase !== 'showdown') {
          if (game.isCPUPlayer(currentPlayer) || currentPlayer.isAway) {
            game.executeCPUAction(io, playerInfo.gameId);
          } else {
            game.startTurnTimer(io, playerInfo.gameId);
          }
        }
      } catch (error) {
        console.error('player-action error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('chat-message', ({ message }) => {
      const playerInfo = players.get(socket.id);
      if (!playerInfo) return;

      const game = games.get(playerInfo.gameId);
      if (!game) return;

      const player = game.players.find((p) => p.userId === playerInfo.userId);
      if (!player) return;

      io.to(playerInfo.gameId).emit('chat-message', {
        username: player.username,
        message,
        timestamp: Date.now(),
      });
    });

    socket.on('set-away-status', ({ isAway }) => {
      const playerInfo = players.get(socket.id);
      if (!playerInfo) return;

      const game = games.get(playerInfo.gameId);
      if (!game) return;

      game.setAwayStatus(playerInfo.userId, isAway);
      io.to(playerInfo.gameId).emit('game-state', game.getState());

      // 離席中に設定した場合、現在のターンならすぐに自動アクション
      const currentPlayer = game.players[game.currentPlayerIndex];
      if (isAway && currentPlayer && currentPlayer.userId === playerInfo.userId && game.phase !== 'finished' && game.phase !== 'showdown') {
        game.executeCPUAction(io, playerInfo.gameId);
      }
    });

    socket.on('disconnect', () => {
      console.log('クライアント切断:', socket.id);
      const playerInfo = players.get(socket.id);
      if (playerInfo) {
        const game = games.get(playerInfo.gameId);
        if (game) {
          const player = game.players.find(p => p.userId === playerInfo.userId);
          if (player) {
            console.log(`プレイヤー ${player.username} が切断しました`);
          }
          
          if (game.phase === 'waiting') {
            game.removePlayer(playerInfo.userId);
            io.to(playerInfo.gameId).emit('game-state', game.getState());
            
            // ロビーに更新を送信
            broadcastLobbyUpdate();
            
            if (game.players.length === 0) {
              games.delete(playerInfo.gameId);
              console.log(`ゲーム ${playerInfo.gameId} を削除しました`);
              
              // ロビーに更新を送信（ゲーム削除）
              broadcastLobbyUpdate();
            }
          }
        }
        players.delete(socket.id);
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Next.js + Socket.io サーバー起動: http://${hostname}:${port}`);
    });
});
