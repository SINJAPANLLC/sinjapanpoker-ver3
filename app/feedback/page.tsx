'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPaperPlane, FaStar } from 'react-icons/fa';
import ProtectedRoute from '@/components/ProtectedRoute';

function FeedbackContent() {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        </div>
        <div className="relative z-10 card text-center max-w-md mx-4 animate-scale-in">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">送信完了</h2>
          <p className="text-gray-400 mb-8">ご協力ありがとうございます</p>
          <Link href="/profile" className="btn-primary">
            プロフィールに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/profile" className="text-blue-400 hover:text-cyan-300">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gradient-blue">ご意見箱</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="card animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-3">評価</label>
              <div className="flex justify-center space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-all hover-scale ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-700'
                    }`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-3">フィードバック</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="ご意見、ご要望をお聞かせください..."
                className="h-40 resize-none"
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center space-x-2">
              <FaPaperPlane />
              <span>送信する</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <ProtectedRoute>
      <FeedbackContent />
    </ProtectedRoute>
  );
}