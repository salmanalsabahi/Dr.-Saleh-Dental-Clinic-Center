import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Star, Activity, CheckCircle2, HeartPulse, ArrowLeft, Clock, Info, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const iconMap: Record<string, any> = {
  Shield, Star, Activity, CheckCircle2, HeartPulse
};

const defaultServices = [
  { 
    id: 'maxillofacial', 
    title: 'جراحة الوجه والفكين', 
    shortDesc: 'علاج الحالات الجراحية المعقدة للوجه والفكين والجمجمة.',
    icon: 'Shield',
    benefits: ['علاج تشوهات الفكين', 'تصحيح العيوب الخلقية', 'استعادة الوظيفة والمظهر'],
    duration: 'يختلف حسب الحالة',
    results: 'تحسن وظيفي وجمالي ملحوظ',
    steps: ['استشارة تخصصية', 'أشعة مقطعية', 'تخطيط جراحي', 'العملية الجراحية']
  },
  { 
    id: 'implants', 
    title: 'زراعة الأسنان', 
    shortDesc: 'تعويض الأسنان المفقودة بأحدث التقنيات الجراحية.',
    icon: 'Star',
    benefits: ['ثبات عالي', 'مظهر طبيعي', 'الحفاظ على عظام الفك'],
    duration: '3-6 أشهر',
    results: 'ابتسامة كاملة ووظيفة مضغ مثالية',
    steps: ['تقييم العظم', 'وضع الزرعة', 'فترة الاندماج العظمي', 'تركيب التاج']
  },
  { 
    id: 'tumors', 
    title: 'استئصال الأورام الفموية', 
    shortDesc: 'جراحة متخصصة لاستئصال أورام الفم والوجه والفكين.',
    icon: 'Activity',
    benefits: ['تشخيص دقيق', 'استئصال آمن', 'إعادة بناء الأنسجة'],
    duration: 'حسب حجم الورم',
    results: 'السيطرة على المرض وإعادة التأهيل',
    steps: ['خزعة وتشخيص', 'تصوير شعاعي متقدم', 'الاستئصال الجراحي', 'المتابعة الدورية']
  },
  { 
    id: 'trauma', 
    title: 'علاج كسور الوجه', 
    shortDesc: 'ترميم وإصلاح كسور عظام الوجه والفكين الناتجة عن الحوادث.',
    icon: 'CheckCircle2',
    benefits: ['تثبيت دقيق للكسور', 'تقليل الندبات', 'استعادة تناسق الوجه'],
    duration: 'حالة طارئة/مجدولة',
    results: 'التئام العظام بشكل صحيح',
    steps: ['إسعاف أولي', 'تصوير ثلاثي الأبعاد', 'تثبيت جراحي', 'نقاهة ومتابعة']
  },
  { 
    id: 'orthognathic', 
    title: 'جراحة الفكين التقويمية', 
    shortDesc: 'تصحيح عدم انتظام عظام الفك لتحسين العضة والمظهر.',
    icon: 'HeartPulse',
    benefits: ['تحسين النطق والمضغ', 'توازن ملامح الوجه', 'علاج مشاكل التنفس'],
    duration: 'تخطيط طويل الأمد',
    results: 'تطابق مثالي للفكين',
    steps: ['تنسيق مع طبيب التقويم', 'تخطيط رقمي', 'الجراحة التصحيحية', 'متابعة ما بعد الجراحة']
  },
];

export function Services() {
  const [services, setServices] = useState<any[]>(defaultServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching services:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }
  return (
    <div className="pt-24 pb-20 bg-slate-50">
      {/* Header */}
      <div className="bg-white py-20 relative overflow-hidden text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 mb-6">خدماتنا المتميزة</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            نقدم مجموعة واسعة من علاجات الأسنان المتقدمة باستخدام أحدث التقنيات لضمان راحتك وابتسامة مشرقة.
          </p>
        </div>
      </div>

      {/* Services List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Shield;
            return (
              <div key={service.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <Icon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-4">{service.title}</h2>
                <p className="text-slate-600 mb-6 min-h-[3rem]">{service.shortDesc}</p>
                
                <Link to={`/book?service=${service.id}`} className="inline-flex items-center justify-center w-full bg-slate-900 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all">
                  احجز موعداً
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
