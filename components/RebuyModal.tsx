'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RebuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  minBuyIn: number;
  maxBuyIn: number;
  currentTableChips: number;
  currentWalletChips: number;
}

export default function RebuyModal({
  isOpen,
  onClose,
  onConfirm,
  minBuyIn,
  maxBuyIn,
  currentTableChips,
  currentWalletChips
}: RebuyModalProps) {
  const [rebuyAmount, setRebuyAmount] = useState(minBuyIn);
  const [error, setError] = useState('');

  const maxAllowedRebuy = Math.min(maxBuyIn - currentTableChips, currentWalletChips);

  const handleConfirm = () => {
    if (rebuyAmount < minBuyIn) {
      setError(`最低${minBuyIn}チップから追加できます`);
      return;
    }

    if (currentTableChips + rebuyAmount > maxBuyIn) {
      setError(`テーブルの最大チップ数は${maxBuyIn}です`);
      return;
    }

    if (rebuyAmount > currentWalletChips) {
      setError(`所持チップ（${currentWalletChips}）が不足しています`);
      return;
    }

    onConfirm(rebuyAmount);
    onClose();
  };

  const presetAmounts = [
    minBuyIn,
    Math.min(Math.floor(maxAllowedRebuy / 2), minBuyIn * 2),
    Math.min(maxAllowedRebuy, maxBuyIn - currentTableChips),
  ].filter(amount => amount > 0 && amount <= maxAllowedRebuy);

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
            className="relative bg-gradient-to-br from-purple-900 via-indigo-800 to-purple-900 rounded-2xl p-8 max-w-md w-full border border-purple-500/30 shadow-2xl"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">🔄 リバイ/トップアップ</h2>
              <p className="text-gray-300">
                テーブルにチップを追加します
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">追加チップ額</label>
                <div className="relative">
                  <input
                    type="number"
                    min={minBuyIn}
                    max={Math.min(maxAllowedRebuy, maxBuyIn - currentTableChips)}
                    value={rebuyAmount}
                    onChange={(e) => {
                      setRebuyAmount(parseInt(e.target.value) || minBuyIn);
                      setError('');
                    }}
                    className="w-full px-5 py-4 bg-gray-800/50 text-white text-xl font-bold rounded-xl border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 text-xl">
                    🎰
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>最低: {minBuyIn}</span>
                  <span>最大: {Math.min(maxAllowedRebuy, maxBuyIn - currentTableChips)}</span>
                </div>
              </div>

              {presetAmounts.length > 0 && (
                <div>
                  <label className="block text-white font-semibold mb-3">クイック選択</label>
                  <div className="grid grid-cols-3 gap-3">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setRebuyAmount(amount);
                          setError('');
                        }}
                        className="px-4 py-3 rounded-xl font-bold transition-all bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/50"
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">現在のテーブルチップ</span>
                  <span className="text-white font-bold">{currentTableChips}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">追加後のテーブルチップ</span>
                  <span className="text-purple-400 font-bold">{currentTableChips + rebuyAmount}</span>
                </div>
                <div className="border-t border-gray-700 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">ウォレット残高</span>
                  <span className="text-white font-bold">{currentWalletChips}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">追加後の残高</span>
                  <span className={`font-bold ${currentWalletChips - rebuyAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {currentWalletChips - rebuyAmount}
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all font-bold shadow-lg"
                >
                  追加する
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
