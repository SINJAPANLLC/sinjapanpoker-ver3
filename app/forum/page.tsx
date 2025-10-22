'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Flame, Clock, Star, MessageCircle, Eye, ShoppingCart, BarChart3, User, Gamepad2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useForumPosts } from '@/hooks/useForumPosts';

function ForumContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('popular');
  const { posts, loading } = useForumPosts(activeTab);

  // URLパラメータからタブを初期化
  useEffect(() => {
    if (searchParams) {
      const tabParam = searchParams.get('tab');
      if (tabParam && ['featured', 'popular', 'latest'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams]);

  const tabs = [
    { id: 'featured', label: '厳選', icon: <Star className="w-4 h-4" /> },
    { id: 'popular', label: '人気', icon: <Flame className="w-4 h-4" /> },
    { id: 'latest', label: '最新', icon: <Clock className="w-4 h-4" /> }
  ];

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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src="https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/70686fc0-87b1-013e-fa57-0a58a9feac02/SJsP-thumbnail.png"
              alt="SIN JAPAN POKER"
              className="w-32 h-10 rounded-lg object-cover"
            />
            <h1 className="text-2xl font-bold text-gradient-blue">フォーラム</h1>
          </div>

          <button 
            onClick={() => router.push('/forum/create')}
            className="btn-primary px-6 py-2 flex items-center space-x-2 hover:scale-105 transition-transform"
          >
            <Plus />
            <span>投稿</span>
          </button>
        </div>
      </header>

      {/* タブ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-center space-x-4 glass-strong rounded-2xl p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 投稿リスト */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="card-blue max-w-md mx-auto p-12">
              <MessageCircle className="w-16 h-16 mx-auto mb-6 text-gray-600" />
              <h3 className="text-2xl font-bold text-white mb-4">まだ投稿がありません</h3>
              <p className="text-gray-400 mb-8">最初の投稿をして、コミュニティを盛り上げましょう！</p>
              <button 
                onClick={() => router.push('/forum/create')}
                className="btn-primary px-8 py-3 flex items-center space-x-2 mx-auto hover:scale-105 transition-transform"
              >
                <Plus />
                <span>最初の投稿を作成</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-slide-in-up">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={`/forum/${post.id}`}
                className="card hover-lift group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start space-x-4">
                  {post.videoThumbnail && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                      {post.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                          <span className="text-3xl">▶️</span>
                        </div>
                      ) : (
                        <img src={post.videoThumbnail} alt={post.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {post.type === 'video' ? 'ビデオ投稿' : post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle />
                        <span>{post.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>by {post.username}</span>
                      </div>
                      <div>{post.date}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 p-6 z-20">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link href="/shop" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">ショップ</span>
          </Link>
          <Link href="/forum" className="flex flex-col items-center space-y-2 text-blue-400 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
            </div>
            <span className="text-sm font-semibold">フォーラム</span>
          </Link>
          <Link href="/lobby" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">ロビー</span>
          </Link>
          <Link href="/career" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">キャリア</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">プロフ</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function ForumPage() {
  return (
    <ProtectedRoute>
      <ForumContent />
    </ProtectedRoute>
  );
}