import React, { useState } from 'react';
import { Cpu, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import { runScenarioSimulation } from '../services/geminiService';

const Simulation: React.FC = () => {
  const [params, setParams] = useState({
    budget: 50000,
    votes: 12000,
    threshold: 11.5, // Hasil example
    district: 'mount_lebanon_1',
    alliances: 'independent'
  });
  
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    
    // Simulate API delay + Processing
    const simulationResult = await runScenarioSimulation(params);
    
    setResult(simulationResult || "فشلت المحاكاة.");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 justify-end">
        <div>
          <h1 className="text-2xl font-bold text-right">محاكاة الحاصل الانتخابي</h1>
          <p className="text-slate-400 text-right">مدعوم بنموذج Gemini 3 Pro (Thinking Model)</p>
        </div>
        <div className="p-3 bg-purple-600 rounded-lg text-white">
          <Cpu size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-right">
          <h2 className="text-lg font-semibold mb-6">المعطيات والفرضيات</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">الميزانية المرصودة ($)</label>
              <input 
                type="number" 
                value={params.budget}
                onChange={e => setParams({...params, budget: parseInt(e.target.value)})}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">الأصوات التفضيلية المتوقعة</label>
              <input 
                type="number" 
                value={params.votes}
                onChange={e => setParams({...params, votes: parseInt(e.target.value)})}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
              />
            </div>

             <div>
              <label className="block text-sm text-slate-400 mb-1">الحاصل الانتخابي المتوقع (%)</label>
              <input 
                type="number" 
                value={params.threshold}
                onChange={e => setParams({...params, threshold: parseFloat(e.target.value)})}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">الدائرة الانتخابية</label>
              <select 
                 value={params.district}
                 onChange={e => setParams({...params, district: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
              >
                <option value="mount_lebanon_1">جبل لبنان ١ (كسروان - جبيل)</option>
                <option value="beirut_1">بيروت ١ (الأشرفية)</option>
                <option value="north_3">الشمال ٣ (بشري - زغرتا - البترون - الكورة)</option>
                <option value="south_1">الجنوب ١ (صيدا - جزين)</option>
              </select>
            </div>

             <div>
              <label className="block text-sm text-slate-400 mb-1">طبيعة التحالفات</label>
              <select 
                 value={params.alliances}
                 onChange={e => setParams({...params, alliances: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
              >
                <option value="independent">لائحة مستقلة</option>
                <option value="coalition">ائتلاف حزبي</option>
                <option value="opposition">معارضة موحدة</option>
              </select>
            </div>

            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>جاري الحساب...</>
              ) : (
                <>
                  <Play size={18} /> بدء المحاكاة
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 min-h-[400px] text-right">
           <h2 className="text-lg font-semibold mb-6">النتائج المتوقعة (السيناريو)</h2>
           
           {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse">
               <Cpu size={48} className="mb-4 text-purple-500" />
               <p>جاري تحليل الكسور والمقاعد المتبقية...</p>
               <p className="text-xs">Token budget allocated: 2048</p>
             </div>
           ) : result ? (
             <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-sans">
                  {result}
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-64 text-slate-500">
               <AlertCircle size={48} className="mb-4" />
               <p>أدخل الفرضيات واضغط على بدء المحاكاة لرؤية النتائج.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Simulation;