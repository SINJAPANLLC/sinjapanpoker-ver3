'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // 管理者認証チェック
    const isAuthenticated = sessionStorage.getItem('admin_authenticated');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // 認証済みの場合は新しいダッシュボードにリダイレクト
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#1a0a0a] to-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔄</div>
        <h1 className="text-2xl font-bold text-white mb-2">管理者ダッシュボードに移動中...</h1>
        <p className="text-gray-400">新しい管理者画面にリダイレクトしています</p>
      </div>
    </div>
  );
}
