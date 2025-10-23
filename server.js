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

  class PokerGame {
    constructor(gameId, type, blinds) {
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
        position: this.players.length,
        avatar: player.avatar,
        isDealer: this.players.length === 0,
        hasActed: false,
        lastAction: null,
      };

      this.players.push(newPlayer);
      return newPlayer;
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
      // レーキ計算（5%、キャップあり）
      const rakePercentage = 0.05;
      const stakesLevel = this.blinds.big <= 10 ? 'micro' : 
                         this.blinds.big <= 100 ? 'low' : 
                         this.blinds.big <= 500 ? 'medium' : 'high';
      const rakeCaps = { micro: 3, low: 5, medium: 10, high: 20 };
      
      if (potSize < 10) return 0; // 小さいポットはレーキなし
      
      const rakeAmount = potSize * rakePercentage;
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

  io.on('connection', (socket) => {
    console.log('クライアント接続:', socket.id);

    socket.on('join-game', ({ gameId, player, blinds }) => {
      try {
        console.log('join-game受信:', { gameId, player, blinds });
        let game = games.get(gameId);
        
        if (!game) {
          const gameBlinds = blinds || { small: 10, big: 20 };
          console.log('新規ゲーム作成:', { gameId, gameBlinds });
          game = new PokerGame(gameId, 'cash', gameBlinds);
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

        const addedPlayer = game.addPlayer(player);
        socket.join(gameId);
        players.set(socket.id, { gameId, userId: player.userId });

        console.log(`プレイヤー ${player.username} がゲーム ${gameId} に参加しました`);
        io.to(gameId).emit('game-state', game.getState());

        if (game.players.length >= game.minPlayers && game.phase === 'waiting') {
          setTimeout(() => {
            game.startGame();
            console.log(`ゲーム ${gameId} を開始します`);
            io.to(gameId).emit('game-state', game.getState());
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
            await saveGameToDatabase(game);
            
            const canContinue = game.startNextHand();
            if (canContinue) {
              io.to(playerInfo.gameId).emit('game-state', game.getState());
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
              await saveGameToDatabase(game);
              
              const canContinue = game.startNextHand();
              if (canContinue) {
                io.to(playerInfo.gameId).emit('game-state', game.getState());
              } else {
                io.to(playerInfo.gameId).emit('game-ended', { message: 'ゲームが終了しました' });
                games.delete(game.id);
              }
            }, 5000);
            return;
          }
        }

        io.to(playerInfo.gameId).emit('game-state', game.getState());
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
            
            if (game.players.length === 0) {
              games.delete(playerInfo.gameId);
              console.log(`ゲーム ${playerInfo.gameId} を削除しました`);
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
