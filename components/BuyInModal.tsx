'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BuyInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  minBuyIn: number;
  maxBuyIn: number;
  currentChips: number;
  tableType: 'cash' | 'tournament';
}

export default function BuyInModal({
  isOpen,
  onClose,
  onConfirm,
  minBuyIn,
  maxBuyIn,
  currentChips,
  tableType
}: BuyInModalProps) {
  const [buyInAmount, setBuyInAmount] = useState(minBuyIn);
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (buyInAmount < minBuyIn || buyInAmount > maxBuyIn) {
      setError(`バイイン額は${minBuyIn}～${maxBuyIn}チップの範囲で設定してください`);
      return;
    }

    if (buyInAmount > currentChips) {
      setError(`所持チップ（${currentChips}）が不足しています`);
      return;
    }

    onConfirm(buyInAmount);
    onClose();
  };

  const presetAmounts = [
    minBuyIn,
    Math.floor((minBuyIn + maxBuyIn) / 2),
    maxBuyIn,
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border border-emerald-500/30 shadow-2xl"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">💰 バイイン額を選択</h2>
              <p className="text-gray-400">
                {tableType === 'cash' ? 'テーブルに持ち込むチップ額を選択してください' : 'トーナメント参加費'}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">バイイン額</label>
                <div className="relative">
                  <input
                    type="number"
                    min={minBuyIn}
                    max={Math.min(maxBuyIn, currentChips)}
                    value={buyInAmount}
                    onChange={(e) => {
                      setBuyInAmount(parseInt(e.target.value) || minBuyIn);
                      setError('');
                    }}
                    className="w-full px-5 py-4 bg-gray-800/50 text-white text-xl font-bold rounded-xl border border-gray-600/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-xl">
                    🎰
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>最低: {minBuyIn}</span>
                  <span>最大: {Math.min(maxBuyIn, currentChips)}</span>
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">クイック選択</label>
                <div className="grid grid-cols-3 gap-3">
                  {presetAmounts.map((amount) => {
                    const isAvailable = amount <= currentChips;
                    return (
                      <button
                        key={amount}
                        onClick={() => {
                          if (isAvailable) {
                            setBuyInAmount(amount);
                            setError('');
                          }
                        }}
                        disabled={!isAvailable}
                        className={`px-4 py-3 rounded-xl font-bold transition-all ${
                          isAvailable
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50'
                            : 'bg-gray-700/30 text-gray-500 cursor-not-allowed border border-gray-600/30'
                        }`}
                      >
                        {amount}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">現在の所持チップ</span>
                  <span className="text-white font-bold">{currentChips}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">参加後の残高</span>
                  <span className={`font-bold ${currentChips - buyInAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {currentChips - buyInAmount}
                  </span>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-700/50 text-white rounded-xl hover:bg-gray-700 transition-all font-bold"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-bold shadow-lg"
                >
                  参加する
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
