'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

interface ActionButtonsProps {
  currentBet: number;
  myChips: number;
  myBet: number;
  onAction: (action: 'fold' | 'check' | 'call' | 'raise' | 'all-in', amount?: number) => void;
  disabled?: boolean;
}

export default function ActionButtons({ currentBet, myChips, myBet, onAction, disabled = false }: ActionButtonsProps) {
  const [raiseAmount, setRaiseAmount] = useState(currentBet * 2);
  const [showRaiseInput, setShowRaiseInput] = useState(false);

  const callAmount = currentBet - myBet;
  const canCheck = currentBet === myBet;
  const canRaise = myChips > callAmount;

  const handleFold = () => {
    onAction('fold');
  };

  const handleCheckOrCall = () => {
    if (canCheck) {
      onAction('check');
    } else {
      onAction('call');
    }
  };

  const handleRaise = () => {
    if (showRaiseInput) {
      onAction('raise', raiseAmount);
      setShowRaiseInput(false);
    } else {
      setShowRaiseInput(true);
    }
  };

  const handleAllIn = () => {
    onAction('all-in');
  };

  const incrementRaise = () => {
    setRaiseAmount(prev => Math.min(prev + currentBet, myChips));
  };

  const decrementRaise = () => {
    setRaiseAmount(prev => Math.max(prev - currentBet, currentBet * 2));
  };

  if (disabled) {
    return (
      <div className="glass-strong p-6 rounded-2xl">
        <p className="text-center text-gray-400">他のプレイヤーのターンです...</p>
      </div>
    );
  }

  return (
    <div className="glass-strong p-6 rounded-2xl space-y-4">
      {showRaiseInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-3"
        >
          <button onClick={decrementRaise} className="btn-secondary-small">
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <input
              type="number"
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Math.max(currentBet * 2, Math.min(Number(e.target.value), myChips)))}
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-xl text-white text-center focus:outline-none focus:border-blue-400"
              min={currentBet * 2}
              max={myChips}
            />
          </div>
          <button onClick={incrementRaise} className="btn-secondary-small">
            <Plus className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFold}
          className="px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-bold shadow-lg transition-all"
        >
          フォールド
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCheckOrCall}
          className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-bold shadow-lg transition-all"
        >
          {canCheck ? 'チェック' : `コール (${callAmount.toLocaleString()})`}
        </motion.button>

        {canRaise && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRaise}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg transition-all"
          >
            {showRaiseInput ? `レイズ (${raiseAmount.toLocaleString()})` : 'レイズ'}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAllIn}
          className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg transition-all"
        >
          オールイン ({myChips.toLocaleString()})
        </motion.button>
      </div>

      <div className="flex justify-between text-sm text-gray-300">
        <span>現在のベット: {currentBet.toLocaleString()}</span>
        <span>あなたのチップ: {myChips.toLocaleString()}</span>
      </div>
    </div>
  );
}
