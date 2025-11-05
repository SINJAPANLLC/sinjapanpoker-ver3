import { NextApiRequest, NextApiResponse } from 'next';

interface ForumPost {
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

// モックデータ（空）
let posts: ForumPost[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { category = 'featured', limit = '20', offset = '0' } = req.query;
    
    let filteredPosts = [...posts];
    
    // カテゴリフィルタリング
    if (category === 'featured') {
      filteredPosts = posts.filter(post => post.isFeatured);
    } else if (category === 'popular') {
      // 人気順（ビュー数 + コメント数 + いいね数）
      filteredPosts = posts.sort((a, b) => 
        (b.views + b.comments + b.likes) - (a.views + a.comments + a.likes)
      );
    } else if (category === 'latest') {
      // 最新順
      filteredPosts = posts.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else {
      // 特定のカテゴリ
      filteredPosts = posts.filter(post => post.category === category);
    }
    
    // ピン留めされた投稿を最初に表示
    const pinnedPosts = filteredPosts.filter(post => post.isPinned);
    const regularPosts = filteredPosts.filter(post => !post.isPinned);
    filteredPosts = [...pinnedPosts, ...regularPosts];
    
    // ページネーション
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginatedPosts = filteredPosts.slice(offsetNum, offsetNum + limitNum);
    
    return res.status(200).json({
      posts: paginatedPosts,
      total: filteredPosts.length,
      hasMore: offsetNum + limitNum < filteredPosts.length
    });
  }
  
  if (req.method === 'POST') {
    try {
      const { title, content, category, tags, type, videoUrl, userId, username } = req.body;
      
      // バリデーション
      if (!title || !content || !category || !type || !userId || !username) {
        return res.status(400).json({ 
          error: '必要な情報が不足しています' 
        });
      }
      
      if (title.length > 100) {
        return res.status(400).json({ 
          error: 'タイトルは100文字以内で入力してください' 
        });
      }
      
      if (content.length > 5000) {
        return res.status(400).json({ 
          error: '内容は5000文字以内で入力してください' 
        });
      }
      
      if (type === 'video' && !videoUrl) {
        return res.status(400).json({ 
          error: 'ビデオURLが必要です' 
        });
      }
      
      // 新しい投稿を作成
      const newPost: ForumPost = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags ? tags.split(' ').filter((tag: string) => tag.trim()) : [],
        type,
        videoUrl: type === 'video' ? videoUrl : undefined,
        username,
        userId,
        views: 0,
        comments: 0,
        likes: 0,
        date: new Date().toISOString().split('T')[0],
        videoThumbnail: type === 'video' ? `https://img.youtube.com/vi/${extractVideoId(videoUrl)}/maxresdefault.jpg` : undefined
      };
      
      // 投稿を追加（最新を最初に）
      posts.unshift(newPost);
      
      return res.status(201).json({
        message: '投稿が作成されました',
        post: newPost
      });
      
    } catch (error) {
      console.error('投稿作成エラー:', error);
      return res.status(500).json({ 
        error: '投稿の作成に失敗しました' 
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// YouTubeのビデオIDを抽出する関数
function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : 'example';
}