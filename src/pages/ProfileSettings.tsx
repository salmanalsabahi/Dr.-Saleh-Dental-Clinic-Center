import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ProfileSettings() {
  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      setMessage({ type: 'success', text: 'تم تحديث الاسم بنجاح.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تحديث الملف الشخصي.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">إعدادات الحساب</h2>
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p>{message.text}</p>
        </div>
      )}
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200" />
        </div>
        <button type="submit" disabled={loading} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ التغييرات
        </button>
      </form>
    </div>
  );
}
