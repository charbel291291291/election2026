
import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import MapWidget from '../components/MapWidget';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';
import { TrendingDown, TrendingUp, AlertOctagon, Activity, BoxSelect, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_REGIONS } from '../constants';

const Dashboard: React.FC = () => {
  const { reports, alerts } = useStore();
  const activeAlerts = alerts.filter(a => !a.resolved);
  
  // Animation Counter Hook (Simple)
  const useCounter = (end: number, duration = 2000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const step = Math.ceil(end / (duration / 16));
      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);
      return () => clearInterval(timer);
    }, [end, duration]);
    return count;
  };

  const animatedAlerts = useCounter(activeAlerts.length);
  const animatedReports = useCounter(reports.length);

  const chartData = [
    { name: '07:00', efficiency: 5 },
    { name: '09:00', efficiency: 15 },
    { name: '11:00', efficiency: 28 },
    { name: '13:00', efficiency: 35 },
    { name: '15:00', efficiency: 42 },
    { name: '17:00', efficiency: 51 },
  ];

  const KPICard = ({ title, value, icon: Icon, trend, trendValue, color, delay }: any) => (
    <GlassCard delay={delay} className="flex flex-col justify-between h-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none blur-2xl" />
      
      <div className="flex justify-between items-start z-10">
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-black text-white mt-1 drop-shadow-lg font-sans">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${color} bg-opacity-20 border border-white/5 shadow-inner`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      
      <div className="z-10 flex items-center gap-1.5 text-xs font-medium">
        {trend === 'up' ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-rose-400" />}
        <span className={trend === 'up' ? "text-emerald-400" : "text-rose-400"}>{trendValue}</span>
        <span className="text-slate-500">مقارنة بالساعة الماضية</span>
      </div>
    </GlassCard>
  );

  return (
    <PageTransition>
      <div className="space-y-4 md:space-y-6 w-full max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <KPICard 
            title="تنبيهات نشطة" 
            value={animatedAlerts} 
            icon={AlertOctagon} 
            color="bg-red-500" 
            trend="up" 
            trendValue="+2"
            delay={0.1}
          />
          <KPICard 
            title="نسبة الاقتراع" 
            value="51%" 
            icon={BoxSelect} 
            color="bg-emerald-500" 
            trend="up" 
            trendValue="+5%"
            delay={0.2}
          />
          <KPICard 
            title="تقارير المندوبين" 
            value={animatedReports} 
            icon={Activity} 
            color="bg-blue-500" 
            trend="up" 
            trendValue="+12"
            delay={0.3}
          />
          <KPICard 
            title="نفقات لوجستية" 
            value="$42k" 
            icon={TrendingDown} 
            color="bg-amber-500" 
            trend="down" 
            trendValue="High"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <GlassCard className="lg:col-span-2 p-0 overflow-hidden border-0 w-full" delay={0.5}>
             <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg border border-white/10 text-xs text-white font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                LIVE OPERATIONS MAP
             </div>
             <MapWidget reports={reports} alerts={alerts} regions={MOCK_REGIONS} height="450px" />
          </GlassCard>

          <GlassCard delay={0.6} className="flex flex-col h-[400px] md:h-[450px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-red-400" /> الأخبار العاجلة
              </h2>
              <button className="text-xs text-slate-400 hover:text-white transition-colors">عرض الكل</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {activeAlerts.map((alert, i) => (
                <div key={alert.id} className="group relative pl-4 pr-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-default">
                  <div className={`absolute right-0 top-3 bottom-3 w-1 rounded-l-full ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-400'}`} />
                  <div className="flex justify-between items-start mb-1">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                        {alert.alert_type.replace('_', ' ')}
                     </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{alert.message}</p>
                  <ArrowUpRight size={14} className="absolute bottom-2 left-2 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard delay={0.7} className="h-64 md:h-80 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">مسار نسبة الاقتراع</h2>
            <select className="bg-black/30 border border-white/10 rounded-lg text-xs text-white px-3 py-1 outline-none">
              <option>اليوم</option>
              <option>الأسبوع</option>
            </select>
          </div>
          <div className="h-full w-full -ml-4" dir="ltr">
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEff)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
