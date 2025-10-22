import { useState } from 'react';

interface GameActionsProps {
  currentBet: number;
  myBet: number;
  myChips: number;
  onAction: (action: string, amount?: number) => void;
  disabled?: boolean;
}

export default function GameActions({
  currentBet,
  myBet,
  myChips,
  onAction,
  disabled = false,
}: GameActionsProps) {
  const [raiseAmount, setRaiseAmount] = useState(currentBet * 2);

  const canCheck = myBet === currentBet;
  const callAmount = currentBet - myBet;
  const minRaise = currentBet * 2;

  const handleRaise = () => {
    if (raiseAmount >= minRaise && raiseAmount <= myChips) {
      onAction('raise', raiseAmount);
      setRaiseAmount(minRaise);
    }
  };

  return (
    <div className="bg-gray-800 border-t-2 border-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* レイズスライダー */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-white font-semibold">レイズ額</label>
            <span className="text-yellow-500 font-bold">{raiseAmount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={minRaise}
            max={myChips}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>最小: {minRaise.toLocaleString()}</span>
            <span>最大: {myChips.toLocaleString()}</span>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={() => onAction('fold')}
            disabled={disabled}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            フォールド
          </button>

          {canCheck ? (
            <button
              onClick={() => onAction('check')}
              disabled={disabled}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              チェック
            </button>
          ) : (
            <button
              onClick={() => onAction('call', callAmount)}
              disabled={disabled || callAmount > myChips}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              コール
              <div className="text-xs">{callAmount.toLocaleString()}</div>
            </button>
          )}

          <button
            onClick={handleRaise}
            disabled={disabled || raiseAmount > myChips}
            className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            レイズ
          </button>

          <button
            onClick={() => onAction('all-in')}
            disabled={disabled}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            オールイン
          </button>

          <button
            onClick={() => setRaiseAmount(myChips)}
            disabled={disabled}
            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            最大
          </button>
        </div>
      </div>
    </div>
  );
}

