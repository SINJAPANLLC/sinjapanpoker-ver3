'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Image, Video, Type, Hash, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { saveForumPosts, loadForumPosts } from '@/lib/storage';

interface PostFormData {
  title: string;
  content: string;
  category: string;
  tags: string;
  type: 'text' | 'video';
  videoUrl?: string;
}

function CreatePostContent() {
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    type: 'text'
  });

  const categories = [
    { value: 'general', label: '一般' },
    { value: 'strategy', label: '戦略' },
    { value: 'tournament', label: 'トーナメント' },
    { value: 'hand-analysis', label: 'ハンド分析' },
    { value: 'community', label: 'コミュニティ' },
    { value: 'feedback', label: 'フィードバック' }
  ];

  const handleInputChange = (field: keyof PostFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('タイトルを入力してください');
      return false;
    }
    if (formData.title.length > 100) {
      setError('タイトルは100文字以内で入力してください');
      return false;
    }
    if (!formData.content.trim()) {
      setError('内容を入力してください');
      return false;
    }
    if (formData.content.length > 5000) {
      setError('内容は5000文字以内で入力してください');
      return false;
    }
    if (formData.type === 'video' && !formData.videoUrl?.trim()) {
      setError('ビデオURLを入力してください');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // API呼び出し
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: 'current_user', // 実際のアプリケーションでは認証されたユーザーIDを使用
          username: 'You' // 実際のアプリケーションでは認証されたユーザー名を使用
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '投稿の作成に失敗しました');
      }
      
      const result = await response.json();
      console.log('投稿が作成されました:', result);
      
      // LocalStorageにも保存
      if (result.post) {
        const existingPosts = loadForumPosts();
        saveForumPosts([result.post, ...existingPosts]);
      }
      
      // フォーラムページにリダイレクト（最新タブで表示）
      router.push('/forum?tab=latest');
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-4 animate-slide-in-down">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-gradient-blue">新しい投稿を作成</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="card-blue animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 投稿タイプ選択 */}
            <div>
              <label className="block text-white font-semibold mb-3">投稿タイプ</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'text')}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.type === 'text'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <Type className="w-5 h-5" />
                  <span>テキスト投稿</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'video')}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.type === 'video'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <Video className="w-5 h-5" />
                  <span>ビデオ投稿</span>
                </button>
              </div>
            </div>

            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-white font-semibold mb-2">
                タイトル <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="投稿のタイトルを入力してください"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                maxLength={100}
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {formData.title.length}/100
              </div>
            </div>

            {/* カテゴリ */}
            <div>
              <label htmlFor="category" className="block text-white font-semibold mb-2">
                カテゴリ
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* タグ */}
            <div>
              <label htmlFor="tags" className="block text-white font-semibold mb-2">
                タグ
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="タグをスペース区切りで入力（例: ポーカー 戦略 初心者）"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="text-sm text-gray-400 mt-1">
                複数のタグはスペースで区切って入力してください
              </div>
            </div>

            {/* ビデオURL（ビデオ投稿の場合） */}
            {formData.type === 'video' && (
              <div>
                <label htmlFor="videoUrl" className="block text-white font-semibold mb-2">
                  ビデオURL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  value={formData.videoUrl || ''}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="YouTube、VimeoなどのビデオURLを入力"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            )}

            {/* 内容 */}
            <div>
              <label htmlFor="content" className="block text-white font-semibold mb-2">
                内容 <span className="text-red-400">*</span>
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="投稿の内容を入力してください..."
                rows={12}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                maxLength={5000}
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {formData.content.length}/5000
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400">{error}</span>
              </div>
            )}

            {/* 投稿ボタン */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-6 py-3 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>投稿中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>投稿する</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <ProtectedRoute>
      <CreatePostContent />
    </ProtectedRoute>
  );
}
