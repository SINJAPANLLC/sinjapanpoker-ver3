import { NextRequest, NextResponse } from 'next/server';
import { determineWinner } from '@/lib/poker-engine';
import type { Action } from '@/types';
import gameStore from '@/lib/game-store';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const body = await request.json();
    const { playerId, action, amount = 0 }: { playerId: string; action: Action; amount?: number } = body;

    const game = gameStore.getGame(gameId);
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const player = game.players[playerIndex];

    if (player.folded) {
      return NextResponse.json(
        { error: 'Player has folded' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'fold':
        player.folded = true;
        break;

      case 'check':
        if (player.bet < game.currentBet) {
          return NextResponse.json(
            { error: 'Cannot check, must call or raise' },
            { status: 400 }
          );
        }
        break;

      case 'call':
        const callAmount = game.currentBet - player.bet;
        if (player.chips < callAmount) {
          return NextResponse.json(
            { error: 'Not enough chips' },
            { status: 400 }
          );
        }
        player.chips -= callAmount;
        player.bet += callAmount;
        game.pot += callAmount;
        break;

      case 'raise':
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { error: 'Invalid raise amount' },
            { status: 400 }
          );
        }
        const totalRaise = game.currentBet - player.bet + amount;
        if (player.chips < totalRaise) {
          return NextResponse.json(
            { error: 'Not enough chips' },
            { status: 400 }
          );
        }
        player.chips -= totalRaise;
        player.bet += totalRaise;
        game.pot += totalRaise;
        game.currentBet = player.bet;
        break;

      case 'all-in':
        const allInAmount = player.chips;
        game.pot += allInAmount;
        player.bet += allInAmount;
        player.chips = 0;
        player.isAllIn = true;
        if (player.bet > game.currentBet) {
          game.currentBet = player.bet;
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    player.hasActed = true;
    game.updatedAt = new Date();

    const activePlayers = game.players.filter(p => !p.folded && !p.isAllIn);
    
    // 1人以外全員フォールドした場合（早期終了）
    if (activePlayers.length <= 1) {
      game.phase = 'showdown';
      // 早期終了の場合はハンド評価せず、残ったプレイヤーにポットを渡す
      const remainingPlayers = game.players.filter(p => !p.folded);
      
      remainingPlayers.forEach(player => {
        player.chips += Math.floor(game.pot / remainingPlayers.length);
      });
      
      game.phase = 'finished';
    } else {
      // 次のプレイヤーに移動
      do {
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
      } while (
        game.players[game.currentPlayerIndex].folded ||
        game.players[game.currentPlayerIndex].isAllIn
      );

      // ベッティングラウンド完了チェック
      const allPlayersActed = game.players.every(p => p.folded || p.isAllIn || p.hasActed);
      const allBetsEqual = game.players
        .filter(p => !p.folded && !p.isAllIn)
        .every(p => p.bet === game.currentBet);

      if (allPlayersActed && allBetsEqual) {
        // ベッティングラウンド完了 - 次のフェーズへ
        game.players.forEach(p => p.hasActed = false);
        
        // 既存のデッキがない場合は新しく作成（簡易実装）
        if (!game.deck || game.deck.length === 0) {
          const { createDeck, shuffleDeck } = require('@/lib/poker-engine');
          const newDeck = shuffleDeck(createDeck());
          // プレイヤーカードとコミュニティカードを除外
          const usedCards = [
            ...game.players.flatMap(p => p.cards),
            ...game.communityCards
          ];
          game.deck = newDeck.filter(card => 
            !usedCards.some(used => used.suit === card.suit && used.rank === card.rank)
          );
        }

        switch (game.phase) {
          case 'preflop':
            // フロップ: 3枚配る
            game.communityCards = game.deck.splice(0, 3);
            game.phase = 'flop';
            game.currentBet = 0;
            game.players.forEach(p => { p.bet = 0; });
            break;
          
          case 'flop':
            // ターン: 1枚配る
            game.communityCards.push(game.deck.shift()!);
            game.phase = 'turn';
            game.currentBet = 0;
            game.players.forEach(p => { p.bet = 0; });
            break;
          
          case 'turn':
            // リバー: 1枚配る
            game.communityCards.push(game.deck.shift()!);
            game.phase = 'river';
            game.currentBet = 0;
            game.players.forEach(p => { p.bet = 0; });
            break;
          
          case 'river':
            // ショーダウン
            game.phase = 'showdown';
            const winners = determineWinner(
              game.players.filter(p => !p.folded),
              game.communityCards
            );
            
            if (winners.length > 0) {
              const winAmount = Math.floor(game.pot / winners.length);
              winners.forEach(winnerId => {
                const winner = game.players.find(p => p.id === winnerId);
                if (winner) {
                  winner.chips += winAmount;
                  game.winnerId = winnerId;
                }
              });
            }
            
            setTimeout(() => {
              game.phase = 'finished';
            }, 3000);
            break;
        }
      }
    }

    gameStore.setGame(gameId, game);

    // ボットプレイヤーの自動アクション
    if (game.phase !== 'finished' && game.phase !== 'showdown') {
      const currentPlayer = game.players[game.currentPlayerIndex];
      if (currentPlayer.userId.startsWith('bot-')) {
        // 簡易ボットロジック: ランダムにアクションを実行
        setTimeout(() => {
          const botAction = Math.random() > 0.5 ? 'call' : 'fold';
          
          if (botAction === 'call') {
            const callAmount = game.currentBet - currentPlayer.bet;
            if (currentPlayer.chips >= callAmount) {
              currentPlayer.chips -= callAmount;
              currentPlayer.bet += callAmount;
              game.pot += callAmount;
            } else {
              currentPlayer.folded = true;
            }
          } else {
            currentPlayer.folded = true;
          }
          
          currentPlayer.hasActed = true;
          game.updatedAt = new Date();

          // ベッティングラウンド完了チェック（同じロジック）
          const activePlayers2 = game.players.filter(p => !p.folded && !p.isAllIn);
          
          if (activePlayers2.length <= 1) {
            game.phase = 'showdown';
            // 早期終了の場合はハンド評価せず、残ったプレイヤーにポットを渡す
            const remainingPlayers = game.players.filter(p => !p.folded);
            
            remainingPlayers.forEach(player => {
              player.chips += Math.floor(game.pot / remainingPlayers.length);
            });
            
            game.phase = 'finished';
          } else {
            // 次のプレイヤーに移動
            do {
              game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
            } while (
              game.players[game.currentPlayerIndex].folded ||
              game.players[game.currentPlayerIndex].isAllIn
            );

            // ベッティングラウンド完了チェック
            const allPlayersActed2 = game.players.every(p => p.folded || p.isAllIn || p.hasActed);
            const allBetsEqual2 = game.players
              .filter(p => !p.folded && !p.isAllIn)
              .every(p => p.bet === game.currentBet);

            if (allPlayersActed2 && allBetsEqual2) {
              game.players.forEach(p => p.hasActed = false);
              
              if (!game.deck || game.deck.length === 0) {
                const { createDeck: cd, shuffleDeck: sd } = require('@/lib/poker-engine');
                const newDeck = sd(cd());
                const usedCards = [
                  ...game.players.flatMap(p => p.cards),
                  ...game.communityCards
                ];
                game.deck = newDeck.filter(card => 
                  !usedCards.some(used => used.suit === card.suit && used.rank === card.rank)
                );
              }

              switch (game.phase) {
                case 'preflop':
                  game.communityCards = game.deck!.splice(0, 3);
                  game.phase = 'flop';
                  game.currentBet = 0;
                  game.players.forEach(p => { p.bet = 0; });
                  break;
                
                case 'flop':
                  game.communityCards.push(game.deck!.shift()!);
                  game.phase = 'turn';
                  game.currentBet = 0;
                  game.players.forEach(p => { p.bet = 0; });
                  break;
                
                case 'turn':
                  game.communityCards.push(game.deck!.shift()!);
                  game.phase = 'river';
                  game.currentBet = 0;
                  game.players.forEach(p => { p.bet = 0; });
                  break;
                
                case 'river':
                  game.phase = 'showdown';
                  const winners2 = determineWinner(
                    game.players.filter(p => !p.folded),
                    game.communityCards
                  );
                  
                  if (winners2.length > 0) {
                    const winAmount = Math.floor(game.pot / winners2.length);
                    winners2.forEach(winnerId => {
                      const winner = game.players.find(p => p.id === winnerId);
                      if (winner) {
                        winner.chips += winAmount;
                        game.winnerId = winnerId;
                      }
                    });
                  }
                  
                  setTimeout(() => {
                    game.phase = 'finished';
                    gameStore.setGame(gameId, game);
                  }, 3000);
                  break;
              }
            }
          }

          gameStore.setGame(gameId, game);
        }, 1500);
      }
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error performing action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
