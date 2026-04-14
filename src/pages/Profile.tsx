import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, User, CheckCircle2, Activity, Loader2, XCircle, Settings } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link } from 'react-router-dom';
import { ProfileSettings } from './ProfileSettings';

export function Profile() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, 'appointments'),
          where('userId', '==', currentUser.uid)
        );
        
        const unsubscribeDb = onSnapshot(q, (snapshot) => {
          setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        }, (error) => {
          console.error("Error fetching appointments:", error);
          setLoading(false);
        });

        return () => unsubscribeDb();
      } else {
        setAppointments([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">يرجى تسجيل الدخول لعرض ملفك الشخصي</h2>
          <Link to="/" className="text-primary-600 hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center gap-6">
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-primary-50"
          />
          <div className="text-center md:text-right flex-1">
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">{user.displayName}</h1>
            <p className="text-slate-600">{user.email}</p>
          </div>
          {user.email === 'salmanalsabahi775@gmail.com' && (
            <div className="mt-4 md:mt-0">
              <Link to="/admin" className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-colors gap-2">
                الانتقال إلى لوحة تحكم المشرف
              </Link>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('appointments')} className={`px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'appointments' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600'}`}>مواعيدي</button>
          <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600'}`}>إعدادات الحساب</button>
        </div>

        {activeTab === 'appointments' ? (
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">مواعيدي</h2>
            
            {appointments.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد مواعيد</h3>
                <p className="text-slate-600 mb-6">لم تقم بحجز أي مواعيد بعد.</p>
                <Link to="/book" className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                  احجز موعداً الآن
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map((apt) => (
                  <div key={apt.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    {/* Status Indicator */}
                    <div className={`absolute top-0 right-0 w-2 h-full ${
                      apt.status === 'confirmed' ? 'bg-green-500' :
                      apt.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{apt.service}</h3>
                        <p className="text-slate-600 text-sm">{apt.doctor}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {apt.status === 'confirmed' ? 'مؤكد' :
                         apt.status === 'cancelled' ? 'ملغى' : 'قيد الانتظار'}
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{apt.time}</span>
                      </div>
                    </div>

                    {apt.adminMessage && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700">
                        <div className="font-medium text-slate-900 mb-1">رسالة من العيادة:</div>
                        <p>{apt.adminMessage}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <ProfileSettings />
        )}

      </div>
    </div>
  );
}
