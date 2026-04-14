import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MessageCircle, PhoneCall, Shield, 
  Star, CheckCircle2, Clock, MapPin, Activity, HeartPulse, Loader2
} from 'lucide-react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { useSiteSettings } from '../hooks/useSiteSettings';

const iconMap: Record<string, any> = {
  Shield, Star, Activity, CheckCircle2, HeartPulse
};

const defaultServices = [
  { id: 'maxillofacial', title: 'جراحة الوجه والفكين', shortDesc: 'جراحات تصحيحية، علاج الكسور، وتجميل الفكين.', icon: 'Shield' },
  { id: 'implants', title: 'زراعة الأسنان', shortDesc: 'تعويض الأسنان المفقودة بأحدث التقنيات العالمية.', icon: 'Star' },
  { id: 'tumors', title: 'استئصال أورام الفم', shortDesc: 'تشخيص وعلاج أورام الفم والوجه والفكين بدقة عالية.', icon: 'Activity' },
  { id: 'cosmetic', title: 'تجميل الفكين', shortDesc: 'تحسين مظهر الوجه والفكين جراحياً وتجميلياً.', icon: 'CheckCircle2' },
  { id: 'fractures', title: 'علاج كسور الوجه', shortDesc: 'رعاية طارئة ومتخصصة لكسور عظام الوجه والفكين.', icon: 'Shield' },
  { id: 'oral-surgery', title: 'جراحة الفم الصغرى', shortDesc: 'خلع الأسنان المطمورة وعلاجات اللثة الجراحية.', icon: 'HeartPulse' },
];

const testimonials = [
  { name: 'أحمد الوصابي', text: 'الدكتور صالح من أكفأ الجراحين في اليمن. أجريت عنده عملية زراعة وكانت النتائج ممتازة.', rating: 5 },
  { name: 'خالد الصنعاني', text: 'مركز مجهز بأحدث الأجهزة وتعامل راقي جداً. شكراً للدكتور صالح وفريقه.', rating: 5 },
  { name: 'يحيى الحيمي', text: 'دقة في المواعيد واحترافية عالية في العمل الجراحي. أنصح به بشدة.', rating: 5 },
];

