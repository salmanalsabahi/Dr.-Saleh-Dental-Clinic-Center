import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const ai = GEMINI_KEY ? new GoogleGenAI({ apiKey: GEMINI_KEY }) : null;

export function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mapInfo, setMapInfo] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [workingHours, setWorkingHours] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMapInfo() {
      try {
        const settingsRef = doc(db, 'siteSettings', 'general');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setMapUrl(data.mapEmbedUrl || null);
          setWorkingHours(data.workingHours || null);
          setLocation(data.location || null);
          setPhone(data.phone || null);
        }

        if (ai) {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Provide the address and a brief description of the location for 'Dr. Saleh Al-Rada'i Center in Sana'a, Yemen'",
            config: {
              tools: [{ googleMaps: {} }],
            },
          });
          setMapInfo(response.text || "لا تتوفر معلومات الموقع حالياً.");
        } else {
          setMapInfo("لا تتوفر معلومات إضافية عن الموقع حالياً.");
        }
      } catch (error) {
        console.error("Maps error:", error);
        setMapInfo("حدث خطأ أثناء تحميل معلومات الموقع.");
      } finally {
        setMapLoading(false);
      }
    }
    fetchMapInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // 1. Save to Firestore directly from the client
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'new'
      });

      await addDoc(collection(db, 'notifications'), {
        message: `رسالة جديدة من ${formData.firstName} ${formData.lastName}`,
        link: '/admin/messages',
        isAdmin: true,
        read: false,
        createdAt: serverTimestamp(),
        type: 'contact'
      });

      // 2. Call the API to send the email notification
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('تم إرسال رسالتك بنجاح! سنتواصل معك في أقرب وقت ممكن.');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
        
        // Hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errorText = data.details ? `\nالتفاصيل: ${data.details}` : '';
        throw new Error((data.error || 'حدث خطأ أثناء إرسال الرسالة.') + errorText);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setErrorMessage(error.message || 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Info */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">موقعنا</h3>
            {mapLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {mapUrl && (
                  <div className="relative group">
                    {mapUrl.includes('google.com/maps/embed') ? (
                      <iframe 
                        src={mapUrl} 
                        width="100%" 
                        height="400" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        className="rounded-2xl shadow-inner bg-slate-100"
                      />
                    ) : (
                      <div className="bg-slate-100 rounded-2xl h-[300px] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200">
                        <MapPin className="w-12 h-12 text-slate-400 mb-4" />
                        <h4 className="font-bold text-slate-900 mb-2">موقع العيادة على الخريطة</h4>
                        <p className="text-sm text-slate-600 mb-6">انقر على الزر أدناه لعرض الموقع مباشرة على خرائط جوجل</p>
                        <a 
                          href={mapUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2"
                        >
                          فتح في خرائط جوجل
                        </a>
                      </div>
                    )}
                    
                    {mapUrl.includes('google.com/maps/embed') && (
                      <a 
                        href={mapUrl.replace('/embed', '/place')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                      >
                        <MapPin className="w-3 h-3" />
                        فتح في نافذة كبيرة
                      </a>
                    )}
                  </div>
                )}
                <div className="prose prose-slate max-w-none">
                  {mapInfo}
                  <div className="mt-6 space-y-3">
                    {location && (
                      <div className="flex items-center gap-3 text-slate-700">
                        <MapPin className="w-5 h-5 text-primary-600" />
                        <span>{location}</span>
                      </div>
                    )}
                    {phone && (
                      <div className="flex items-center gap-3 text-slate-700">
                        <Phone className="w-5 h-5 text-primary-600" />
                        <span>{phone}</span>
                      </div>
                    )}
                    {workingHours && (
                      <div className="flex items-center gap-3 text-slate-700">
                        <Clock className="w-5 h-5 text-primary-600" />
                        <span>ساعات العمل: {workingHours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">أرسل لنا رسالة</h3>
            
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-teal-50 text-teal-800 border border-teal-200 p-4 rounded-xl mb-6 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-teal-600" />
                </div>
                <p className="font-medium">{successMessage}</p>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-xl mb-6"
              >
                <p className="font-medium">{errorMessage}</p>
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الأول</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full p-3.5 rounded-xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 transition-colors" placeholder="أحمد" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">اسم العائلة</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full p-3.5 rounded-xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 transition-colors" placeholder="محمد" required />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3.5 rounded-xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 transition-colors text-right" dir="ltr" placeholder="ahmed@example.com" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3.5 rounded-xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 transition-colors text-right" dir="ltr" placeholder="0500000000" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الرسالة</label>
                <textarea rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full p-3.5 rounded-xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 transition-colors resize-none" placeholder="كيف يمكننا مساعدتك؟" required></textarea>
              </div>
              
              <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'} <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
