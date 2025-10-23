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
        <div className="relative">
          {/* アバターアイコン */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-5xl border-4 border-white shadow-lg">
            👤
          </div>
          
          {/* ユーザー情報（アバターの下部に被せる） */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border-2 border-white/30 shadow-lg min-w-[100px] z-10">
            <p className="text-white text-xs font-bold text-center whitespace-nowrap">
              プレイヤー1
            </p>
            <p className="text-yellow-400 text-xs font-semibold text-center whitespace-nowrap">
              5,000 チップ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
