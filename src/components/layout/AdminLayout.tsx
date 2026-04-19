import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { auth, signInWithGoogle, logOut, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LayoutDashboard, Users, Activity, LogOut, Loader2, Calendar, Settings, Shield, Star, Image as ImageIcon, ExternalLink, Key, Bell, MessageSquare, BarChart3 } from 'lucide-react';
import { cn } from './Navbar';
import { AdminNotifications } from '../admin/AdminNotifications';

export function AdminLayout() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else if (currentUser.email === 'salmanalsabahi775@gmail.com') {
            // Keep hardcoded email as a fallback SUPER ADMIN to prevent lockout
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">لوحة تحكم المشرف</h1>
          <p className="text-slate-600 mb-8">يرجى تسجيل الدخول للوصول إلى لوحة التحكم.</p>
          <Link
            to="/auth"
            state={{ from: location }}
            className="block w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">عذراً، لا تملك صلاحية الدخول</h1>
          <p className="text-slate-600 mb-8">هذه الصفحة مخصصة لإدارة الموقع فقط. سيتم تحويلك للرئيسية.</p>
          <Link
            to="/"
            className="block w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'التحليلات', path: '/admin/analytics', icon: BarChart3 },
    { name: 'المواعيد', path: '/admin', icon: Calendar },
    { name: 'الأطباء', path: '/admin/doctors', icon: Users },
    { name: 'الخدمات', path: '/admin/services', icon: Activity },
    { name: 'العروض والتخفيضات', path: '/admin/offers', icon: Star },
    { name: 'حجوزات العروض', path: '/admin/offer-bookings', icon: Calendar },
    { name: 'رسائل العملاء', path: '/admin/messages', icon: MessageSquare },
    { name: 'طلبات إعادة التعيين', path: '/admin/password-resets', icon: Key },
    { name: 'قبل وبعد', path: '/admin/before-after', icon: ImageIcon },
    { name: 'المستخدمين', path: '/admin/users', icon: Shield },
    { name: 'إعدادات الحساب', path: '/admin/settings', icon: Settings },
    { name: 'إعدادات الموقع', path: '/admin/site-settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-display font-bold text-lg">
              L
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              لوحة التحكم
            </span>
          </Link>
          <AdminNotifications />
        </div>

        <div className="px-4 py-4">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl transition-all border border-slate-700 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            <span>عرض الموقع</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                  ? "bg-primary-600 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="User" className="w-8 h-8 rounded-full" />
            <div className="text-sm overflow-hidden">
              <div className="text-white truncate">{user.displayName || 'المشرف'}</div>
              <div className="text-slate-500 text-xs truncate">{user.email}</div>
            </div>
          </div>
          <button
            onClick={logOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-right text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
