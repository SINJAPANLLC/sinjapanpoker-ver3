import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db-api';
import { forumPosts } from '@/shared/schema';
import { eq, desc, asc, and, sql } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { category = 'featured', limit = '20', offset = '0' } = req.query;
      
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      
      // カテゴリフィルタリング & ソート & ページネーション
      let allPosts;
      let total = 0;
      
      if (category === 'featured') {
        allPosts = await db.select()
          .from(forumPosts)
          .where(eq(forumPosts.isFeatured, true))
          .orderBy(desc(forumPosts.isPinned), desc(forumPosts.createdAt))
          .limit(limitNum)
          .offset(offsetNum);
        
        const [result] = await db.select({ count: sql<number>`count(*)` })
          .from(forumPosts)
          .where(eq(forumPosts.isFeatured, true));
        total = Number(result.count);
        
      } else if (category === 'popular') {
        allPosts = await db.select()
          .from(forumPosts)
          .orderBy(desc(sql`${forumPosts.views} + ${forumPosts.comments} + ${forumPosts.likes}`))
          .limit(limitNum)
          .offset(offsetNum);
        
        const [result] = await db.select({ count: sql<number>`count(*)` })
          .from(forumPosts);
        total = Number(result.count);
        
      } else if (category === 'latest') {
        allPosts = await db.select()
          .from(forumPosts)
          .orderBy(desc(forumPosts.isPinned), desc(forumPosts.createdAt))
          .limit(limitNum)
          .offset(offsetNum);
        
        const [result] = await db.select({ count: sql<number>`count(*)` })
          .from(forumPosts);
        total = Number(result.count);
        
      } else {
        // 特定のカテゴリ
        allPosts = await db.select()
          .from(forumPosts)
          .where(eq(forumPosts.category, category as any))
          .orderBy(desc(forumPosts.isPinned), desc(forumPosts.createdAt))
          .limit(limitNum)
          .offset(offsetNum);
        
        const [result] = await db.select({ count: sql<number>`count(*)` })
          .from(forumPosts)
          .where(eq(forumPosts.category, category as any));
        total = Number(result.count);
      }
      
      // レスポンス形式を変換（date フィールドを追加）
      const postsWithDate = allPosts.map(post => ({
        ...post,
        date: post.createdAt.toISOString().split('T')[0],
        tags: post.tags || [],
      }));
      
      return res.status(200).json({
        posts: postsWithDate,
        total,
        hasMore: offsetNum + limitNum < total
      });
      
    } catch (error) {
      console.error('投稿取得エラー:', error);
      return res.status(500).json({ 
        error: '投稿の取得に失敗しました' 
      });
    }
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
      
      // タグ配列を処理
      const tagsArray = tags ? tags.split(' ').filter((tag: string) => tag.trim()) : [];
      
      // ビデオサムネイル生成
      const videoThumbnail = type === 'video' && videoUrl 
        ? `https://img.youtube.com/vi/${extractVideoId(videoUrl)}/maxresdefault.jpg` 
        : null;
      
      // データベースに投稿を挿入
      const [newPost] = await db.insert(forumPosts).values({
        userId,
        username,
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tagsArray,
        type,
        videoUrl: type === 'video' ? videoUrl : null,
        videoThumbnail,
      }).returning();
      
      // レスポンス形式を変換
      const postWithDate = {
        ...newPost,
        date: newPost.createdAt.toISOString().split('T')[0],
      };
      
      return res.status(201).json({
        message: '投稿が作成されました',
        post: postWithDate
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
