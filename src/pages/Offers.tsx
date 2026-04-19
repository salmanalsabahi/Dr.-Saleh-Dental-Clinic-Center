import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const q = query(collection(db, 'offers'), where('active', '==', true));
    const unsubscribeOffers = onSnapshot(q, (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeOffers();
    };
  }, []);

  const handleBookOffer = async (offer: any) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setBookingLoading(offer.id);
    setMessage(null);

    try {
      // Fetch user profile to get phone number
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        userName: user.displayName || 'عميل',
        userEmail: user.email,
        userPhone: userData?.phone || '',
        offerId: offer.id,
        offerTitle: offer.title,
        status: 'pending',
        createdAt: serverTimestamp(),
        type: 'offer'
      });

      // Create notification for admin
      await addDoc(collection(db, 'notifications'), {
        isAdmin: true,
        message: `حجز جديد للعرض: ${offer.title} من قبل ${user.displayName || user.email}`,
        type: 'info',
        read: false,
        createdAt: serverTimestamp(),
        link: '/admin/offer-bookings'
      });

      setMessage({ type: 'success', text: 'تم إرسال طلب الحجز بنجاح! سيتم التواصل معك قريباً.' });
      
      // Auto hide message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error("Error booking offer:", error);
      setMessage({ type: 'error', text: 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.' });
    } finally {
      setBookingLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 text-center">عروضنا المميزة</h1>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          استفد من أقوى العروض الحصرية على جراحات الوجه والفكين وزراعة الأسنان. احجز عرضك الآن وسنتواصل معك لتأكيد الموعد.
        </p>

        {message && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map(offer => (
            <div key={offer.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
              {offer.imageUrl && (
                <div className="relative h-56 overflow-hidden">
                  <img src={offer.imageUrl || undefined} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 end-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {offer.discount}% خصم
                  </div>
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-xl mb-2 text-slate-900">{offer.title}</h3>
                <p className="text-slate-600 mb-6 flex-1 text-sm leading-relaxed">{offer.description}</p>
                
                <button
                  onClick={() => handleBookOffer(offer)}
                  disabled={bookingLoading === offer.id}
                  className="w-full bg-slate-900 hover:bg-primary-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading === offer.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'احجز العرض الآن'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