export function Home() {
  const [services, setServices] = useState<any[]>(defaultServices);
  const [offers, setOffers] = useState<any[]>([]);
  const [beforeAfterCases, setBeforeAfterCases] = useState<any[]>([]);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const qServices = query(collection(db, 'services'));
    const unsubscribeServices = onSnapshot(qServices, (snapshot) => {
      if (!snapshot.empty) {
        setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });

    const qOffers = query(collection(db, 'offers'), where('active', '==', true));
    const unsubscribeOffers = onSnapshot(qOffers, (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qBeforeAfter = query(collection(db, 'beforeAfter'), where('active', '==', true));
    const unsubscribeBeforeAfter = onSnapshot(qBeforeAfter, (snapshot) => {
      setBeforeAfterCases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeServices();
      unsubscribeOffers();
      unsubscribeBeforeAfter();
    };
  }, []);
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            crossOrigin="anonymous"
            poster="https://images.pexels.com/photos/6502931/pexels-photo-6502931.jpeg?auto=compress&cs=tinysrgb&w=1920"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
            style={{ filter: 'brightness(0.7) contrast(1.2)' }}
          >
            <source src="https://videos.pexels.com/video-files/6502931/6502931-hd_1920_1080_25fps.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/80 via-slate-900/60 to-slate-900/30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-primary-500/20 text-primary-200 text-sm font-semibold tracking-wide mb-6 backdrop-blur-sm border border-primary-500/30">
                استشاري جراحة الفم والوجه والفكين
              </span>
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-[1.2] mb-6 drop-shadow-lg">
                {settings?.clinicName ? (
                  settings.clinicName
                ) : (
                  <>مركز الدكتور <span className="text-primary-400">صالح الرداعي</span> للجراحة والزراعة</>
                )}
              </h1>
              <p className="text-lg text-slate-200 mb-10 max-w-xl leading-relaxed drop-shadow-md">
                نقدم رعاية جراحية متخصصة ومتقدمة في جراحة الوجه والفكين وزراعة الأسنان، باستخدام أحدث التقنيات العالمية لضمان أفضل النتائج لمرضانا في صنعاء.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/book" className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-full text-center font-medium transition-all duration-300 shadow-lg shadow-primary-600/30 hover:shadow-primary-500/50 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group">
                  احجز استشارة <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                </Link>
                <Link to="/services" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-8 py-4 rounded-full text-center font-medium transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                  خدماتنا الجراحية
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="relative z-20 -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-4 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border border-slate-100">
          <Link to="/book" className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 group">
            <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">حجز موعد</span>
          </Link>
          <a href="https://www.facebook.com/Dr.SalehAlradaei" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 group">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">صفحة فيسبوك</span>
          </a>
          <a href="tel:+9671234567" className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 group">
            <div className="w-12 h-12 rounded-full bg-secondary-50 text-secondary-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <PhoneCall className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-900 group-hover:text-secondary-600 transition-colors">اتصل بنا</span>
          </a>
          <Link to="/services" className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 group">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">التخصصات</span>
          </Link>
        </div>
      </section>

      {/* Offers Section */}
      {offers.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">عروض المركز</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map(offer => (
                <div key={offer.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] cursor-pointer group">
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary-600 transition-colors">{offer.title}</h3>
                  <p className="text-slate-600 mb-4">{offer.description}</p>
                  <div className="text-2xl font-bold text-primary-600 group-hover:scale-105 origin-right transition-transform">{offer.discount}% خصم</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Overview */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">تخصصات جراحية متقدمة</h2>
            <p className="text-slate-600 text-lg">نقدم حلولاً جراحية شاملة ومعقدة للوجه والفكين، مع التركيز على الدقة والنتائج الوظيفية والجمالية المثالية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] || Shield;
              return (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary-100 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">{service.title}</h3>
                <p className="text-slate-600 mb-6">{service.shortDesc}</p>
                <Link to={`/services#${service.id}`} className="text-primary-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                  تفاصيل الخدمة <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )})}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/services" className="inline-flex items-center gap-2 text-slate-900 font-semibold hover:text-primary-600 transition-colors">
              عرض جميع التخصصات <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2070&auto=format&fit=crop" 
                alt="Surgical procedure" 
                className="rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6">لماذا تختار مركز الدكتور صالح الرداعي؟</h2>
              <p className="text-slate-600 text-lg mb-8">نحن نجمع بين الخبرة الجراحية العميقة وأحدث التقنيات الطبية لتقديم رعاية تخصصية لا تضاهى في اليمن.</p>
              
              <div className="space-y-6">
                {[
                  { title: 'خبرة استشارية واسعة', desc: 'الدكتور صالح الرداعي استشاري متخصص بخبرة سنوات في الجراحات المعقدة.' },
                  { title: 'تكنولوجيا جراحية متطورة', desc: 'نستخدم أحدث الأجهزة في التشخيص والجراحة لضمان الدقة والأمان.' },
                  { title: 'نتائج تجميلية ووظيفية', desc: 'نركز على استعادة الوظيفة الطبيعية مع تحقيق أفضل مظهر جمالي.' },
                  { title: 'رعاية متكاملة في صنعاء', desc: 'موقعنا في قلب العاصمة صنعاء يسهل الوصول لجميع المرضى.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">نتائج جراحية واقعية</h2>
            <p className="text-slate-600 text-lg">شاهد التحولات الجراحية والجمالية التي حققناها لمرضانا في المركز.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {beforeAfterCases.length > 0 ? (
              beforeAfterCases.map(item => (
                <BeforeAfterSlider 
                  key={item.id}
                  beforeImage={item.beforeImage}
                  afterImage={item.afterImage}
                  title={item.title}
                  description={item.description}
                />
              ))
            ) : (
              <>
                <BeforeAfterSlider 
                  beforeImage="https://images.unsplash.com/photo-1593059025398-0f3d44fd52d2?q=80&w=2070&auto=format&fit=crop&blur=10"
                  afterImage="https://images.unsplash.com/photo-1593059025398-0f3d44fd52d2?q=80&w=2070&auto=format&fit=crop"
                  title="زراعة الأسنان الفورية"
                  description="تعويض الأسنان المفقودة بنتائج طبيعية تماماً وقوة مضاعفة."
                />
                <BeforeAfterSlider 
                  beforeImage="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop&sepia=50"
                  afterImage="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop"
                  title="جراحة تجميل الفكين"
                  description="تصحيح انحراف الفكين وتحسين مظهر الوجه الوظيفي والجمالي."
                />
                <BeforeAfterSlider 
                  beforeImage="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop&brightness=50"
                  afterImage="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop"
                  title="ترميم كسور الوجه"
                  description="إعادة بناء عظام الوجه بعد الحوادث لاستعادة المظهر الطبيعي."
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Stats */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-primary-400 mb-2">+20</div>
              <div className="text-slate-400 font-medium">عاماً من الخبرة</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-primary-400 mb-2">+5k</div>
              <div className="text-slate-400 font-medium">عملية ناجحة</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-primary-400 mb-2">1</div>
              <div className="text-slate-400 font-medium">مركز متخصص</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-primary-400 mb-2">4.8</div>
              <div className="text-slate-400 font-medium">تقييم المرضى</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">آراء مرضانا</h2>
            <p className="text-slate-600 text-lg">تجارب حقيقية لمرضى استعادوا ابتسامتهم وثقتهم في مركزنا.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="font-bold text-slate-900">- {testimonial.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-600" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598256989800-fea5ce5146f2?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">هل تحتاج إلى استشارة جراحية؟</h2>
          <p className="text-primary-100 text-xl mb-10">احجز موعدك الآن مع الدكتور صالح الرداعي للحصول على تشخيص دقيق وخطة علاج متكاملة.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/book" className="bg-white text-primary-600 px-8 py-4 rounded-full text-center font-bold transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 text-lg flex items-center justify-center gap-2 group">
              احجز موعدك الآن <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
