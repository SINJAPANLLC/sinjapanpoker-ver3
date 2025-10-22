'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader, ArrowRight, Coins } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') || null;
  const { user } = useAuthStore();
  const { addCurrency } = useCurrencyStore();
  
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
            addCurrency('realChips', verifyData.chips, 'Stripe決済でチップ購入');
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
  }, [sessionId, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900/10 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {verifying && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 text-center">
            <Loader className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">決済を確認中...</h2>
            <p className="text-gray-400">少々お待ちください</p>
          </div>
        )}

        {!verifying && success && (
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-8 border border-green-500/30 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">購入完了！</h2>
              <p className="text-gray-400">チップの購入が完了しました</p>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Coins className="w-8 h-8 text-yellow-400" />
                <span className="text-4xl font-bold text-white">
                  +{chipsAdded.toLocaleString()}
                </span>
              </div>
              <p className="text-center text-gray-300">チップが追加されました</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/lobby')}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <span>ゲームを始める</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/shop')}
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
              >
                ショップに戻る
              </button>
            </div>
          </div>
        )}

        {!verifying && !success && error && (
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-8 border border-red-500/30 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">エラー</h2>
              <p className="text-gray-400">{error}</p>
            </div>

            <button
              onClick={() => router.push('/shop')}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all"
            >
              ショップに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
