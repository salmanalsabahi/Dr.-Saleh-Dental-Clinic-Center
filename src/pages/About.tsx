import { motion } from 'motion/react';
import { Shield, Target, Heart, Award, CheckCircle2, GraduationCap, Users, Clock } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export function About() {
  const { settings } = useSiteSettings();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="pt-24 pb-0 bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop" 
            alt="Clinic Background" 
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity scale-105 transform hover:scale-100 transition-transform duration-10000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary-500/20 text-primary-300 text-sm font-semibold tracking-wide mb-6 border border-primary-500/30 backdrop-blur-sm">
              من نحن
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg leading-tight">
              {settings?.clinicName || 'مركز الدكتور صالح الرداعي'}
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-light">
              الوجهة الأولى في اليمن لجراحة الفم والوجه والفكين وزراعة الأسنان، حيث نجمع بين الخبرة العميقة والتكنولوجيا المتقدمة.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Doctor Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <motion.div variants={itemVariants} className="lg:col-span-5 relative h-96 lg:h-auto overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop" 
                alt="Dr. Saleh" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent lg:hidden" />
              <div className="absolute bottom-8 right-8 left-8 lg:hidden">
                <h2 className="text-3xl font-bold text-white mb-2">د. صالح الرداعي</h2>
                <p className="text-primary-300 font-medium">استشاري جراحة الفم والوجه والفكين</p>
              </div>
            </motion.div>
            
            <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <motion.div variants={itemVariants} className="hidden lg:block mb-8">
                <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-3">د. صالح الرداعي</h2>
                <p className="text-xl text-primary-600 font-medium">استشاري جراحة الفم والوجه والفكين</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-6 text-slate-600 text-lg leading-relaxed mb-10">
                <p>
                  يُعد الدكتور صالح الرداعي من أبرز الاستشاريين في جراحة الفم والوجه والفكين في اليمن، حيث يمتلك خبرة واسعة تمتد لسنوات في التعامل مع الحالات الجراحية المعقدة والدقيقة.
                </p>
                <p>
                  كرس الدكتور صالح مسيرته المهنية لتقديم أعلى مستويات الرعاية الطبية، مع التركيز الخاص على استئصال أورام الفم، زراعة الأسنان المتقدمة، جراحات التجميل الفكية، وعلاج كسور الوجه والفكين الناتجة عن الحوادث.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 text-lg">شهادات عليا</h4>
                    <p className="text-slate-500 leading-relaxed">حاصل على أعلى الدرجات العلمية في تخصصه.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 text-lg">خبرة واسعة</h4>
                    <p className="text-slate-500 leading-relaxed">آلاف العمليات الجراحية الناجحة والمعقدة.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-600 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-x-reverse divide-primary-500/50">
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">+20</div>
              <div className="text-primary-100 font-medium">عاماً من الخبرة</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">+5000</div>
              <div className="text-primary-100 font-medium">عملية جراحية</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">+10k</div>
              <div className="text-primary-100 font-medium">مريض سعيد</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">100%</div>
              <div className="text-primary-100 font-medium">التزام بالجودة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-6">لماذا تختار مركزنا؟</h2>
            <p className="text-lg text-slate-600">نحن نلتزم بتقديم رعاية صحية استثنائية مبنية على أسس علمية وأخلاقية راسخة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: 'الرعاية الرحيمة', desc: 'نتعامل مع كل مريض بتعاطف، ونعطي الأولوية لراحتهم وتخفيف آلامهم قبل كل شيء.' },
              { icon: Target, title: 'التميز والدقة', desc: 'لا نساوم أبداً على الجودة. نستخدم أحدث التقنيات ونسعى جاهدين لتحقيق الكمال في كل إجراء جراحي.' },
              { icon: Shield, title: 'النزاهة والشفافية', desc: 'أسعار شفافة، تشخيصات صادقة، وعلاجات تصب في مصلحتك حقاً دون أي تكاليف مخفية.' }
            ].map((value, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm text-primary-600 flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

