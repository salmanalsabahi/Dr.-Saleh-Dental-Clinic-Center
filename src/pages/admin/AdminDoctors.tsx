import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

export function AdminDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: '',
    experience: '',
    rating: 5,
    reviews: 0,
    bio: '',
    education: '',
    specialties: '' // comma separated
  });

  useEffect(() => {
    const q = query(collection(db, 'doctors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctors(docsData);
      setLoading(false);
    }, (error) => {
      console.error("Doctors fetch error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (docData?: any) => {
    if (docData) {
      setEditingId(docData.id);
      setFormData({
        ...docData,
        specialties: docData.specialties ? docData.specialties.join(', ') : ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', role: '', image: '', experience: '', rating: 5, reviews: 0, bio: '', education: '', specialties: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({...formData, image: reader.result as string});
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      rating: Number(formData.rating),
      reviews: Number(formData.reviews),
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'doctors', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'doctors'), dataToSave);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving doctor:", error);
      alert("حدث خطأ أثناء الحفظ.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطبيب؟")) {
      try {
        await deleteDoc(doc(db, 'doctors', id));
      } catch (error) {
        console.error("Error deleting doctor:", error);
        alert("حدث خطأ أثناء الحذف.");
      }
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">إدارة الأطباء</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" /> إضافة طبيب
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map(doctor => (
          <div key={doctor.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <img src={doctor.image} alt={doctor.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">{doctor.name}</h3>
              <p className="text-primary-600 text-sm mb-4">{doctor.role}</p>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => handleOpenModal(doctor)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(doctor.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'تعديل طبيب' : 'إضافة طبيب جديد'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">التخصص / الدور</label>
                  <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">الصورة</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0" />
                  {formData.image && <img src={formData.image} alt="Doctor" className="mt-2 h-20" />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الخبرة (مثال: 10 سنوات)</label>
                  <input type="text" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">التعليم</label>
                  <input type="text" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">نبذة</label>
                  <textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0 resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">التخصصات الدقيقة (مفصولة بفاصلة)</label>
                  <input type="text" value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0" placeholder="فينير، زراعة، تقويم..." />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">إلغاء</button>
                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
