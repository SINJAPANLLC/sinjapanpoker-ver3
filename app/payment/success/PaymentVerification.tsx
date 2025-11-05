'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';

export default function PaymentVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') || null;
  const { user } = useAuthStore();
  const { setCurrency } = useCurrencyStore();
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [chipsAdded, setChipsAdded] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !user) {
        setError('セッションIDまたはユーザー情報が見つかりません');
        setVerifying(false);
        return;
      }

      try {
        const verifyResponse = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          const addChipsResponse = await fetch('/api/users/add-chips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              chips: verifyData.chips,
            }),
          });

          const addChipsData = await addChipsResponse.json();

          if (addChipsData.success) {
            // データベース更新後の合計値をLocalStorageに同期
            setCurrency('realChips', addChipsData.newChips, 'Stripe決済でチップ購入');
            setChipsAdded(verifyData.chips);
            setSuccess(true);
          } else {
            setError('チップの追加に失敗しました');
          }
        } else {
          setError('決済が完了していません');
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError('決済の確認中にエラーが発生しました');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, user, setCurrency]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900/10 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {verifying && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 text-center">
            <Loader className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">決済を確認中...</h2>
            <p className="text-gray-400">少々お待ちください</p>
          </div>
        )}

        {!verifying && success && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">決済完了！</h2>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img src="/chip-icon.png" alt="Chips" className="w-8 h-8 object-contain" />
                <p className="text-4xl font-bold text-white">{chipsAdded.toLocaleString()}</p>
              </div>
              <p className="text-white/80 text-sm">チップが追加されました</p>
            </div>
            <p className="text-gray-300 mb-6">
              ご購入ありがとうございます。チップが正常に追加されました。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/lobby')}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                ロビーへ戻る
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/shop')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                もっと購入する
              </button>
            </div>
          </div>
        )}

        {!verifying && error && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-red-700/50 text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">エラー</h2>
            <p className="text-red-400 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/shop')}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                ショップに戻る
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                ホームへ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
