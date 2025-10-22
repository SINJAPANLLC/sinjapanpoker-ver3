const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const {
  calculateSidePots,
  determineWinners,
  distributePots,
  validateBet,
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
      this.currentBet = 0;
      this.currentPlayerIndex = 0;
      this.dealerIndex = 0;
      this.blinds = blinds || { small: 10, big: 20 };
      this.minPlayers = 2;
      this.maxPlayers = 9;
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
        cards: [],
        folded: false,
        isAllIn: false,
        position: this.players.length,
        isDealer: this.players.length === 0,
        hasActed: false,
      };

      this.players.push(newPlayer);
      return newPlayer;
    }

    removePlayer(userId) {
      this.players = this.players.filter((p) => p.userId !== userId);
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

      this.phase = 'preflop';
      this.dealCards();
      this.postBlinds();
    }

    postBlinds() {
      const smallBlindIndex = (this.dealerIndex + 1) % this.players.length;
      const bigBlindIndex = (this.dealerIndex + 2) % this.players.length;

      this.players[smallBlindIndex].bet = this.blinds.small;
      this.players[smallBlindIndex].chips -= this.blinds.small;
      this.pot += this.blinds.small;

      this.players[bigBlindIndex].bet = this.blinds.big;
      this.players[bigBlindIndex].chips -= this.blinds.big;
      this.pot += this.blinds.big;

      this.currentBet = this.blinds.big;
      this.currentPlayerIndex = (bigBlindIndex + 1) % this.players.length;
    }

    nextPhase() {
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
      }

      this.currentBet = 0;
      this.players.forEach((p) => {
        p.bet = 0;
        p.hasActed = false;
      });
      this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;
    }

    showdown() {
      const activePlayers = this.players.filter((p) => !p.folded);
      if (activePlayers.length === 1) {
        this.winner = activePlayers[0].username;
        activePlayers[0].chips += this.pot;
        this.phase = 'finished';
        return;
      }

      const winners = determineWinners(activePlayers, this.communityCards);
      if (winners && winners.length > 0) {
        const shareAmount = Math.floor(this.pot / winners.length);
        winners.forEach((winner) => {
          const player = this.players.find((p) => p.userId === winner.playerId);
          if (player) {
            player.chips += shareAmount;
          }
        });
        this.winner = winners.map((w) => w.username).join(', ');
        this.winningHand = winners[0]?.handRank || '';
      }

      this.phase = 'finished';
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
        currentBet: this.currentBet,
        currentPlayerIndex: this.currentPlayerIndex,
        winner: this.winner,
        winningHand: this.winningHand,
      };
    }
  }

  io.on('connection', (socket) => {
    console.log('クライアント接続:', socket.id);

    socket.on('join-game', ({ gameId, player }) => {
      try {
        let game = games.get(gameId);
        
        if (!game) {
          game = new PokerGame(gameId, 'cash', { small: 10, big: 20 });
          games.set(gameId, game);
        }

        const addedPlayer = game.addPlayer(player);
        socket.join(gameId);
        players.set(socket.id, { gameId, userId: player.userId });

        io.to(gameId).emit('game-state', game.getState());

        if (game.players.length >= game.minPlayers && game.phase === 'waiting') {
          setTimeout(() => {
            game.startGame();
            io.to(gameId).emit('game-state', game.getState());
          }, 2000);
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('player-action', ({ action, amount }) => {
      try {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) return;

        const game = games.get(playerInfo.gameId);
        if (!game) return;

        const player = game.players[game.currentPlayerIndex];
        if (!player || player.userId !== playerInfo.userId) {
          socket.emit('action-error', { message: 'あなたのターンではありません' });
          return;
        }

        switch (action) {
          case 'fold':
            player.folded = true;
            break;
          case 'check':
            if (game.currentBet > player.bet) {
              socket.emit('action-error', { message: 'チェックできません' });
              return;
            }
            break;
          case 'call':
            const callAmount = game.currentBet - player.bet;
            player.chips -= callAmount;
            player.bet = game.currentBet;
            game.pot += callAmount;
            break;
          case 'raise':
            if (!amount || amount < game.currentBet * 2) {
              socket.emit('action-error', { message: '無効なレイズ額です' });
              return;
            }
            const raiseAmount = amount - player.bet;
            player.chips -= raiseAmount;
            player.bet = amount;
            game.pot += raiseAmount;
            game.currentBet = amount;
            break;
          case 'all-in':
            const allInAmount = player.chips;
            player.bet += allInAmount;
            game.pot += allInAmount;
            player.chips = 0;
            player.isAllIn = true;
            if (player.bet > game.currentBet) {
              game.currentBet = player.bet;
            }
            break;
        }

        player.hasActed = true;

        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;

        const activePlayers = game.players.filter((p) => !p.folded);
        if (activePlayers.length === 1) {
          game.phase = 'showdown';
          game.showdown();
        } else if (game.players.every((p) => p.folded || p.hasActed)) {
          game.nextPhase();
        }

        io.to(playerInfo.gameId).emit('game-state', game.getState());

        if (game.phase === 'finished') {
          setTimeout(async () => {
            await saveGameToDatabase(game);
            games.delete(game.id);
          }, 5000);
        }
      } catch (error) {
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
          game.removePlayer(playerInfo.userId);
          io.to(playerInfo.gameId).emit('game-state', game.getState());
          
          if (game.players.length === 0) {
            games.delete(playerInfo.gameId);
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
