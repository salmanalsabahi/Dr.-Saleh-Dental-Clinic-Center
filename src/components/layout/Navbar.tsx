import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth, signInWithGoogle, logOut } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Notifications } from '../Notifications';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { name: 'الرئيسية', path: '/' },
  { name: 'خدماتنا', path: '/services' },
  { name: 'أطباؤنا', path: '/doctors' },
  { name: 'من نحن', path: '/about' },
  { name: 'العروض', path: '/offers' },
  { name: 'اتصل بنا', path: '/contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const { settings } = useSiteSettings();

  const isTransparent = location.pathname === '/' && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        !isTransparent ? 'glass-nav py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white font-display font-bold text-xl shadow-lg group-hover:shadow-teal-500/25 transition-all">
                R
              </div>
            )}
            <span className={cn("font-display font-bold text-xl tracking-tight transition-colors", !isTransparent ? "text-slate-900" : "text-white")}>
              {settings?.clinicName || (
                <>مركز الدكتور <span className={!isTransparent ? "text-teal-600" : "text-teal-400"}>صالح الرداعي</span></>
              )}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'text-sm font-medium transition-colors relative',
                  location.pathname === link.path
                    ? (!isTransparent ? 'text-teal-700' : 'text-amber-400')
                    : (!isTransparent ? 'text-slate-700 hover:text-teal-600' : 'text-white/90 hover:text-amber-400')
                )}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1.5 inset-x-0 h-0.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Notifications />
                {user.email === 'salmanalsabahi775@gmail.com' && (
                  <Link to="/admin" className={cn("text-sm font-medium transition-colors", !isTransparent ? "text-slate-700 hover:text-teal-600" : "text-white/90 hover:text-amber-400")}>
                    لوحة التحكم
                  </Link>
                )}
                <Link to="/profile" className={cn("flex items-center gap-2 text-sm font-medium transition-colors", !isTransparent ? "text-slate-700 hover:text-teal-600" : "text-white/90 hover:text-amber-400")}>
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="User" className="w-8 h-8 rounded-full border-2 border-amber-400/50" />
                  <span>{user.displayName?.split(' ')[0]}</span>
                </Link>
                <button onClick={logOut} className={cn("p-2 rounded-full transition-colors", !isTransparent ? "text-red-500 hover:bg-red-50" : "text-red-400 hover:bg-white/10")} title="تسجيل الخروج">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className={cn("flex items-center gap-2 text-sm font-medium transition-colors", !isTransparent ? "text-slate-700 hover:text-teal-600" : "text-white/90 hover:text-amber-400")}>
                <UserIcon className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Link>
            )}
            
            <Link
              to="/book"
              className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-teal-900/20 hover:shadow-teal-600/40 hover:-translate-y-0.5 border border-amber-400/40 relative overflow-hidden group"
            >
              <span className="relative z-10">احجز موعداً</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/20 to-amber-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={cn("md:hidden p-2 -me-2 transition-colors", !isTransparent ? "text-slate-900" : "text-white")}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    'block px-3 py-3 rounded-lg text-base font-medium transition-colors',
                    location.pathname === link.path
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-teal-600'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-6 px-3 pt-6 border-t border-slate-100 flex flex-col gap-4">
                {user ? (
                  <>
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-3">
                        <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="User" className="w-10 h-10 rounded-full" />
                        <div>
                          <div className="font-medium text-slate-900">{user.displayName || user.email.split('@')[0]}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                      <Notifications />
                    </div>
                    {user.email === 'salmanalsabahi775@gmail.com' && (
                      <Link to="/admin" className="flex items-center gap-2 py-2 text-teal-600 font-medium w-full text-right">
                        لوحة تحكم المشرف
                      </Link>
                    )}
                    <button onClick={logOut} className="flex items-center gap-2 py-2 text-red-600 font-medium w-full text-right">
                      <LogOut className="w-5 h-5" />
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-3 rounded-xl font-medium transition-colors">
                    <UserIcon className="w-5 h-5" />
                    تسجيل الدخول
                  </Link>
                )}
                <a href={settings?.phone ? `tel:${settings.phone}` : "tel:+1234567890"} className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">اتصل بنا في أي وقت</div>
                    <div className="text-sm font-semibold text-slate-900" dir="ltr">{settings?.phone || "(555) 123-4567"}</div>
                  </div>
                </a>
                <Link
                  to="/book"
                  className="w-full bg-teal-600 text-white px-5 py-3 rounded-xl text-center font-medium shadow-lg shadow-teal-600/20 border border-amber-400/30"
                >
                  احجز موعداً
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
