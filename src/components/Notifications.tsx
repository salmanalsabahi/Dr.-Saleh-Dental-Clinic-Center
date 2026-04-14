import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Bell, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

export function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">الإشعارات</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500">لا توجد إشعارات حالياً</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 transition-colors ${n.read ? 'bg-white' : 'bg-primary-50/30'}`}
                    onClick={() => !n.read && markAsRead(n.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        n.type === 'success' ? 'bg-green-100 text-green-600' : 
                        n.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
                         n.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${n.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {n.createdAt?.toDate().toLocaleString('ar-YE')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
