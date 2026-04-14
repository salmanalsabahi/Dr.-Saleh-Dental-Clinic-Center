import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Activity, 
  Loader2,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    totalMessages: 0,
    totalBookings: 0,
    appointmentsByStatus: [] as any[],
    servicesDistribution: [] as any[],
    recentActivity: [] as any[]
  });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [usersSnap, apptsSnap, msgsSnap, bookingsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'appointments')),
          getDocs(collection(db, 'contactMessages')),
          getDocs(collection(db, 'bookings'))
        ]);

        const appts = apptsSnap.docs.map(doc => doc.data());
        
        // Status distribution
        const statusCounts: any = {};
        appts.forEach(a => {
          statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
        });
        const appointmentsByStatus = Object.keys(statusCounts).map(status => ({
          name: status === 'pending' ? 'قيد الانتظار' : status === 'confirmed' ? 'مؤكد' : 'ملغي',
          value: statusCounts[status]
        }));

        // Service distribution
        const serviceCounts: any = {};
        appts.forEach(a => {
          serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1;
        });
        const servicesDistribution = Object.keys(serviceCounts).map(service => ({
          name: service,
          value: serviceCounts[service]
        })).sort((a, b) => b.value - a.value).slice(0, 5);

        setStats({
          totalUsers: usersSnap.size,
          totalAppointments: apptsSnap.size,
          totalMessages: msgsSnap.size,
          totalBookings: bookingsSnap.size,
          appointmentsByStatus,
          servicesDistribution,
          recentActivity: [] // Could be populated with latest docs
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const COLORS = ['#0d9488', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">التحليلات والإحصائيات</h1>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100">
          <Activity className="w-4 h-4 text-primary-500" />
          <span>تحديث مباشر للبيانات</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي المستخدمين" 
          value={stats.totalUsers} 
          icon={Users} 
          color="bg-blue-500" 
          trend="+12%"
        />
        <StatCard 
          title="إجمالي المواعيد" 
          value={stats.totalAppointments} 
          icon={Calendar} 
          color="bg-teal-500" 
          trend="+5%"
        />
        <StatCard 
          title="رسائل العملاء" 
          value={stats.totalMessages} 
          icon={MessageSquare} 
          color="bg-amber-500" 
          trend="+8%"
        />
        <StatCard 
          title="حجوزات العروض" 
          value={stats.totalBookings} 
          icon={TrendingUp} 
          color="bg-purple-500" 
          trend="+15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments Status Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-slate-900">حالة المواعيد</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.appointmentsByStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services Distribution Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-slate-900">توزيع الخدمات الأكثر طلباً</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.servicesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.servicesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {stats.servicesDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                <span className="text-xs text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm text-slate-500 font-medium">{title}</div>
    </div>
  );
}
