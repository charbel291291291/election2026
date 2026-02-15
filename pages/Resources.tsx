import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useStore } from '../store/useStore';

const Resources: React.FC = () => {
  const { resources } = useStore();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const costData = resources.map(r => ({
    name: r.resource_type,
    cost: r.cost
  }));

  const effortImpactData = resources.map(r => ({
    name: r.resource_type,
    effort: r.effort_units,
    impact: r.result_metric
  }));

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold mb-6 text-right">إدارة الموارد والميزانية الانتخابية</h1>
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-slate-200 text-right">توزيع النفقات (USD)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="cost"
                    label
                  >
                    {costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}/>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-slate-200 text-right">فعالية الموارد مقابل التكلفة</h3>
             <div className="h-[300px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={effortImpactData}>
                  <XAxis dataKey="name" stroke="#9ca3af"/>
                  <YAxis stroke="#9ca3af"/>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}/>
                  <Legend />
                  <Bar dataKey="effort" fill="#8884d8" name="الكمية/الساعات" />
                  <Bar dataKey="impact" fill="#82ca9d" name="مؤشر التأثير" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
       </div>

       <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
         <table className="w-full text-right text-sm text-slate-300">
           <thead className="bg-slate-900 text-slate-400 uppercase font-bold">
             <tr>
               <th className="p-4">نوع المورد</th>
               <th className="p-4">التكلفة ($)</th>
               <th className="p-4">الكمية / الوحدات</th>
               <th className="p-4">النتيجة</th>
               <th className="p-4">حالة العائد</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-700">
             {resources.map(r => (
               <tr key={r.id} className="hover:bg-slate-700/50">
                 <td className="p-4 font-medium text-white">{r.resource_type}</td>
                 <td className="p-4">${r.cost.toLocaleString()}</td>
                 <td className="p-4">{r.effort_units}</td>
                 <td className="p-4">{r.result_metric}/100</td>
                 <td className="p-4">
                   <span className={`px-2 py-1 rounded text-xs font-bold ${
                     r.result_metric > 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                   }`}>
                     {r.result_metric > 80 ? 'فعّال جداً' : 'يحتاج مراجعة'}
                   </span>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );
};

export default Resources;