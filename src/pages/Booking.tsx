import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, ChevronLeft, AlertCircle, Activity, Loader2, LogIn } from 'lucide-react';
import { cn } from '../components/layout/Navbar';
import { collection, addDoc, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link } from 'react-router-dom';

const defaultServices = [
  'فحص عام', 'تبييض الأسنان', 'استشارة تجميلية', 
  'تقويم الأسنان (تقليدي/شفاف)', 'زراعة الأسنان', 'علاج العصب', 'تخفيف الألم الطارئ'
];

const timeSlots = ['09:00 ص', '10:00 ص', '11:00 ص', '01:00 م', '02:00 م', '03:30 م', '04:30 م'];

export function Booking() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<string[]>(defaultServices);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(setUser);
    
    // Fetch doctors
    const qDocs = query(collection(db, 'doctors'));
    const unsubDocs = onSnapshot(qDocs, (snapshot) => {
      if (!snapshot.empty) {
        setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });

    // Fetch services
    const qServ = query(collection(db, 'services'));
    const unsubServ = onSnapshot(qServ, (snapshot) => {
      if (!snapshot.empty) {
        setServices(snapshot.docs.map(doc => doc.data().title));
      }
    });

    return () => {
      unsubscribeAuth();
      unsubDocs();
      unsubServ();
    };
  }, []);

  const [formData, setFormData] = useState({
    service: '',
    doctor: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const handleNext = async () => {
    if (step === 3) {
      if (!user) return; // Should be handled by UI
      // Submit to Firebase
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, 'appointments'), {
          ...formData,
          userId: user.uid,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        // Create notification for admin
        await addDoc(collection(db, 'notifications'), {
          isAdmin: true,
          message: `حجز موعد جديد من قبل ${formData.name} لخدمة ${formData.service}`,
          type: 'info',
          read: false,
          createdAt: serverTimestamp(),
          link: '/admin/appointments'
        });

        setStep(4);
      } catch (error) {
        console.error("Error booking appointment:", error);
        alert("حدث خطأ أثناء تأكيد الحجز. يرجى المحاولة مرة أخرى.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(s => Math.min(s + 1, 4));
    }
  };

  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const isStepValid = () => {
    if (step === 1) return formData.service !== '';
    if (step === 2) return formData.date !== '' && formData.time !== '';
    if (step === 3) return formData.name !== '' && formData.phone !== '';
    return true;
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-slate-50 px-4 flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 text-center max-w-md">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
            <LogIn className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">يجب تسجيل الدخول</h2>
          <p className="text-slate-600 mb-8">يرجى تسجيل الدخول أو إنشاء حساب جديد لتتمكن من حجز موعد في عيادتنا.</p>
          <Link to="/auth" className="block w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-medium transition-all">
            تسجيل الدخول / إنشاء حساب
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">احجز موعدك</h1>
          <p className="text-slate-600">سريع، سهل، ومؤكد فوراً.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0" />
            <div 
              className="absolute right-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 rounded-full z-0 transition-all duration-500" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
            
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300",
                  step >= i ? "bg-primary-600 text-white" : "bg-white text-slate-400 border-2 border-slate-200"
                )}
              >
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs font-medium text-slate-500 px-1">
            <span>الخدمة</span>
            <span>الوقت والتاريخ</span>
            <span>التفاصيل</span>
            <span>تأكيد</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100">
          
          {/* Step 1: Service */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">بماذا يمكننا مساعدتك؟</h2>
              
              {/* Emergency Banner */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 mb-8">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">هل تشعر بألم؟</h4>
                  <p className="text-sm text-red-700 mt-1">إذا كنت تعاني من ألم شديد، تورم، أو نزيف، يرجى الاتصال بنا فوراً أو اختيار 'تخفيف الألم الطارئ'.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map(service => (
                  <button
                    key={service}
                    onClick={() => updateForm('service', service)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-right transition-all",
                      formData.service === service 
                        ? "border-primary-500 bg-primary-50 text-primary-900" 
                        : "border-slate-100 hover:border-primary-200 text-slate-700"
                    )}
                  >
                    <span className="font-medium">{service}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">اختر الطبيب والوقت</h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">اختر الطبيب (اختياري)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {doctors.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => updateForm('doctor', doc.name)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-right transition-all",
                          formData.doctor === doc.name 
                            ? "border-primary-500 bg-primary-50" 
                            : "border-slate-100 hover:border-primary-200"
                        )}
                      >
                        <div className="font-bold text-slate-900">{doc.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{doc.spec}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">اختر التاريخ</label>
                    <input 
                      type="date" 
                      className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 transition-colors"
                      value={formData.date}
                      onChange={(e) => updateForm('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">اختر الوقت</label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          onClick={() => updateForm('time', time)}
                          className={cn(
                            "py-3 px-2 rounded-lg border-2 text-sm font-medium transition-all",
                            formData.time === time 
                              ? "border-primary-500 bg-primary-50 text-primary-700" 
                              : "border-slate-100 hover:border-primary-200 text-slate-600"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">بياناتك</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل *</label>
                  <input 
                    type="text" 
                    placeholder="أحمد محمد"
                    className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 transition-colors"
                    value={formData.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف *</label>
                    <input 
                      type="tel" 
                      placeholder="0500000000"
                      className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 transition-colors text-right"
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                    <input 
                      type="email" 
                      placeholder="ahmed@example.com"
                      className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 transition-colors text-right"
                      dir="ltr"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">أي ملاحظات للطبيب؟</label>
                  <textarea 
                    rows={3}
                    placeholder="صف مشكلتك باختصار أو أي متطلبات خاصة..."
                    className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 transition-colors resize-none"
                    value={formData.notes}
                    onChange={(e) => updateForm('notes', e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">تم تأكيد الموعد!</h2>
              <p className="text-slate-600 mb-8">شكراً لك، {formData.name}. لقد أرسلنا تأكيداً إلى بريدك الإلكتروني وهاتفك.</p>
              
              <div className="bg-slate-50 rounded-2xl p-6 max-w-sm mx-auto text-right space-y-4 mb-8 border border-slate-100">
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-primary-500 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">الخدمة</div>
                    <div className="font-semibold text-slate-900">{formData.service}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-primary-500 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">التاريخ والوقت</div>
                    <div className="font-semibold text-slate-900">{formData.date} الساعة {formData.time}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary-500 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">الطبيب</div>
                    <div className="font-semibold text-slate-900">{formData.doctor || 'أي طبيب متاح'}</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => window.location.href = '/'}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                العودة للرئيسية
              </button>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
              {step > 1 ? (
                <button 
                  onClick={handlePrev}
                  className="text-slate-500 font-medium hover:text-slate-900 transition-colors px-4 py-2"
                >
                  السابق
                </button>
              ) : <div></div>}
              
              <button 
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all",
                  isStepValid() && !isSubmitting
                    ? "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 3 ? 'تأكيد الحجز' : 'متابعة'} {!isSubmitting && <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
