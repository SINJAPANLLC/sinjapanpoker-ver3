'use client';

import { Suspense } from 'react';
import { Loader } from 'lucide-react';
import PaymentVerification from './PaymentVerification';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900/10 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 text-center">
            <Loader className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">読み込み中...</h2>
          </div>
        </div>
      </div>
    }>
      <PaymentVerification />
    </Suspense>
  );
}
