import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, orderBy, getDocs, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Loader2, Check, X, Clock, User, Mail, Phone, Key, Send, AlertCircle } from 'lucide-react';

export function AdminPasswordResets() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [newPasswords, setNewPasswords] = useState<{[key: string]: string}>({});
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'password_reset_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleResetPassword = async (request: any) => {
    const newPassword = newPasswords[request.id];
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'يرجى إدخال كلمة مرور صالحة (6 أحرف على الأقل).' });
      return;
    }

    setProcessingId(request.id);
    setMessage(null);

    try {
      // 1. Find user by email or phone
      let userEmail = '';
      let userUid = '';
      let userName = '';
      let userPhone = '';

      const usersRef = collection(db, 'users');
      let q = query(usersRef, where('email', '==', request.identifier));
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        q = query(usersRef, where('phone', '==', request.identifier));
        querySnapshot = await getDocs(q);
      }

      if (querySnapshot.empty) {
        throw new Error('لم يتم العثور على المستخدم في قاعدة البيانات.');
      }

      const userData = querySnapshot.docs[0].data();
      userEmail = userData.email;
      userUid = userData.uid;
      userName = userData.displayName;
      userPhone = userData.phone;

      // 2. Call API to reset password in Firebase Auth
      const resetRes = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userUid, newPassword })
      });

      if (!resetRes.ok) throw new Error('فشل تغيير كلمة المرور في النظام.');

      // 3. Send email with new password
      await fetch('/api/admin/send-password-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          phone: userPhone, 
          newPassword, 
          userName 
        })
      });

      // 4. Create notification for user
      await addDoc(collection(db, 'notifications'), {
        userId: userUid,
        message: 'تم إعادة تعيين كلمة المرور الخاصة بك من قبل المسؤول. يرجى التحقق من بريدك الإلكتروني.',
        type: 'info',
        read: false,
        createdAt: serverTimestamp()
      });

      // 5. Update request status
      await updateDoc(doc(db, 'password_reset_requests', request.id), {
        status: 'completed',
        completedAt: new Date().toISOString()
      });

      setMessage({ type: 'success', text: 'تم تغيير كلمة المرور وإرسالها للمستخدم بنجاح.' });
      
      // Clear password input
      setNewPasswords(prev => {
        const next = { ...prev };
        delete next[request.id];
        return next;
      });

    } catch (error: any) {
      console.error("Error resetting password:", error);
      setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء العملية.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, 'password_reset_requests', id), {
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">طلبات إعادة تعيين كلمة المرور</h1>
        <p className="text-slate-500 mt-1">إدارة طلبات المستخدمين الذين فقدوا الوصول إلى حساباتهم</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {requests.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
            <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">لا توجد طلبات حالياً</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{request.identifier}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{request.createdAt?.toDate().toLocaleString('ar-YE')}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  request.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                  request.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {request.status === 'pending' ? 'قيد الانتظار' :
                   request.status === 'completed' ? 'تم الإنجاز' : 'تم الرفض'}
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={newPasswords[request.id] || ''}
                        onChange={(e) => setNewPasswords(prev => ({ ...prev, [request.id]: e.target.value }))}
                        className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="أدخل كلمة المرور الجديدة هنا"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all"
                    >
                      تجاهل
                    </button>
                    <button
                      onClick={() => handleResetPassword(request)}
                      disabled={processingId === request.id}
                      className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processingId === request.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      تغيير وإرسال
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
