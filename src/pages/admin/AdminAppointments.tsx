import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Loader2, CheckCircle2, XCircle, Clock, Trash2, X, Send, MessageCircle } from 'lucide-react';
import { cn } from '../../components/layout/Navbar';

export function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(appsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openConfirmModal = (app: any) => {
    setSelectedApp(app);
    setAdminMessage(`مرحباً ${app.name}، تم تأكيد موعدك بنجاح في يوم ${app.date} الساعة ${app.time}. نرجو الحضور قبل الموعد بـ 10 دقائق.`);
    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedApp) return;
    
    setIsConfirming(true);
    try {
      // 1. Update appointment status
      await updateDoc(doc(db, 'appointments', selectedApp.id), { 
        status: 'confirmed',
        adminMessage: adminMessage
      });

      // 2. Create notification for user (if userId exists)
      if (selectedApp.userId) {
        await addDoc(collection(db, 'notifications'), {
          userId: selectedApp.userId,
          message: adminMessage,
          type: 'success',
          read: false,
          createdAt: serverTimestamp()
        });
      }

      // 3. Send email notification (if email exists)
      if (selectedApp.email) {
        try {
          await fetch('/api/send-appointment-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: selectedApp.email,
              userName: selectedApp.name,
              message: adminMessage,
              subject: 'تأكيد موعدك - مركز الدكتور صالح الرداعي'
            }),
          });
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // We don't want to fail the whole process if just the email fails
        }
      }

      // 4. Open WhatsApp link
      if (selectedApp.phone) {
        const phone = selectedApp.phone.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(adminMessage)}`;
        window.open(whatsappUrl, '_blank');
      }

      setConfirmModalOpen(false);
      setSelectedApp(null);
    } catch (error) {
      console.error("Error confirming appointment:", error);
      alert("حدث خطأ أثناء تأكيد الحجز.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("حدث خطأ أثناء تحديث الحالة.");
    }
  };

  const handleDelete = (id: string) => {
    setAppToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!appToDelete) return;
    try {
      await deleteDoc(doc(db, 'appointments', appToDelete));
      setDeleteConfirmOpen(false);
      setAppToDelete(null);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("حدث خطأ أثناء الحذف.");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">إدارة المواعيد</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">المريض</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">الخدمة / الطبيب</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">التاريخ والوقت</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">الحالة</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">لا توجد مواعيد حالياً.</td>
                </tr>
              ) : appointments.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{app.name}</div>
                    <div className="text-sm text-slate-500" dir="ltr">{app.phone}</div>
                    {app.email && <div className="text-sm text-slate-500">{app.email}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{app.service}</div>
                    <div className="text-sm text-slate-500">{app.doctor || 'أي طبيب'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{app.date}</div>
                    <div className="text-sm text-slate-500">{app.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                      app.status === 'confirmed' ? "bg-green-100 text-green-700" :
                      app.status === 'cancelled' ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    )}>
                      {app.status === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {app.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
                      {app.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                      {app.status === 'confirmed' ? 'مؤكد' : app.status === 'cancelled' ? 'ملغى' : 'قيد الانتظار'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {app.status === 'confirmed' && app.phone && (
                        <a 
                          href={`https://wa.me/${app.phone.replace(/\D/g, '')}?text=${encodeURIComponent(app.adminMessage || '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title="مراسلة واتساب"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      )}
                      {app.status !== 'confirmed' && (
                        <button onClick={() => openConfirmModal(app)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="تأكيد">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      {app.status !== 'cancelled' && (
                        <button onClick={() => handleStatusChange(app.id, 'cancelled')} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="إلغاء">
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(app.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">تأكيد الحذف</h3>
            <p className="text-slate-600 mb-6">
              هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={executeDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition-all"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setAppToDelete(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-medium transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Edit Modal */}
      {confirmModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">تأكيد الموعد</h3>
              <button 
                onClick={() => setConfirmModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">رسالة التأكيد (ستظهر للعميل)</label>
                <textarea
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none h-32"
                  placeholder="اكتب رسالة التأكيد هنا..."
                />
              </div>
              <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm flex items-start gap-3">
                <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                <p>يمكنك تعديل وقت وتاريخ الموعد في الرسالة أعلاه لإعلام المريض بأي تغييرات.</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                {isConfirming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                تأكيد وإرسال
              </button>
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
