'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, MessageCircle, ThumbsUp, Share2, User, Clock } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
  likes: number;
}

interface Post {
  id: string;
  title: string;
  type: 'text' | 'video';
  content: string;
  videoUrl?: string;
  videoThumbnail?: string;
  userId: string;
  username: string;
  views: number;
  likes: number;
  comments: Comment[];
  createdAt: Date;
}

function ForumPostContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');

  // モックデータ（実際はAPIから取得）
  const post: Post = {
    id,
    title: `投稿タイトル #${id}`,
    type: Math.random() > 0.5 ? 'video' : 'text',
    content: 'これは投稿の詳細コンテンツです。ポーカーの戦略やゲームの感想などを共有しています。\n\nフロップでトップペアをヒットしたときの戦略について考えてみましょう。相手のアクションを注意深く観察することが重要です。',
    videoUrl: Math.random() > 0.5 ? 'https://example.com/video.mp4' : undefined,
    videoThumbnail: Math.random() > 0.5 ? 'https://picsum.photos/800/450' : undefined,
    userId: '1',
    username: 'PokerPro123',
    views: Math.floor(Math.random() * 1000) + 100,
    likes: Math.floor(Math.random() * 100) + 10,
    comments: [
      {
        id: '1',
        userId: '2',
        username: 'Player456',
        content: 'とても参考になりました！',
        createdAt: new Date(Date.now() - 3600000),
        likes: 5
      },
      {
        id: '2',
        userId: '3',
        username: 'PokerFan789',
        content: 'この戦略は実践で使えそうですね。次回のゲームで試してみます。',
        createdAt: new Date(Date.now() - 7200000),
        likes: 3
      }
    ],
    createdAt: new Date(Date.now() - 86400000)
  };

  const handleLike = () => {
    setLiked(!liked);
    // 実際はAPIコール
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    
    // 実際はAPIコール
    console.log('New comment:', commentText);
    setCommentText('');
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/forum/${id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('URLをコピーしました！');
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
          <Link href="/forum" className="text-blue-400 hover:text-cyan-300">
            <ArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-xl font-bold text-white truncate flex-1">{post.title}</h1>
          <button
            onClick={handleShare}
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            <Share2 />
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="card animate-fade-in mb-6">
          {/* 投稿者情報 */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <User className="text-white" />
            </div>
            <div>
              <div className="text-white font-semibold">{post.username}</div>
              <div className="text-gray-400 text-sm flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{post.createdAt.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* ビデオ */}
          {post.type === 'video' && post.videoThumbnail && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img src={post.videoThumbnail} alt={post.title} className="w-full h-auto" />
            </div>
          )}

          {/* コンテンツ */}
          <div className="text-gray-300 whitespace-pre-wrap mb-6 leading-relaxed">
            {post.content}
          </div>

          {/* 統計情報 */}
          <div className="flex items-center space-x-6 text-gray-400 mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ThumbsUp className="w-5 h-5" />
              <span>{post.likes + (liked ? 1 : 0)}</span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                liked
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <ThumbsUp className={liked ? 'fill-current' : ''} />
              <span>{liked ? 'いいね済み' : 'いいね'}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
            >
              <Share2 />
              <span>シェア</span>
            </button>
          </div>
        </div>

        {/* コメントセクション */}
        <div className="card animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <MessageCircle className="text-blue-400" />
            <span>コメント ({post.comments.length})</span>
          </h2>

          {/* コメント入力 */}
          <div className="mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <User className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="コメントを入力..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-blue-400 focus:outline-none resize-none"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    コメントを投稿
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* コメント一覧 */}
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0">
                  <User className="text-white text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-semibold">{comment.username}</span>
                    <span className="text-gray-500 text-sm">
                      {comment.createdAt.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-2">{comment.content}</p>
                  <button className="text-gray-400 hover:text-blue-400 text-sm flex items-center space-x-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute>
      <ForumPostContent params={params} />
    </ProtectedRoute>
  );
}

