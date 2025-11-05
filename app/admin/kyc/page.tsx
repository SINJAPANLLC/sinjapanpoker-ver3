'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { ArrowLeft, FileText, CheckCircle, XCircle, Eye, Loader } from 'lucide-react';

interface KYCVerification {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  idDocumentType: 'passport' | 'drivers_license' | 'national_id';
  idDocumentNumber: string;
  idDocumentUrl: string;
  selfieUrl: string;
  addressDocumentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

function KYCManagementContent() {
  const router = useRouter();
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, [selectedStatus]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/kyc?status=${selectedStatus}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications);
      }
    } catch (error) {
      console.error('KYC取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (kycId: string, action: 'approve' | 'reject') => {
    try {
      setProcessing(true);
      const token = sessionStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ kycId, action, reviewNotes })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setSelectedVerification(null);
        setReviewNotes('');
        fetchVerifications();
      } else {
        alert(data.message || 'エラーが発生しました');
      }
    } catch (error) {
      console.error('KYC処理エラー:', error);
      alert('処理に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">審査中</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">承認済み</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">却下</span>;
    }
  };

  const filteredVerifications = verifications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900">
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">KYC管理</h1>
                <p className="text-gray-400 text-sm">本人確認書類の審査</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* フィルター */}
        <div className="flex space-x-4 mb-6">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {status === 'all' ? 'すべて' : status === 'pending' ? '審査中' : status === 'approved' ? '承認済み' : '却下'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredVerifications.map((verification) => (
              <div key={verification.id} className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {verification.firstName} {verification.lastName}
                    </h3>
                    <p className="text-gray-400">ID: {verification.idDocumentNumber}</p>
                  </div>
                  {getStatusBadge(verification.status)}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">生年月日</p>
                    <p className="text-white">{verification.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">国籍</p>
                    <p className="text-white">{verification.nationality}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">住所</p>
                    <p className="text-white">{verification.address}, {verification.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">電話番号</p>
                    <p className="text-white">{verification.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedVerification(verification)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>詳細確認</span>
                  </button>

                  {verification.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(verification.id, 'approve')}
                        disabled={processing}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>承認</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVerification(verification);
                          setReviewNotes('');
                        }}
                        disabled={processing}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>却下</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 詳細モーダル */}
        {selectedVerification && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-white mb-6">KYC書類詳細</h2>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">身分証明書</p>
                  <img src={selectedVerification.idDocumentUrl} alt="ID" className="w-full rounded-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">自撮り写真</p>
                  <img src={selectedVerification.selfieUrl} alt="Selfie" className="w-full rounded-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">住所確認書類</p>
                  <img src={selectedVerification.addressDocumentUrl} alt="Address" className="w-full rounded-lg" />
                </div>
              </div>

              {selectedVerification.status === 'pending' && (
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">却下理由（却下する場合）</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg p-3"
                    rows={3}
                    placeholder="却下理由を入力してください"
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  閉じる
                </button>

                {selectedVerification.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction(selectedVerification.id, 'approve')}
                      disabled={processing}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleAction(selectedVerification.id, 'reject')}
                      disabled={processing || !reviewNotes.trim()}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50"
                    >
                      却下
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KYCManagementPage() {
  return (
    <AdminProtectedRoute>
      <KYCManagementContent />
    </AdminProtectedRoute>
  );
}
