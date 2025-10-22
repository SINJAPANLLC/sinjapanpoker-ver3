'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

interface PageTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

export default function PageTransition({ 
  children, 
  isLoading = false, 
  loadingText = 'ページを読み込み中...' 
}: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (isLoading) {
      setIsTransitioning(true);
      setShowContent(false);
    } else {
      // フェードアウト後、コンテンツを表示
      const timer = setTimeout(() => {
        setShowContent(true);
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isTransitioning || isLoading) {
    return (
      <LoadingSpinner 
        variant="poker" 
        size="xl" 
        text={loadingText}
        fullScreen={true}
      />
    );
  }

  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${
        showContent 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}
    >
      {children}
    </div>
  );
}

// ページ遷移フック
export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const navigateWithTransition = (path: string) => {
    setIsLoading(true);
    
    // 最小限の遅延でスムーズな遷移
    setTimeout(() => {
      router.push(path);
      setIsLoading(false);
    }, 150);
  };

  return { isLoading, navigateWithTransition };
}
