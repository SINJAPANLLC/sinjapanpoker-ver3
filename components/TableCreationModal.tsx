'use client';

import { useState } from 'react';
import { X, Users, Lock, Unlock, Copy, QrCode, Sparkles, Trophy, Zap, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TableCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTable: (tableData: TableData) => void;
  isAdmin?: boolean;
}

interface TableData {
  id?: string;
  name: string;
  type: 'cash' | 'tournament' | 'sit-and-go';
  buyIn?: number;
  minBuyIn?: number;
  maxBuyIn?: number;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  description?: string;
  settings: {
    blinds: { small: number; big: number };
    timeLimit: number;
    rebuyAllowed: boolean;
    addonAllowed: boolean;
  };
}

export default function TableCreationModal({
  isOpen,
  onClose,
  onCreateTable,
  isAdmin = false
}: TableCreationModalProps) {
  const [formData, setFormData] = useState<TableData>({
    name: '',
    type: 'cash',
    minBuyIn: 100,
    maxBuyIn: 1000,
    maxPlayers: 9,
    isPrivate: false,
    password: '',
    description: '',
    settings: {
      blinds: { small: 10, big: 20 },
      timeLimit: 15,
      rebuyAllowed: false,
      addonAllowed: false
    }
  });

  const [step, setStep] = useState(1);
  const [createdTable, setCreatedTable] = useState<TableData | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = () => {
    const tableData = { ...formData };
    if (!tableData.isPrivate) {
      delete tableData.password;
    }
    
    const tableId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    tableData.id = tableId;
    
    setCreatedTable(tableData);
    setShareUrl(`${window.location.origin}/game/active?table=${tableId}`);
    setStep(2);
    onCreateTable(tableData);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyQRCode = () => {
    console.log('QR Code generated for:', shareUrl);
  };

  if (!isOpen) return null;

  const gameTypes = [
    { 
      value: 'cash', 
      label: 'キャッシュゲーム', 
      icon: DollarSign, 
      adminOnly: false,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-500/20 to-teal-600/20'
    },
    { 
      value: 'tournament', 
      label: 'トーナメント', 
      icon: Trophy, 
      adminOnly: true,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-500/20 to-orange-600/20'
    },
    { 
      value: 'sit-and-go', 
      label: 'シット&ゴー', 
      icon: Zap, 
      adminOnly: true,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-500/20 to-purple-600/20'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-gradient-to-br from-gray-900 via-blue-950/30 to-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-blue-500/20 shadow-2xl shadow-blue-500/10"
          >
            {/* 装飾的な背景エフェクト */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* ヘッダー */}
            <div className="relative flex items-center justify-between p-6 border-b border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  {step === 1 ? 'テーブル作成' : 'テーブル作成完了'}
                </h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="relative p-6 overflow-auto max-h-[calc(90vh-180px)] scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-gray-800/50">
              {step === 1 ? (
                <div className="space-y-6">
                  {/* テーブル名 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                      テーブル名
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="テーブル名を入力..."
                      className="w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all placeholder:text-gray-500"
                    />
                  </motion.div>

                  {/* ゲームタイプ */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                      ゲームタイプ
                    </label>
                    {!isAdmin && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-2 text-amber-400 text-sm">
                          <Lock className="w-4 h-4" />
                          <span className="font-medium">トーナメントとシット&ゴーは管理者のみ作成できます</span>
                        </div>
                      </motion.div>
                    )}
                    <div className="grid grid-cols-3 gap-4">
                      {gameTypes.map((type, index) => {
                        const isDisabled = type.adminOnly && !isAdmin;
                        const Icon = type.icon;
                        return (
                          <motion.button
                            key={type.value}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            whileHover={!isDisabled ? { scale: 1.05, y: -5 } : {}}
                            whileTap={!isDisabled ? { scale: 0.95 } : {}}
                            onClick={() => !isDisabled && setFormData({ ...formData, type: type.value as any })}
                            disabled={isDisabled}
                            className={`relative p-5 rounded-2xl border-2 transition-all overflow-hidden ${
                              formData.type === type.value
                                ? `border-transparent bg-gradient-to-br ${type.bgGradient} backdrop-blur-sm shadow-lg`
                                : isDisabled
                                ? 'border-gray-700/50 bg-gray-800/30 opacity-40 cursor-not-allowed'
                                : 'border-gray-600/50 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50 backdrop-blur-sm'
                            }`}
                          >
                            {formData.type === type.value && (
                              <motion.div
                                layoutId="activeGameType"
                                className={`absolute inset-0 bg-gradient-to-br ${type.bgGradient} -z-10`}
                                transition={{ type: "spring", duration: 0.6 }}
                              />
                            )}
                            {isDisabled && (
                              <div className="absolute top-2 right-2 p-1.5 bg-gray-700/80 backdrop-blur-sm rounded-lg">
                                <Lock className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                            <div className="relative z-10">
                              <div className={`mb-3 flex items-center justify-center ${
                                formData.type === type.value 
                                  ? `text-white` 
                                  : isDisabled 
                                  ? 'text-gray-600' 
                                  : 'text-gray-400'
                              }`}>
                                <Icon className="w-8 h-8" />
                              </div>
                              <div className={`text-sm font-bold ${
                                formData.type === type.value 
                                  ? 'text-white' 
                                  : isDisabled 
                                  ? 'text-gray-600' 
                                  : 'text-gray-300'
                              }`}>
                                {type.label}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* ベット設定 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    {formData.type === 'cash' ? (
                      <>
                        <div>
                          <label className="block text-white font-semibold mb-3">最低バイイン</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.minBuyIn}
                              onChange={(e) => setFormData({ ...formData, minBuyIn: parseInt(e.target.value) })}
                              min="10"
                              className="w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">
                              💰
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">最小 {formData.settings.blinds.big * 10} チップ推奨</p>
                        </div>
                        <div>
                          <label className="block text-white font-semibold mb-3">最大バイイン</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.maxBuyIn}
                              onChange={(e) => setFormData({ ...formData, maxBuyIn: parseInt(e.target.value) })}
                              min={formData.minBuyIn || 100}
                              className="w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">
                              💰
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">最大 {formData.settings.blinds.big * 200} チップ推奨</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-white font-semibold mb-3">バイイン</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.buyIn}
                            onChange={(e) => setFormData({ ...formData, buyIn: parseInt(e.target.value) })}
                            className="w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">
                            💰
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-white font-semibold mb-3">最大プレイヤー数</label>
                      <select
                        value={formData.maxPlayers}
                        onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                        className="w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value={6}>6人</option>
                        <option value={7}>7人</option>
                        <option value={8}>8人</option>
                        <option value={9}>9人</option>
                      </select>
                    </div>
                  </motion.div>

                  {/* ブラインド設定 */}
                  {formData.type === 'cash' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-white font-semibold mb-3">スモールブラインド</label>
                        <input
                          type="number"
                          value={formData.settings.blinds.small}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              blinds: { ...formData.settings.blinds, small: parseInt(e.target.value) }
                            }
                          })}
                          className="w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-semibold mb-3">ビッグブラインド</label>
                        <input
                          type="number"
                          value={formData.settings.blinds.big}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              blinds: { ...formData.settings.blinds, big: parseInt(e.target.value) }
                            }
                          })}
                          className="w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* プライバシー設定 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-white font-semibold mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                      プライバシー設定
                    </label>
                    <div className="space-y-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, isPrivate: false })}
                        className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer backdrop-blur-sm ${
                          !formData.isPrivate
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                            : 'border-gray-600/50 bg-gray-800/30 hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${!formData.isPrivate ? 'bg-emerald-500/20' : 'bg-gray-700/50'}`}>
                            <Unlock className={`w-6 h-6 ${!formData.isPrivate ? 'text-emerald-400' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <div className="text-white font-bold">オープンテーブル</div>
                            <div className="text-gray-400 text-sm">誰でも参加可能</div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ scale: !formData.isPrivate ? 1 : 0.8 }}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                            !formData.isPrivate 
                              ? 'border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/50' 
                              : 'border-gray-500'
                          }`}
                        >
                          {!formData.isPrivate && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 bg-white rounded-full"
                            />
                          )}
                        </motion.div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, isPrivate: true })}
                        className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer backdrop-blur-sm ${
                          formData.isPrivate
                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                            : 'border-gray-600/50 bg-gray-800/30 hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${formData.isPrivate ? 'bg-blue-500/20' : 'bg-gray-700/50'}`}>
                            <Lock className={`w-6 h-6 ${formData.isPrivate ? 'text-blue-400' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <div className="text-white font-bold">プライベートテーブル</div>
                            <div className="text-gray-400 text-sm">パスワードが必要</div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ scale: formData.isPrivate ? 1 : 0.8 }}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                            formData.isPrivate 
                              ? 'border-blue-500 bg-blue-500 shadow-lg shadow-blue-500/50' 
                              : 'border-gray-500'
                          }`}
                        >
                          {formData.isPrivate && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 bg-white rounded-full"
                            />
                          )}
                        </motion.div>
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {formData.isPrivate && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="mt-4"
                        >
                          <label className="block text-white font-semibold mb-3">パスワード</label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="パスワードを入力..."
                            className="w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all placeholder:text-gray-500"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* 説明 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                      説明（任意）
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="テーブルの説明を入力..."
                      rows={3}
                      className="w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all placeholder:text-gray-500 resize-none"
                    />
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="relative w-24 h-24 mx-auto"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full animate-pulse" />
                    <div className="absolute inset-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  
                  <div>
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent mb-2"
                    >
                      テーブルが作成されました！
                    </motion.h2>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-400 text-lg"
                    >
                      {createdTable?.name}
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50"
                  >
                    <div className="text-white font-semibold mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      共有リンク
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-4 py-3 bg-gray-900/50 text-white rounded-lg border border-gray-700/50 text-sm font-mono"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyUrl}
                        className={`px-4 py-3 rounded-lg text-white text-sm font-semibold transition-all ${
                          copied 
                            ? 'bg-emerald-600 shadow-lg shadow-emerald-500/50' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50'
                        }`}
                      >
                        {copied ? '✓' : <Copy className="w-5 h-5" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyQRCode}
                        className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-emerald-500/50"
                      >
                        <QrCode className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/20"
                    >
                      <div className="text-blue-400 font-bold text-3xl mb-1">
                        {createdTable?.maxPlayers}
                      </div>
                      <div className="text-gray-400 text-sm font-medium">最大プレイヤー</div>
                    </motion.div>
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-5 border border-amber-500/20"
                    >
                      <div className="text-4xl mb-1">
                        {createdTable?.isPrivate ? '🔒' : '🔓'}
                      </div>
                      <div className="text-gray-400 text-sm font-medium">
                        {createdTable?.isPrivate ? 'プライベート' : 'オープン'}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* フッター */}
            <div className="relative p-6 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
              <div className="flex justify-between gap-4">
                {step === 1 ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="px-8 py-3.5 bg-gray-800/80 text-white rounded-xl font-bold hover:bg-gray-700 transition-all border border-gray-700/50 backdrop-blur-sm"
                    >
                      キャンセル
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: formData.name ? 1.05 : 1 }}
                      whileTap={{ scale: formData.name ? 0.95 : 1 }}
                      onClick={handleSubmit}
                      disabled={!formData.name}
                      className="relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/50 disabled:shadow-none overflow-hidden"
                    >
                      <span className="relative z-10">テーブル作成</span>
                      {formData.name && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          style={{ opacity: 0.3 }}
                        />
                      )}
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold transition-all mx-auto shadow-lg shadow-emerald-500/50"
                  >
                    完了
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
