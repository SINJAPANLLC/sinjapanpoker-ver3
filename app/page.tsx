'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Zap, Users, Star, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

// カウントアップアニメーション用コンポーネント
const CountUpNumber = ({ 
  end, 
  duration = 2000, 
  suffix = '', 
  prefix = '',
  delay = 0 
}: {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // イージング関数（easeOutQuart）
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isVisible]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <span className="text-4xl font-bold text-gradient-blue mb-2">
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        
        {/* 流れるトランプカード */}
        <div className="absolute inset-0 opacity-40">
          {/* カード1 - スペードのA */}
          <div className="absolute w-12 h-16 animate-card-fall-1 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/ace_of_spades.png" alt="Ace of Spades" fill unoptimized className="object-contain" />
          </div>
          
          {/* カード2 - ハートのK */}
          <div className="absolute w-12 h-16 animate-card-fall-2 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/king_of_hearts.png" alt="King of Hearts" fill unoptimized className="object-contain" />
          </div>
          
          {/* カード3 - クラブのQ */}
          <div className="absolute w-12 h-16 animate-card-fall-3 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/queen_of_clubs.png" alt="Queen of Clubs" fill unoptimized className="object-contain" />
          </div>
          
          {/* カード4 - ダイヤのJ */}
          <div className="absolute w-12 h-16 animate-card-fall-4 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/jack_of_diamonds.png" alt="Jack of Diamonds" fill unoptimized className="object-contain" />
          </div>
          
          {/* カード5 - スペードの10 */}
          <div className="absolute w-12 h-16 animate-card-fall-5 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/10_of_spades.png" alt="10 of Spades" fill unoptimized className="object-contain" />
          </div>
          
          {/* カード6 - ハートの9 */}
          <div className="absolute w-12 h-16 animate-card-fall-6 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/9_of_hearts.png" alt="9 of Hearts" fill unoptimized className="object-contain" />
          </div>
          
          {/* カード7 - クラブの8 */}
          <div className="absolute w-12 h-16 animate-card-fall-7 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/8_of_clubs.png" alt="8 of Clubs" fill unoptimized className="object-contain" />
          </div>
          
          {/* カード8 - ダイヤの7 */}
          <div className="absolute w-12 h-16 animate-card-fall-8 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/7_of_diamonds.png" alt="7 of Diamonds" fill unoptimized className="object-contain" />
          </div>
          
          {/* 追加のカード群 */}
          <div className="absolute w-10 h-14 animate-card-fall-9 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/ace_of_hearts.png" alt="Ace of Hearts" fill unoptimized className="object-contain" />
          </div>
          
          <div className="absolute w-10 h-14 animate-card-fall-10 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/king_of_spades.png" alt="King of Spades" fill unoptimized className="object-contain" />
          </div>
          
          <div className="absolute w-10 h-14 animate-card-fall-11 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/queen_of_diamonds.png" alt="Queen of Diamonds" fill unoptimized className="object-contain" />
          </div>
          
          <div className="absolute w-10 h-14 animate-card-fall-12 relative bg-white rounded-lg overflow-hidden shadow-lg">
            <Image src="/cards/jack_of_clubs.png" alt="Jack of Clubs" fill unoptimized className="object-contain" />
          </div>
        </div>
        
        {/* 背景のドットパターン */}
        <div className="absolute inset-0 bg-dots opacity-10"></div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass border-b border-white/10 p-3 md:p-6 animate-slide-in-down">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 md:space-x-4 -ml-2 md:-ml-4">
            <Image
              src="/logo.png"
              alt="SIN JAPAN POKER"
              width={240}
              height={80}
              priority
              className="w-40 h-14 md:w-60 md:h-20 object-contain"
            />
          </div>
          
          <Link
            href="/auth/login"
            className="btn-primary hover-lift text-sm md:text-base px-4 md:px-6"
          >
            ログイン
          </Link>
        </div>
      </header>

      {/* ヒーローセクション */}
      <main className="relative z-10">
        <div className="container-main section-padding">
          <div className="text-center mb-8 md:mb-16 animate-fade-in px-4">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-6 md:mb-8 text-gradient-white-blue neon-glow-white">
              SIN JAPAN POKER
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-12">
              世界最高峰のオンラインポーカー体験
            </p>
            
            <div className="flex justify-center items-center">
              <Link
                href="/auth/register"
                className="btn-primary text-base md:text-lg px-8 md:px-12 py-3 md:py-4 hover-lift animate-pulse-slow"
              >
                今すぐ始める
              </Link>
            </div>
          </div>

          {/* 特徴カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="card card-glow hover-lift animate-slide-in-left group">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center animate-float">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">トーナメント</h3>
                <p className="text-gray-400">
                  賞金総額10万ドル以上の大規模トーナメントを毎日開催
                </p>
              </div>
            </div>

            <div className="card card-glow hover-lift animate-scale-in group" style={{ animationDelay: '0.1s' }}>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">高速プレイ</h3>
                <p className="text-gray-400">
                  次世代のゲームエンジンで遅延なし、快適なプレイ環境
                </p>
              </div>
            </div>

            <div className="card card-glow hover-lift animate-slide-in-right group" style={{ animationDelay: '0.2s' }}>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">グローバル</h3>
                <p className="text-gray-400">
                  世界中のプレイヤーと24時間いつでも対戦可能
                </p>
              </div>
            </div>
          </div>

          {/* ゲームモード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Texas Hold'em Card */}
            <Link
              href="/lobby"
              className="group relative overflow-hidden glass border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 animate-slide-in-up"
            >
              {/* Animated Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Floating Particles */}
              <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-400/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              <div className="absolute bottom-6 left-6 w-1 h-1 bg-cyan-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              
              {/* Card Content */}
              <div className="relative z-10 p-6">
                {/* Icon Section */}
                <div className="relative mb-6">
                  {/* Icon Glow Ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-blue-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-110"></div>
                  
                  {/* Main Icon Container */}
                  <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center border border-blue-400/30 group-hover:border-blue-300/50 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-2">
                    {/* Card Suit Icons */}
                    <div className="relative flex flex-col items-center justify-center">
                      <div className="flex space-x-1 mb-1">
                        <span className="text-white text-lg group-hover:text-blue-100 transition-colors duration-500 group-hover:scale-110 transition-transform duration-500" style={{ animationDelay: '0.1s' }}>♠</span>
                        <span className="text-white text-lg group-hover:text-blue-100 transition-colors duration-500 group-hover:scale-110 transition-transform duration-500" style={{ animationDelay: '0.2s' }}>♣</span>
                      </div>
                      <div className="flex space-x-1">
                        <span className="text-white text-lg group-hover:text-blue-100 transition-colors duration-500 group-hover:scale-110 transition-transform duration-500" style={{ animationDelay: '0.3s' }}>♥</span>
                        <span className="text-white text-lg group-hover:text-blue-100 transition-colors duration-500 group-hover:scale-110 transition-transform duration-500" style={{ animationDelay: '0.4s' }}>♦</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-500 group-hover:translate-y-[-2px] transition-transform duration-500">
                  Texas Hold&apos;em
                </h3>
                
                {/* Subtitle */}
                <h4 className="text-lg font-semibold text-gray-300 mb-3 group-hover:text-white transition-colors duration-500 group-hover:translate-y-[-1px] transition-transform duration-500">
                  キャッシュゲーム
                </h4>
                
                {/* Description */}
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-500 group-hover:translate-y-[-1px] transition-transform duration-500">
                  ステークス $0.01 - $100
                </p>
                
                {/* Play Button Effect */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Tournament Card */}
            <Link
              href="/tournaments"
              className="group relative overflow-hidden glass border border-white/10 hover:border-yellow-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 animate-slide-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              {/* Animated Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Floating Particles */}
              <div className="absolute top-6 left-4 w-1.5 h-1.5 bg-yellow-400/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              <div className="absolute bottom-8 right-6 w-1 h-1 bg-orange-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              
              {/* Card Content */}
              <div className="relative z-10 p-6">
                {/* Icon Section */}
                <div className="relative mb-6">
                  {/* Icon Glow Ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-400/20 to-yellow-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-110"></div>
                  
                  {/* Main Icon Container */}
                  <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center border border-blue-400/30 group-hover:border-blue-300/50 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-2">
                    {/* Trophy with Crown */}
                    <div className="relative flex flex-col items-center justify-center">
                      {/* Crown */}
                      <div className="flex space-x-0.5 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                      </div>
                      
                      {/* Trophy */}
                      <Trophy className="w-8 h-8 text-white group-hover:text-blue-100 transition-colors duration-500 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-500 group-hover:translate-y-[-2px] transition-transform duration-500">
                  Tournament
                </h3>
                
                {/* Subtitle */}
                <h4 className="text-lg font-semibold text-gray-300 mb-3 group-hover:text-white transition-colors duration-500 group-hover:translate-y-[-1px] transition-transform duration-500">
                  トーナメント
                </h4>
                
                {/* Description */}
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-500 group-hover:translate-y-[-1px] transition-transform duration-500">
                  バイイン $1 - $1,000
                </p>
                
                {/* Play Button Effect */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Spin & Go Card */}
            <Link
              href="/spinup"
              className="group relative overflow-hidden glass border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 animate-slide-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              {/* Animated Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Floating Particles */}
              <div className="absolute top-5 right-6 w-1.5 h-1.5 bg-purple-400/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-pink-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              
              {/* Card Content */}
              <div className="relative z-10 p-6">
                {/* Icon Section */}
                <div className="relative mb-6">
                  {/* Icon Glow Ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-400/20 to-purple-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-110"></div>
                  
                  {/* Main Icon Container */}
                  <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center border border-blue-400/30 group-hover:border-blue-300/50 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-2">
                    {/* Spinning Star with Rings */}
                    <div className="relative flex items-center justify-center">
                      {/* Outer Ring */}
                      <div className="absolute w-12 h-12 border border-white/30 rounded-full group-hover:rotate-180 transition-transform duration-1000"></div>
                      
                      {/* Inner Ring */}
                      <div className="absolute w-8 h-8 border border-white/20 rounded-full group-hover:-rotate-90 transition-transform duration-700" style={{ animationDelay: '0.2s' }}></div>
                      
                      {/* Star */}
                      <Star className="w-6 h-6 text-white group-hover:text-blue-100 transition-colors duration-500 group-hover:scale-125 transition-transform duration-500" />
                    </div>
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-500 group-hover:translate-y-[-2px] transition-transform duration-500">
                  Spin & Go
                </h3>
                
                {/* Subtitle */}
                <h4 className="text-lg font-semibold text-gray-300 mb-3 group-hover:text-white transition-colors duration-500 group-hover:translate-y-[-1px] transition-transform duration-500">
                  スピンアップ
                </h4>
                
                {/* Description */}
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-500 group-hover:translate-y-[-1px] transition-transform duration-500">
                  3人制ハイパーターボ
                </p>
                
                {/* Play Button Effect */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* 統計 */}
          <div className="card text-center mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <CountUpNumber 
                  end={50000} 
                  suffix="+" 
                  duration={2500}
                  delay={500}
                />
                <div className="text-gray-400">アクティブプレイヤー</div>
              </div>
              <div>
                <CountUpNumber 
                  end={10000000} 
                  prefix="$" 
                  suffix="+" 
                  duration={3000}
                  delay={800}
                />
                <div className="text-gray-400">月間賞金総額</div>
              </div>
              <div>
                <CountUpNumber 
                  end={24} 
                  suffix="/7" 
                  duration={2000}
                  delay={1100}
                />
                <div className="text-gray-400">ノンストップゲーム</div>
              </div>
              <div>
                <CountUpNumber 
                  end={100} 
                  suffix="+" 
                  duration={2200}
                  delay={1400}
                />
                <div className="text-gray-400">デイリートーナメント</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="card-blue text-center animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-8 px-4 leading-relaxed">
              今すぐ登録して、<br className="sm:hidden" />
              <span className="text-blue-300">10,000チップ</span>の無料ボーナスを<br className="sm:hidden" />
              獲得しましょう
            </h3>
            <Link
              href="/auth/register"
              className="btn-primary text-lg sm:text-xl px-8 sm:px-12 md:px-16 py-4 sm:py-5 inline-block animate-pulse-slow"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="relative z-10 glass border-t border-white/10 mt-20 py-12">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">会社情報・法的文書</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/company" className="hover:text-blue-400 transition-colors">会社概要</Link></li>
                <li><Link href="/terms" className="hover:text-blue-400 transition-colors">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">プライバシーポリシー</Link></li>
                <li><Link href="/compliance" className="hover:text-blue-400 transition-colors">法令遵守</Link></li>
                <li><Link href="/aml" className="hover:text-blue-400 transition-colors">AMLポリシー</Link></li>
                <li><Link href="/kyc" className="hover:text-blue-400 transition-colors">KYC手続き</Link></li>
                <li><Link href="/risk-disclosure" className="hover:text-blue-400 transition-colors">リスク開示</Link></li>
                <li><Link href="/terms-of-use" className="hover:text-blue-400 transition-colors">利用条件</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">ゲーム</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/lobby" className="hover:text-blue-400 transition-colors">キャッシュゲーム</Link></li>
                <li><Link href="/tournaments" className="hover:text-blue-400 transition-colors">トーナメント</Link></li>
                <li><Link href="/spinup" className="hover:text-blue-400 transition-colors">スピンアップ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">サポート・安全対策</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/feedback" className="hover:text-blue-400 transition-colors">お問い合わせ</Link></li>
                <li><Link href="/faq" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
                <li><Link href="/responsible-gaming" className="hover:text-blue-400 transition-colors">責任あるゲーミング</Link></li>
                <li><Link href="/self-exclusion" className="hover:text-blue-400 transition-colors">セルフエクスクルージョン</Link></li>
                <li><Link href="/problem-gambling" className="hover:text-blue-400 transition-colors">ギャンブル依存対策</Link></li>
                <li><Link href="/age-verification" className="hover:text-blue-400 transition-colors">年齢確認</Link></li>
                <li><Link href="/deposit-limits" className="hover:text-blue-400 transition-colors">入金制限</Link></li>
                <li><Link href="/cooling-off" className="hover:text-blue-400 transition-colors">クーリングオフ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">コミュニティ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/forum" className="hover:text-blue-400 transition-colors">フォーラム</Link></li>
                <li><Link href="/invite" className="hover:text-blue-400 transition-colors">友達招待</Link></li>
                <li><Link href="/career" className="hover:text-blue-400 transition-colors">キャリア</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
            <p>© SIN JAPAN LIBERIA CO.,INC. All rights reserved.</p>
            <p className="mt-2">18歳未満の方はご利用いただけません。</p>
          </div>
        </div>
      </footer>

      {/* 管理者リンク（右下隠しリンク） */}
      <Link
        href="/admin/login"
        className="fixed bottom-4 right-4 w-3 h-3 opacity-10 hover:opacity-100 transition-opacity"
      >
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
      </Link>
    </div>
  );
}