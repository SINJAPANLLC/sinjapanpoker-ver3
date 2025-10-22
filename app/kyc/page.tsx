'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaIdCard, FaCamera, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import ProtectedRoute from '@/components/ProtectedRoute';

function KYCContent() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState({ id: null as File | null, selfie: null as File | null, address: null as File | null });
  const [previews, setPreviews] = useState({ id: '', selfie: '', address: '' });

  const handleFileUpload = (type: 'id' | 'selfie' | 'address', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [type]: reader.result as string }));
      setFiles(prev => ({ ...prev, [type]: file }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/profile" className="text-blue-400 hover:text-cyan-300">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gradient-blue">KYC本人確認</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* ステップインジケーター */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white' : 'glass text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-20 h-1 mx-2 ${
                  step > s ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-gray-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* ステップ1 */}
        {step === 1 && (
          <div className="card animate-scale-in">
            <div className="text-center mb-6">
              <FaIdCard className="text-6xl text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">本人確認書類</h2>
              <p className="text-gray-400">パスポート・免許証・マイナンバーカード</p>
            </div>

            {previews.id ? (
              <div className="mb-6">
                <img src={previews.id} alt="ID" className="w-full rounded-xl" />
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-700 hover:border-blue-400 rounded-xl p-12 text-center cursor-pointer transition-colors mb-6">
                <FaFileAlt className="text-5xl text-gray-600 mx-auto mb-3" />
                <span className="text-gray-400">クリックしてアップロード</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('id', e.target.files[0])}
                />
              </label>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!files.id}
              className="btn-primary w-full"
            >
              次へ
            </button>
          </div>
        )}

        {/* ステップ2 */}
        {step === 2 && (
          <div className="card animate-scale-in">
            <div className="text-center mb-6">
              <FaCamera className="text-6xl text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">自撮り写真</h2>
              <p className="text-gray-400">顔がはっきり写る写真</p>
            </div>

            {previews.selfie ? (
              <div className="mb-6">
                <img src={previews.selfie} alt="Selfie" className="w-full rounded-xl" />
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-700 hover:border-blue-400 rounded-xl p-12 text-center cursor-pointer transition-colors mb-6">
                <FaCamera className="text-5xl text-gray-600 mx-auto mb-3" />
                <span className="text-gray-400">クリックして撮影</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
                />
              </label>
            )}

            <div className="flex space-x-4">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">戻る</button>
              <button onClick={() => setStep(3)} disabled={!files.selfie} className="btn-primary flex-1">次へ</button>
            </div>
          </div>
        )}

        {/* ステップ3 */}
        {step === 3 && (
          <div className="card animate-scale-in">
            <div className="text-center mb-6">
              <FaFileAlt className="text-6xl text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">住所確認書類</h2>
              <p className="text-gray-400">公共料金領収書・住民票</p>
            </div>

            {previews.address ? (
              <div className="mb-6">
                <img src={previews.address} alt="Address" className="w-full rounded-xl" />
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-700 hover:border-blue-400 rounded-xl p-12 text-center cursor-pointer transition-colors mb-6">
                <FaFileAlt className="text-5xl text-gray-600 mx-auto mb-3" />
                <span className="text-gray-400">クリックしてアップロード</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('address', e.target.files[0])}
                />
              </label>
            )}

            <div className="flex space-x-4">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">戻る</button>
              <button
                onClick={() => alert('KYC書類を送信しました')}
                disabled={!files.address}
                className="btn-primary flex-1"
              >
                送信
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function KYCPage() {
  return (
    <ProtectedRoute>
      <KYCContent />
    </ProtectedRoute>
  );
}