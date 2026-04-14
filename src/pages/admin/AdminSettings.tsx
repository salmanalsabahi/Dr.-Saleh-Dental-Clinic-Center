import React, { useState } from 'react';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export function AdminSettings() {
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Re-authenticate first
      if (currentPassword) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
      } else {
        throw new Error('auth/requires-recent-login');
      }

      // Update Email if changed
      if (email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, email);
      }

      // Update Password if provided
      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
      }

      setMessage({ type: 'success', text: 'تم تحديث الإعدادات بنجاح.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      console.error("Error updating settings:", error);
      if (error.message === 'auth/requires-recent-login' || error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'يرجى إدخال كلمة المرور الحالية لتأكيد التغييرات.' });
      } else if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'كلمة المرور الحالية غير صحيحة.' });
      } else if (error.code === 'auth/weak-password') {
        setMessage({ type: 'error', text: 'كلمة المرور الجديدة ضعيفة جداً.' });
      } else {
        setMessage({ type: 'error', text: 'حدث خطأ أثناء تحديث الإعدادات.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">إعدادات الحساب</h1>
        <p className="text-slate-600 mt-1">تغيير البريد الإلكتروني وكلمة المرور الخاصة بالمشرف.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني الجديد</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left"
              dir="ltr"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور الجديدة (اتركها فارغة إذا لم ترد تغييرها)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور الحالية (مطلوبة لتأكيد التغييرات)</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
