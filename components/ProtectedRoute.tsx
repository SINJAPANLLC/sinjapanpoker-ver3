'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // クライアントサイドでの認証チェック
    const checkAuthentication = () => {
      const isAuth = checkAuth();
      
      console.log('ProtectedRoute: 認証チェック', { isAuth, user, redirectTo });
      
      if (!isAuth || !user) {
        console.log('ProtectedRoute: 認証されていないためリダイレクト');
        router.push(redirectTo);
        return;
      }
      
      console.log('ProtectedRoute: 認証成功');
      setIsLoading(false);
    };

    // 少し遅延させてストレージからの読み込みを待つ
    const timer = setTimeout(checkAuthentication, 100);
    
    return () => clearTimeout(timer);
  }, [router, redirectTo, checkAuth, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
