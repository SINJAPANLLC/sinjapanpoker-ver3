'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import { Shield, Lock } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  redirectTo?: string;
}

export default function AdminProtectedRoute({ 
  children, 
  requiredPermission,
  redirectTo = '/admin/login' 
}: AdminProtectedRouteProps) {
  const router = useRouter();
  const { isAdminAuthenticated, adminUser, checkAdminAuth, hasPermission } = useAdminStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuthentication = () => {
      const isAuth = checkAdminAuth();
      
      if (!isAuth || !adminUser) {
        console.log('AdminProtectedRoute: 認証されていないためリダイレクト');
        router.push(redirectTo);
        return;
      }
      
      if (requiredPermission && !hasPermission(requiredPermission)) {
        console.log('AdminProtectedRoute: 権限不足');
        router.push('/admin/unauthorized');
        return;
      }
      
      console.log('AdminProtectedRoute: 認証成功');
      setIsLoading(false);
    };

    const timer = setTimeout(checkAdminAuthentication, 100);
    
    return () => clearTimeout(timer);
  }, [router, redirectTo, checkAdminAuth, adminUser, requiredPermission, hasPermission]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-white text-lg flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-400" />
            <span>Admin認証中...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
