import React from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

const Alerts: React.FC = () => {
  const { alerts, resolveAlert } = useStore();

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const translateSeverity = (sev: string) => {
      switch(sev) {
          case 'critical': return 'خطر جداً';
          case 'high': return 'مرتفع';
          case 'medium': return 'متوسط';
          default: return 'منخفض';
      }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 justify-end">
        مركز إدارة المخاطر والتنبيهات <ShieldAlert className="text-red-500" /> 
      </h1>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-700">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-6 flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-4 text-right ${alert.resolved ? 'opacity-50 grayscale' : ''}`}>
              <div className="flex items-start gap-4 flex-row-reverse">
                <div className={`p-3 rounded-full ${getSeverityColor(alert.severity)}`}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <span className="text-xs text-slate-500">{new Date(alert.created_at).toLocaleString('ar-LB')}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getSeverityColor(alert.severity)}`}>
                      {translateSeverity(alert.severity)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-white">{alert.alert_type.replace('_', ' ')}</h3>
                  <p className="text-slate-400">{alert.message}</p>
                </div>
              </div>

              {!alert.resolved && (
                <button 
                  onClick={() => resolveAlert(alert.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 transition-colors shrink-0"
                >
                  <CheckCircle size={18} /> تم المعالجة
                </button>
              )}
               {alert.resolved && (
                <div className="flex items-center gap-2 text-emerald-500 font-medium">
                   تم الحل <CheckCircle size={18} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;