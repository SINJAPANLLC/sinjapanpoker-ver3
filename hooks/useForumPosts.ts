import { useEffect, useState } from 'react';
import { saveForumPosts, loadForumPosts } from '@/lib/storage';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  type: 'text' | 'video';
  videoUrl?: string;
  username: string;
  userId: string;
  views: number;
  comments: number;
  likes: number;
  date: string;
  videoThumbnail?: string;
  isPinned?: boolean;
  isFeatured?: boolean;
}

export const useForumPosts = (category: string = 'featured') => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // まずLocalStorageから読み込む
        const cachedPosts = loadForumPosts();
        
        // APIからフェッチ
        const response = await fetch(`/api/forum/posts?category=${category}`);
        
        if (!response.ok) {
          // APIエラー時はキャッシュを使用
          if (cachedPosts.length > 0) {
            const filteredCached = category === 'featured' 
              ? cachedPosts.filter(p => p.isFeatured)
              : category === 'popular'
              ? cachedPosts.sort((a, b) => (b.views + b.comments * 2 + b.likes * 3) - (a.views + a.comments * 2 + a.likes * 3))
              : cachedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setPosts(filteredCached);
            setLoading(false);
            return;
          }
          throw new Error('フォーラム投稿の取得に失敗しました');
        }

        const data = await response.json();
        setPosts(data.posts);
        
        // LocalStorageにキャッシュ（カテゴリに関係なく全投稿を保存）
        if (data.posts && data.posts.length > 0) {
          saveForumPosts(data.posts);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
        console.error('Forum posts fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  const likePost = async (postId: string) => {
    try {
      // 実際の実装では、APIエンドポイントを呼び出す
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, likes: post.likes + 1 }
            : post
        )
      );
    } catch (err) {
      console.error('Like post error:', err);
    }
  };

  const addComment = async (postId: string) => {
    try {
      // 実際の実装では、APIエンドポイントを呼び出す
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments: post.comments + 1 }
            : post
        )
      );
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  const refreshPosts = () => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/forum/posts?category=${category}`);
        
        if (!response.ok) {
          throw new Error('フォーラム投稿の取得に失敗しました');
        }

        const data = await response.json();
        setPosts(data.posts);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
        console.error('Forum posts fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  };

  return {
    posts,
    loading,
    error,
    likePost,
    addComment,
    refreshPosts
  };
};
