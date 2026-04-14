import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Mail, Facebook, Instagram, Twitter, ArrowLeft, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-display font-bold text-xl">
                  R
                </div>
              )}
              <span className="font-display font-bold text-xl tracking-tight text-white">
                {settings?.clinicName || (
                  <>مركز الدكتور <span className="text-primary-500">صالح الرداعي</span></>
                )}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              مركز متخصص في جراحة الفم والوجه والفكين وزراعة الأسنان، نقدم رعاية جراحية متقدمة بخبرة استشارية واسعة في صنعاء.
            </p>
            <div className="flex items-center gap-4">
              {settings?.socialMedia.facebook && (
                <a href={settings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.socialMedia.instagram && (
                <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.socialMedia.twitter && (
                <a href={settings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {settings?.socialMedia.whatsapp && (
                <a href={`https://wa.me/${settings.socialMedia.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-6">روابط سريعة</h3>
            <ul className="space-y-4">
              {[
                { name: 'الرئيسية', path: '/' },
                { name: 'من نحن', path: '/about' },
                { name: 'التخصصات', path: '/services' },
                { name: 'اتصل بنا', path: '/contact' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-sm hover:text-primary-400 transition-colors flex items-center gap-2 group">
                    <ArrowLeft className="w-3 h-3 opacity-0 -me-5 group-hover:opacity-100 group-hover:me-0 transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-6">تخصصاتنا</h3>
            <ul className="space-y-4">
              {['جراحة الوجه والفكين', 'زراعة الأسنان', 'استئصال الأورام الفموية', 'تجميل الفكين', 'علاج كسور الوجه'].map((item) => (
                <li key={item}>
                  <Link to="/services" className="text-sm hover:text-primary-400 transition-colors flex items-center gap-2 group">
                    <ArrowLeft className="w-3 h-3 opacity-0 -me-5 group-hover:opacity-100 group-hover:me-0 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-6">اتصل بنا</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <span>صنعاء، اليمن<br />مركز الدكتور صالح الرداعي</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                <span dir="ltr">+967 123 4567</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                <span>info@dr-saleh-radaei.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white mb-1">ساعات العمل:</span>
                  <span className="block text-slate-400">السبت - الخميس: 9:00 ص - 8:00 م</span>
                  <span className="block text-slate-400">الجمعة: مغلق (للطوارئ فقط)</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} مركز الدكتور صالح الرداعي. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
            <Link to="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
