'use client';

import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  variant?: 'default' | 'poker' | 'minimal';
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = '読み込み中...', 
  fullScreen = false,
  variant = 'poker'
}: LoadingSpinnerProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'poker') {
    return (
      <div className={`${fullScreen ? 'fixed inset-0 z-50' : 'flex'} items-center justify-center ${fullScreen ? 'bg-black/80 backdrop-blur-sm' : ''}`}>
        <div className="text-center space-y-6">
          {/* ポーカーローディングアニメーション */}
          <div className="relative mx-auto">
            <div className={`${sizeClasses[size]} relative`}>
              {/* 外側のリング */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              
              {/* 回転するリング */}
              <div className={`absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin`}></div>
              
              {/* 中央のカードアイコン */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-blue-500 animate-pulse">
                  {size === 'xl' ? '🃏' : size === 'lg' ? '🂡' : '♠️'}
                </div>
              </div>
            </div>
          </div>

          {/* テキスト */}
          <div className="space-y-2">
            <div className={`font-semibold text-white ${textSizeClasses[size]}`}>
              {text}{dots}
            </div>
            <div className="text-gray-400 text-xs">
              SIN JAPAN POKER
            </div>
          </div>

          {/* プログレスバー */}
          <div className="w-48 mx-auto">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`${fullScreen ? 'fixed inset-0 z-50' : 'flex'} items-center justify-center ${fullScreen ? 'bg-black/80 backdrop-blur-sm' : ''}`}>
        <div className="text-center space-y-4">
          <div className={`${sizeClasses[size]} mx-auto`}>
            <div className="w-full h-full rounded-full border-4 border-gray-700 border-t-red-500 animate-spin"></div>
          </div>
          <div className={`text-gray-400 ${textSizeClasses[size]}`}>
            {text}{dots}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-50' : 'flex'} items-center justify-center ${fullScreen ? 'bg-black/80 backdrop-blur-sm' : ''}`}>
      <div className="text-center space-y-4">
        <div className="relative">
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-red-500 to-red-700 animate-pulse`}></div>
          <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-white animate-spin`}></div>
        </div>
        <div className={`text-white ${textSizeClasses[size]}`}>
          {text}{dots}
        </div>
      </div>
    </div>
  );
}
