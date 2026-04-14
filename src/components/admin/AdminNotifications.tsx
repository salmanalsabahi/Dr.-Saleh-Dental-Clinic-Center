import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Bell, X, Info, Calendar, Key, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('isAdmin', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched notifications:", fetchedNotifications.length);
      // Manual sort by createdAt descending
      fetchedNotifications.sort((a: any, b: any) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val.toMillis === 'function') return val.toMillis();
          return new Date(val).getTime();
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
      setNotifications(fetchedNotifications);
    }, (error) => {
      console.error("AdminNotifications error:", error);
    });

    return () => unsubscribe();
  }, []);

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
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 md:left-auto md:right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">تنبيهات الإدارة</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500">لا توجد تنبيهات جديدة</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map(n => (
                  <Link
                    key={n.id}
                    to={n.link || '#'}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);
                      setIsOpen(false);
                    }}
                    className={`block p-4 transition-colors hover:bg-slate-50 ${n.read ? 'bg-white' : 'bg-primary-50/30'}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                        {n.link?.includes('bookings') ? <Calendar className="w-4 h-4" /> : 
                         n.link?.includes('messages') ? <MessageSquare className="w-4 h-4" /> :
                         n.link?.includes('resets') ? <Key className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${n.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {n.createdAt && typeof n.createdAt.toDate === 'function' 
                            ? n.createdAt.toDate().toLocaleString('ar-YE') 
                            : n.createdAt ? new Date(n.createdAt).toLocaleString('ar-YE') : ''}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
