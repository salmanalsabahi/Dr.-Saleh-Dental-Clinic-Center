import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, Loader2, AlertCircle, Phone, CheckCircle2, X } from 'lucide-react';
import { 
  auth, 
  signInWithGoogle, 
  saveUserToFirestore,
  findUserByPhone,
  db,
  sendPasswordResetEmail
} from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetRequested, setResetRequested] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  // For login, we allow email or phone
  const [loginIdentifier, setLoginIdentifier] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        let loginEmail = loginIdentifier;
        
        // If it looks like a phone number (only digits, or starts with +)
        if (/^\+?[\d\s-]{8,}$/.test(loginIdentifier)) {
          const userDoc = await findUserByPhone(loginIdentifier);
          if (userDoc && userDoc.email) {
            loginEmail = userDoc.email;
          } else {
            throw new Error('رقم الهاتف غير مسجل لدينا.');
          }
        }

        if (!loginEmail) {
          throw new Error('يرجى إدخال البريد الإلكتروني أو رقم الهاتف.');
        }

        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
        await saveUserToFirestore(userCredential.user, {});
        navigate(from, { replace: true });
      } else {
        // Sign up validation
        if (!email || !password || !name || !phone) {
          throw new Error('يرجى ملء جميع الحقول المطلوبة.');
        }
        if (password !== confirmPassword) {
          throw new Error('كلمات المرور غير متطابقة.');
        }
        if (password.length < 6) {
          throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await saveUserToFirestore(userCredential.user, { phone, displayName: name });
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      
      let errorMessage = 'حدث خطأ أثناء المصادقة. يرجى المحاولة مرة أخرى.';
      
      if (err.message === 'رقم الهاتف غير مسجل لدينا.' || 
          err.message === 'يرجى ملء جميع الحقول المطلوبة.' || 
          err.message === 'كلمات المرور غير متطابقة.' ||
          err.message === 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف.' ||
          err.message === 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.') {
        errorMessage = err.message;
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'هذا الحساب موجود بالفعل! يرجى الانتقال لقسم (تسجيل الدخول) المجاور للدخول إلى حسابك.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صالح.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'تسجيل الدخول بالبريد وكلمة المرور غير مفعل في إعدادات Firebase.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة جداً.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMessage = 'البيانات المدخلة غير صحيحة. إذا كنت متأكداً من الإيميل، يرجى الضغط على "نسيت كلمة المرور؟" لإنشاء كلمة مرور جديدة.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'هذا البريد مسجل مسبقاً بطريقة دخول مختلفة (مثل جوجل). يرجى المتابعة باستخدام جوجل.';
      } else if (err.message?.includes('Identity Toolkit API') || err.code?.includes('identity-toolkit-api')) {
        errorMessage = 'يجب تفعيل Identity Toolkit API في لوحة تحكم Google Cloud للمشروع الخاص بك.';
      } else {
        // Display the actual error message for debugging
        errorMessage = `خطأ (${err.code}): ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Google Auth error:", err);
      // Ignore if the user manually closed the popup
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('');
      } else if (err.code === 'auth/popup-blocked') {
        setError('تم حظر النافذة المنبثقة بواسطة المتصفح. يرجى فتح الموقع في نافذة جديدة (Open in new tab) أو السماح بالنوافذ المنبثقة.');
      } else {
        setError(`حدث خطأ أثناء تسجيل الدخول باستخدام Google: ${err.message || 'يرجى المحاولة مرة أخرى.'}`);
      }
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier) {
      setError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف أولاً.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await addDoc(collection(db, 'password_reset_requests'), {
        identifier: loginIdentifier,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Create notification for admin
      await addDoc(collection(db, 'notifications'), {
        isAdmin: true,
        message: `طلب جديد لإعادة تعيين كلمة المرور من: ${loginIdentifier}`,
        type: 'info',
        read: false,
        createdAt: serverTimestamp(),
        link: '/admin/password-resets'
      });

      setResetRequested(true);
      setTimeout(() => {
        setShowResetModal(false);
        setResetRequested(false);
      }, 5000);
    } catch (err: any) {
      console.error("Reset request error:", err);
      setError('حدث خطأ أثناء إرسال طلب إعادة التعيين.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => { setIsLogin(false); setError(''); setResetRequested(false); }}
              className={`flex-1 py-4 text-center font-medium transition-colors ${!isLogin ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              إنشاء حساب
            </button>
            <button
              onClick={() => { setIsLogin(true); setError(''); setResetRequested(false); }}
              className={`flex-1 py-4 text-center font-medium transition-colors ${isLogin ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              تسجيل الدخول
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            {resetRequested && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p>تم إرسال طلبك للمشرف. سيتم تغيير كلمة المرور وإرسالها إليك قريباً.</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {isLogin ? 'البريد الإلكتروني أو رقم الهاتف' : 'البريد الإلكتروني'}
                </label>
                <div className="relative">
                  {isLogin ? (
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  ) : (
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  )}
                  <input
                    type={isLogin ? "text" : "email"}
                    required
                    value={isLogin ? loginIdentifier : email}
                    onChange={(e) => isLogin ? setLoginIdentifier(e.target.value) : setEmail(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left"
                    placeholder={isLogin ? "example@email.com أو 77xxxxxxx" : "example@email.com"}
                    dir="ltr"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left"
                      placeholder="77xxxxxxx"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left"
                      placeholder="••••••••"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-slate-600">تذكرني</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setShowResetModal(true)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'دخول' : 'إنشاء حساب')}
              </button>
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">أو</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-6 w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              المتابعة باستخدام جوجل
            </button>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
          >
            <button 
              onClick={() => setShowResetModal(false)}
              className="absolute left-4 top-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">نسيت كلمة المرور؟</h2>
            <p className="text-slate-600 mb-6">أدخل بريدك الإلكتروني أو رقم هاتفك المسجل وسيقوم المشرف بتغيير كلمة المرور وإرسالها إليك.</p>

            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني أو رقم الهاتف</label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left"
                  placeholder="أدخل بياناتك هنا"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إرسال طلب للمشرف'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
