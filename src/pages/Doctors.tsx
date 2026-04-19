import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Clock, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const defaultDoctors = [
  {
    id: 'dr-saleh-alradai',
    name: 'د. صالح الرداعي',
    role: 'استشاري جراحة الفم والوجه والفكين',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
    experience: '+20 سنة',
    rating: 5.0,
    reviews: 850,
    bio: 'الدكتور صالح الرداعي هو استشاري بارز في جراحة الفم والوجه والفكين في صنعاء. يشتهر بخبرته العميقة في استئصال أورام الفم، زراعة الأسنان، وجراحات التجميل الفكية المعقدة.',
    education: 'دكتوراه في جراحة الفم والوجه والفكين',
    specialties: ['جراحة الأورام', 'زراعة الأسنان', 'تجميل الفكين']
  }
];

export function Doctors() {
  const [doctors, setDoctors] = useState<any[]>(defaultDoctors);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'doctors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching doctors:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }
  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6">تعرف على فريقنا الخبير</h1>
          <p className="text-lg text-slate-600">
            يكرس المتخصصون ذوو المهارات العالية لدينا جهودهم لتزويدك بأفضل رعاية ممكنة في بيئة مريحة ومرحبة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {doctors.map((doctor, index) => (
            <motion.div 
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col sm:flex-row group"
            >
              <div className="sm:w-2/5 h-64 sm:h-auto relative overflow-hidden">
                <img 
                  src={doctor.image || undefined} 
                  alt={doctor.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent sm:hidden" />
              </div>
              
              <div className="p-6 sm:p-8 sm:w-3/5 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{doctor.name}</h3>
                  <p className="text-primary-600 font-medium text-sm">{doctor.role}</p>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-700">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="font-bold">{doctor.rating}</span>
                    <span className="text-slate-400">({doctor.reviews})</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <div className="flex items-center gap-1 text-slate-700">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{doctor.experience}</span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                  {doctor.bio}
                </p>

                <div className="mt-auto">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {doctor.specialties.slice(0, 2).map((spec, i) => (
                      <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    to={`/book?doctor=${encodeURIComponent(doctor.name)}`}
                    className="flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-primary-50 text-slate-900 hover:text-primary-700 border border-slate-200 hover:border-primary-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Calendar className="w-4 h-4" /> احجز مع {doctor.name.split(' ')[1]}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
