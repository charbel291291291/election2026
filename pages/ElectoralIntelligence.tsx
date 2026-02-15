
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
    Scale, 
    Calendar, 
    Calculator, 
    MessageSquareText, 
    DollarSign, 
    AlertTriangle,
    CheckCircle,
    Clock,
    BookOpen,
    Send
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_COMPLIANCE_RULES } from '../constants';
import { askLegalAI } from '../services/geminiService';

const ElectoralIntelligence: React.FC = () => {
  const { deadlines, financeRecords, toggleDeadlineStatus, addFinancialRecord } = useStore();
  const [activeTab, setActiveTab] = useState<'compliance' | 'deadlines' | 'simulator' | 'legal_ai'>('compliance');

  // Simulator State
  const [simParams, setSimParams] = useState({ seats: 5, totalVotes: 50000, lists: [{name: 'اللائحة A', votes: 20000}, {name: 'اللائحة B', votes: 15000}, {name: 'اللائحة C', votes: 8000}] });
  const [simResult, setSimResult] = useState<any>(null);

  // Legal AI State
  const [legalQuery, setLegalQuery] = useState('');
  const [legalAnswer, setLegalAnswer] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Finance State
  const [newExpense, setNewExpense] = useState({ category: 'advertising', amount: 0, description: '' });

  // Calculate Finance
  const totalSpent = financeRecords.reduce((sum, r) => sum + r.amount_usd, 0);
  const spendingCeiling = 150000; // Mock fixed ceiling
  const spendingPercentage = (totalSpent / spendingCeiling) * 100;

  // Functions
  const handleSimulateSeats = () => {
      // Hare Quota Calculation
      const quota = simParams.totalVotes / simParams.seats;
      let remainingSeats = simParams.seats;
      let results = simParams.lists.map(list => {
          const initialSeats = Math.floor(list.votes / quota);
          const remainder = list.votes % quota;
          remainingSeats -= initialSeats;
          return { ...list, seats: initialSeats, remainder };
      });

      // Sort by remainder to distribute remaining seats
      results.sort((a, b) => b.remainder - a.remainder);
      
      for(let i=0; i<remainingSeats; i++) {
          if (i < results.length) {
              results[i].seats += 1;
          }
      }
      
      setSimResult({ quota, results });
  };

  const handleAskLegal = async () => {
      if(!legalQuery) return;
      setLoadingAI(true);
      const answer = await askLegalAI(legalQuery);
      setLegalAnswer(answer || "عذراً، لم أتمكن من العثور على إجابة.");
      setLoadingAI(false);
  };

  const handleAddExpense = () => {
      if(newExpense.amount <= 0) return;
      addFinancialRecord({
          id: `fin-${Date.now()}`,
          organization_id: 'org-1',
          category: newExpense.category as any,
          amount_usd: newExpense.amount,
          date: new Date().toISOString().split('T')[0],
          description: newExpense.description,
          compliant: true
      });
      setNewExpense({ category: 'advertising', amount: 0, description: '' });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold flex items-center gap-2">
             <Scale className="text-purple-500" /> الذكاء الانتخابي والقانوني
           </h1>
           <p className="text-slate-400">إدارة الالتزام بالقانون ٤٤/٢٠١٧، المهل، والشفافية المالية.</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg overflow-x-auto">
            <button onClick={() => setActiveTab('compliance')} className={`px-4 py-2 rounded transition-colors whitespace-nowrap ${activeTab === 'compliance' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>الالتزام المالي</button>
            <button onClick={() => setActiveTab('deadlines')} className={`px-4 py-2 rounded transition-colors whitespace-nowrap ${activeTab === 'deadlines' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>المهل القانونية</button>
            <button onClick={() => setActiveTab('simulator')} className={`px-4 py-2 rounded transition-colors whitespace-nowrap ${activeTab === 'simulator' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>محاكي المقاعد</button>
            <button onClick={() => setActiveTab('legal_ai')} className={`px-4 py-2 rounded transition-colors whitespace-nowrap ${activeTab === 'legal_ai' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>المستشار القانوني</button>
        </div>
      </div>

      {/* Module 1 & 4: Compliance & Finance */}
      {activeTab === 'compliance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-right">
                      <DollarSign className="text-emerald-400"/> مراقبة سقف الإنفاق
                  </h3>
                  
                  <div className="relative pt-4 pb-8">
                      <div className="flex justify-between text-sm text-slate-400 mb-2">
                          <span>المصروف: ${totalSpent.toLocaleString()}</span>
                          <span>السقف: ${spendingCeiling.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                          <div 
                             className={`h-full rounded-full transition-all duration-1000 ${spendingPercentage > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                             style={{ width: `${Math.min(spendingPercentage, 100)}%` }}
                          ></div>
                      </div>
                      {spendingPercentage > 90 && (
                          <div className="mt-2 text-red-400 text-sm flex items-center gap-1 justify-end">
                              <AlertTriangle size={14} /> تحذير: اقتربت من السقف الانتخابي!
                          </div>
                      )}
                  </div>

                  <div className="space-y-4 border-t border-slate-700 pt-4">
                      <h4 className="text-sm font-bold text-slate-300 text-right">تسجيل نفقات جديدة</h4>
                      <div className="grid grid-cols-2 gap-2">
                          <select 
                            value={newExpense.category}
                            onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                            className="bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white"
                          >
                              <option value="advertising">إعلان ودعاية</option>
                              <option value="logistics">لوجستيات ومكاتب</option>
                              <option value="events">مهرجانات</option>
                              <option value="personnel">مخصصات مندوبين</option>
                          </select>
                          <input 
                            type="number"
                            placeholder="المبلغ ($)"
                            value={newExpense.amount}
                            onChange={e => setNewExpense({...newExpense, amount: parseInt(e.target.value)})}
                            className="bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white"
                          />
                      </div>
                      <input 
                         placeholder="الوصف (مثال: طباعة منشورات)"
                         value={newExpense.description}
                         onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                         className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white"
                      />
                      <button onClick={handleAddExpense} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded p-2 text-sm font-bold">
                          تسجيل النفقة
                      </button>
                  </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-right">
                      <BookOpen className="text-blue-400"/> قواعد الامتثال (Compliance)
                  </h3>
                  <div className="space-y-3">
                      {MOCK_COMPLIANCE_RULES.map(rule => (
                          <div key={rule.id} className="bg-slate-900/50 p-3 rounded border border-slate-700 text-right">
                              <div className="flex justify-between items-start mb-1">
                                  <span className={`text-xs px-2 py-0.5 rounded border ${
                                      rule.type === 'prohibition' ? 'bg-red-900/20 border-red-800 text-red-400' : 
                                      'bg-blue-900/20 border-blue-800 text-blue-400'
                                  }`}>
                                      {rule.type === 'prohibition' ? 'محظور' : 'قاعدة'}
                                  </span>
                                  <h4 className="font-bold text-sm text-white">{rule.rule_text}</h4>
                              </div>
                              <p className="text-slate-400 text-xs">{rule.details}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Module 2: Deadline Tracker */}
      {activeTab === 'deadlines' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
               <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-right">
                  <Calendar className="text-orange-400"/> الجدول الزمني للانتخابات
               </h3>
               <div className="space-y-6 relative before:absolute before:inset-0 before:mr-6 before:w-0.5 before:bg-slate-700">
                   {deadlines.map((deadline, idx) => (
                       <div key={deadline.id} className="relative flex items-start gap-4 mr-2">
                           <div className={`absolute top-0 right-0 -mr-[21px] w-4 h-4 rounded-full border-2 ${
                               deadline.status === 'completed' ? 'bg-emerald-500 border-emerald-500' :
                               deadline.status === 'overdue' ? 'bg-red-500 border-red-500' :
                               'bg-slate-900 border-slate-500'
                           }`}></div>
                           
                           <div className="flex-1 bg-slate-900 border border-slate-700 p-4 rounded-lg hover:border-slate-500 transition-colors text-right">
                               <div className="flex justify-between items-start mb-2">
                                   <button 
                                     onClick={() => toggleDeadlineStatus(deadline.id)}
                                     className={`text-xs flex items-center gap-1 px-2 py-1 rounded border ${
                                         deadline.status === 'completed' ? 'text-emerald-400 border-emerald-800 bg-emerald-900/20' : 'text-slate-400 border-slate-600'
                                     }`}
                                   >
                                       {deadline.status === 'completed' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                                       {deadline.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                                   </button>
                                   <div>
                                       <h4 className="font-bold text-white">{deadline.title}</h4>
                                       <span className="text-xs text-orange-400 block mt-1" dir="ltr">{deadline.due_date}</span>
                                   </div>
                               </div>
                               <p className="text-slate-400 text-sm">{deadline.description}</p>
                               {deadline.is_urgent && deadline.status !== 'completed' && (
                                   <div className="mt-2 text-xs text-red-400 bg-red-900/10 p-1 rounded inline-block">
                                       ⚠️ موعد حاسم - لا يقبل التمديد
                                   </div>
                               )}
                           </div>
                       </div>
                   ))}
               </div>
          </div>
      )}

      {/* Module 3: Simulator */}
      {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-right">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 justify-end">
                      إعدادات المحاكاة (الحاصل والكسور) <Calculator className="text-purple-400"/>
                  </h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-sm text-slate-400">عدد المقاعد في الدائرة</label>
                          <input 
                            type="number"
                            value={simParams.seats}
                            onChange={e => setSimParams({...simParams, seats: parseInt(e.target.value)})}
                            className="w-full mt-1 bg-slate-900 border border-slate-600 rounded p-2 text-white"
                          />
                      </div>
                      <div>
                          <label className="text-sm text-slate-400">عدد المقترعين الإجمالي</label>
                          <input 
                            type="number"
                            value={simParams.totalVotes}
                            onChange={e => setSimParams({...simParams, totalVotes: parseInt(e.target.value)})}
                            className="w-full mt-1 bg-slate-900 border border-slate-600 rounded p-2 text-white"
                          />
                      </div>
                      
                      <div className="border-t border-slate-700 pt-4">
                          <label className="text-sm text-slate-300 block mb-2">أصوات اللوائح</label>
                          {simParams.lists.map((list, idx) => (
                              <div key={idx} className="flex gap-2 mb-2">
                                  <input 
                                     value={list.votes}
                                     onChange={e => {
                                         const newLists = [...simParams.lists];
                                         newLists[idx].votes = parseInt(e.target.value);
                                         setSimParams({...simParams, lists: newLists});
                                     }}
                                     type="number"
                                     className="w-24 bg-slate-900 border border-slate-600 rounded p-2 text-white text-center"
                                  />
                                  <input 
                                     value={list.name}
                                     readOnly
                                     className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white text-right"
                                  />
                              </div>
                          ))}
                      </div>

                      <button onClick={handleSimulateSeats} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                          <Calculator size={18} /> احتساب توزيع المقاعد
                      </button>
                  </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-right">
                  <h3 className="font-semibold text-lg mb-4 text-slate-200">النتائج (توزيع المقاعد)</h3>
                  
                  {simResult ? (
                      <div className="space-y-6">
                          <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg text-center">
                              <p className="text-slate-400 text-sm">الحاصل الانتخابي (Quota)</p>
                              <p className="text-3xl font-bold text-white">{Math.floor(simResult.quota).toLocaleString()}</p>
                              <p className="text-xs text-slate-500">أصوات / مقعد</p>
                          </div>

                          <div className="space-y-3">
                              {simResult.results.map((res: any, idx: number) => (
                                  <div key={idx} className="bg-slate-900 p-4 rounded-lg flex justify-between items-center border-r-4 border-purple-500">
                                       <div className="text-center">
                                           <span className="block text-2xl font-bold text-white">{res.seats}</span>
                                           <span className="text-xs text-slate-500">مقاعد</span>
                                       </div>
                                       <div>
                                           <h4 className="font-bold text-white">{res.name}</h4>
                                           <div className="text-xs text-slate-400 mt-1 flex gap-3">
                                               <span>الكسر: {Math.floor(res.remainder)}</span>
                                               <span>الأصوات: {res.votes.toLocaleString()}</span>
                                           </div>
                                       </div>
                                  </div>
                              ))}
                          </div>
                          
                          <p className="text-xs text-slate-500 mt-4 text-center px-4">
                              ملاحظة: هذه المحاكاة تعتمد طريقة الكسر الأكبر (Highest Remainder) وفق القانون اللبناني النسبي.
                          </p>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                          <Calculator size={48} className="mb-4 opacity-50"/>
                          <p>أدخل البيانات واضغط احتساب</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Module 7: Legal AI */}
      {activeTab === 'legal_ai' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                       <Scale className="text-blue-400" />
                       <div>
                           <h3 className="font-bold text-white">المستشار القانوني الآلي</h3>
                           <p className="text-xs text-slate-400">مدرب على قانون الانتخاب ٤٤/٢٠١٧</p>
                       </div>
                  </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto bg-slate-900/50">
                   {legalAnswer ? (
                       <div className="flex flex-col gap-4">
                           <div className="self-end bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] text-right">
                               {legalQuery}
                           </div>
                           <div className="self-start bg-slate-800 text-slate-200 border border-slate-700 p-6 rounded-2xl rounded-tl-none max-w-[90%] text-right leading-relaxed whitespace-pre-wrap shadow-lg">
                               <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold text-sm">
                                   <BookOpen size={16}/> الاستشارة القانونية
                               </div>
                               {legalAnswer}
                           </div>
                       </div>
                   ) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                           <Scale size={64} className="mb-4" />
                           <p className="text-lg">اطرح سؤالاً قانونياً حول الانتخابات</p>
                           <p className="text-sm">مثال: "ما هو سقف الإنفاق المسموح؟"</p>
                       </div>
                   )}
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-700">
                  <div className="flex gap-2">
                      <button 
                         onClick={handleAskLegal}
                         disabled={loadingAI || !legalQuery}
                         className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg disabled:opacity-50"
                      >
                          {loadingAI ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> : <Send size={20} className="rotate-180" />}
                      </button>
                      <input 
                         value={legalQuery}
                         onChange={e => setLegalQuery(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && handleAskLegal()}
                         placeholder="اكتب سؤالك القانوني هنا..."
                         className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 text-white text-right outline-none focus:border-blue-500"
                      />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ElectoralIntelligence;
