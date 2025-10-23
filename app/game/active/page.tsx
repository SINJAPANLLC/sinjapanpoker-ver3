'use client';

export default function ActiveGamePage() {
  return (
    <div 
      className="relative min-h-screen w-full"
      style={{
        backgroundImage: 'url(/poker-table-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: '55% 32%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* アバターアイコン - 画面中央下 */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-5xl border-4 border-white shadow-lg">
          👤
        </div>
      </div>
    </div>
  );
}
