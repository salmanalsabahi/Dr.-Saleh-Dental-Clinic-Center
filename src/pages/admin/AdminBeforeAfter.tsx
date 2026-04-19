import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Loader2, Plus, Trash2, Edit2, X, Image as ImageIcon } from 'lucide-react';

import { compressImage } from '../../utils/imageUtils';

export function AdminBeforeAfter() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    beforeImage: '',
    afterImage: '',
    active: true
  });

  useEffect(() => {
    const q = query(collection(db, 'beforeAfter'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("BeforeAfter fetch error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'beforeImage' | 'afterImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const compressedImage = await compressImage(file);
      setFormData({...formData, [field]: compressedImage});
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("حدث خطأ أثناء معالجة الصورة. يرجى المحاولة بصورة أخرى.");
    }
  };

  const handleOpenModal = (caseData?: any) => {
    if (caseData) {
      setEditingId(caseData.id);
      setFormData({ ...caseData });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', beforeImage: '', afterImage: '', active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'beforeAfter', editingId), formData);
      } else {
        await addDoc(collection(db, 'beforeAfter'), formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving case:", error);
      alert("حدث خطأ أثناء الحفظ.");
    }
  };

  const deleteCase = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحالة؟")) {
      await deleteDoc(doc(db, 'beforeAfter', id));
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">إدارة حالات قبل وبعد</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" /> إضافة حالة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="grid grid-cols-2 h-32">
              <img src={item.beforeImage || undefined} alt="Before" className="w-full h-full object-cover border-r border-white" />
              <img src={item.afterImage || undefined} alt="After" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex-1 flex flex-col gap-2">
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-slate-600 text-sm flex-1">{item.description}</p>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => deleteCase(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'تعديل الحالة' : 'إضافة حالة جديدة'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">عنوان الحالة (مثلاً: تبييض أسنان بالليزر)</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0" />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">صورة "قبل"</label>
                  <div className="relative aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden group">
                    {formData.beforeImage ? (
                      <img src={formData.beforeImage || undefined} alt="Before" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs">اختر صورة</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'beforeImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">صورة "بعد"</label>
                  <div className="relative aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden group">
                    {formData.afterImage ? (
                      <img src={formData.afterImage || undefined} alt="After" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs">اختر صورة</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'afterImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">وصف موجز للتحول</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0 resize-none" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">إلغاء</button>
                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">حفظ الحالة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
