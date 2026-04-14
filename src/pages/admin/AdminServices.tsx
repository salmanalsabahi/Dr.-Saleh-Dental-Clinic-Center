import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

export function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    shortDesc: '',
    icon: 'Shield', // default icon name
    duration: '',
    results: '',
    benefits: '', // comma separated
    steps: '' // comma separated
  });

  useEffect(() => {
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(docsData);
      setLoading(false);
    }, (error) => {
      console.error("Services fetch error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (docData?: any) => {
    if (docData) {
      setEditingId(docData.id);
      setFormData({
        ...docData,
        benefits: docData.benefits ? docData.benefits.join(', ') : '',
        steps: docData.steps ? docData.steps.join(', ') : ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '', shortDesc: '', icon: 'Shield', duration: '', results: '', benefits: '', steps: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      benefits: formData.benefits.split(',').map(s => s.trim()).filter(s => s),
      steps: formData.steps.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'services', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'services'), dataToSave);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving service:", error);
      alert("حدث خطأ أثناء الحفظ.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الخدمة؟")) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (error) {
        console.error("Error deleting service:", error);
        alert("حدث خطأ أثناء الحذف.");
      }
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">إدارة الخدمات</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" /> إضافة خدمة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{service.shortDesc}</p>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
              <button onClick={() => handleOpenModal(service)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit2 className="w-5 h-5" />
              </button>
              <button onClick={() => handleDelete(service.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">اسم الخدمة</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">وصف قصير</label>
                  <textarea required rows={2} value={formData.shortDesc} onChange={e => setFormData({...formData, shortDesc: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المدة المتوقعة</label>
                  <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">النتائج المتوقعة</label>
                  <input type="text" value={formData.results} onChange={e => setFormData({...formData, results: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">الفوائد (مفصولة بفاصلة)</label>
                  <textarea rows={2} value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0 resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">خطوات الإجراء (مفصولة بفاصلة)</label>
                  <textarea rows={2} value={formData.steps} onChange={e => setFormData({...formData, steps: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0 resize-none" />
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
