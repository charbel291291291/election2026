
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  MessageCircle, 
  Send, 
  Activity, 
  Terminal, 
  Smartphone,
  Plus,
  RefreshCw,
  CheckCircle2,
  FileText,
  Trash2,
  Check,
  Wifi
} from 'lucide-react';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WhatsAppCommandCenter: React.FC = () => {
  const { whatsappLogs, whatsappAccounts, whatsappPolls, whatsappTemplates, processIncomingWhatsApp, createPoll, addWhatsAppTemplate, deleteWhatsAppTemplate } = useStore();
  const [activeTab, setActiveTab] = useState<'activity' | 'broadcast' | 'polls' | 'templates'>('activity');
  
  // Simulator State
  const [simSender, setSimSender] = useState('+961 70 123456');
  const [simMessage, setSimMessage] = useState('REPORT Beirut 35 2');
  const [simResponse, setSimResponse] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // Poll State
  const [pollTitle, setPollTitle] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Template State
  const [tplName, setTplName] = useState('');
  const [tplContent, setTplContent] = useState('');

  const handleSimulate = async () => {
      setIsSimulating(true);
      const res = await processIncomingWhatsApp(simSender, simMessage);
      setSimResponse(res);
      setIsSimulating(false);
  };

  const handleCreatePoll = () => {
      if(!pollTitle || pollOptions.some(o => !o)) return;
      
      const results: {[key: string]: number} = {};
      pollOptions.forEach(o => results[o] = 0);

      createPoll({
          id: `wp-${Date.now()}`,
          organization_id: 'org-1',
          title: pollTitle,
          options: pollOptions,
          active: true,
          total_responses: 0,
          results: results,
          created_at: new Date().toISOString()
      });

      alert('تم إنشاء الاستطلاع وإرساله للقوائم البريدية.');
      setPollTitle('');
      setPollOptions(['', '']);
      setActiveTab('polls');
  };

  const handleAddTemplate = () => {
      if(!tplName || !tplContent) return;

      addWhatsAppTemplate({
          id: `tpl-${Date.now()}`,
          organization_id: 'org-1',
          name: tplName,
          content: tplContent,
          language: 'ar',
          status: 'approved', // Simulating instant approval
          created_at: new Date().toISOString()
      });

      setTplName('');
      setTplContent('');
      alert('تم حفظ القالب بنجاح.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Panel: Main Content */}
      <div className="lg:col-span-2 flex flex-col space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
           <div className="flex items-center gap-3">
             <div className="p-3 bg-green-600 rounded-lg text-white shadow-lg shadow-green-900/50">
                <MessageCircle size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-bold">CommandLine WA</h1>
                <p className="text-slate-400 text-sm">نظام الأوامر والردود الذكية عبر واتساب</p>
             </div>
           </div>
           
           <div className="flex gap-2 bg-slate-800 p-1 rounded-lg overflow-x-auto max-w-full">
              <button 
                onClick={() => setActiveTab('activity')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${activeTab === 'activity' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                سجل النشاط
              </button>
              <button 
                onClick={() => setActiveTab('broadcast')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${activeTab === 'broadcast' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                إرسال وتعميم
              </button>
               <button 
                onClick={() => setActiveTab('polls')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${activeTab === 'polls' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                الاستطلاعات
              </button>
               <button 
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${activeTab === 'templates' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                إدارة القوالب
              </button>
           </div>
        </div>

        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl flex flex-col">
            {/* Tab: Activity Log */}
            {activeTab === 'activity' && (
                <div className="flex-col h-full flex">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-200">سجل الأوامر الواردة (Real-time)</h3>
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-900/50">
                            <Activity size={12} /> متصل
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-900 text-slate-400 sticky top-0">
                                <tr>
                                    <th className="p-3">التوقيت</th>
                                    <th className="p-3">المرسل</th>
                                    <th className="p-3">الرسالة</th>
                                    <th className="p-3">الإجراء (Parsed)</th>
                                    <th className="p-3">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {whatsappLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-700/30 font-mono text-xs md:text-sm">
                                        <td className="p-3 text-slate-500" dir="ltr">{new Date(log.created_at).toLocaleTimeString()}</td>
                                        <td className="p-3 text-blue-400" dir="ltr">{log.sender_number}</td>
                                        <td className="p-3 text-white font-sans">{log.message_text}</td>
                                        <td className="p-3">
                                            {log.parsed_command ? (
                                                <span className="bg-slate-700 px-2 py-1 rounded text-slate-300 border border-slate-600">
                                                    {log.parsed_command}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600">-</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {log.status === 'success' ? (
                                                <CheckCircle2 size={16} className="text-green-500" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab: Broadcast & Polls */}
            {activeTab === 'broadcast' && (
                <div className="p-8 text-right space-y-6">
                     <div>
                        <h3 className="text-lg font-bold text-white mb-2">إنشاء استطلاع رأي (Micro-Poll)</h3>
                        <p className="text-slate-400 text-sm mb-6">سيتم إرسال الاستطلاع عبر واتساب للمندوبين المسجلين. النتائج تظهر فورياً في لوحة الاستطلاعات.</p>
                     </div>

                     <div className="space-y-4 max-w-xl ml-auto">
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">عنوان السؤال</label>
                            <input 
                                value={pollTitle}
                                onChange={e => setPollTitle(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                                placeholder="مثال: كيف تقيم التجهيزات اللوجستية؟"
                            />
                        </div>
                        
                        <div className="space-y-2">
                             <label className="block text-sm text-slate-300 mb-1">الخيارات</label>
                             {pollOptions.map((opt, idx) => (
                                 <input 
                                    key={idx}
                                    value={opt}
                                    onChange={e => {
                                        const newOpts = [...pollOptions];
                                        newOpts[idx] = e.target.value;
                                        setPollOptions(newOpts);
                                    }}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white mb-2"
                                    placeholder={`خيار ${idx + 1}`}
                                 />
                             ))}
                             {pollOptions.length < 4 && (
                                <button 
                                    onClick={() => setPollOptions([...pollOptions, ''])}
                                    className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                                >
                                    <Plus size={14} /> إضافة خيار
                                </button>
                             )}
                        </div>

                        <button 
                            onClick={handleCreatePoll}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4"
                        >
                            <Send size={18} /> إرسال للمندوبين
                        </button>
                     </div>
                </div>
            )}
             
            {/* Tab: Poll Analytics */}
             {activeTab === 'polls' && (
                 <div className="p-6 h-full overflow-y-auto">
                     <h3 className="font-semibold text-slate-200 mb-4 text-right">تحليل نتائج الاستطلاعات</h3>
                     <div className="grid grid-cols-1 gap-6">
                        {whatsappPolls.map(poll => (
                            <div key={poll.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                <div className="flex justify-between items-start mb-4 text-right">
                                     <div className="flex gap-2 items-center">
                                         <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{poll.total_responses} مشاركة</span>
                                         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                     </div>
                                     <h4 className="font-bold text-lg text-white">{poll.title}</h4>
                                </div>
                                
                                <div className="h-48 w-full" dir="ltr">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <RechartsBar data={Object.keys(poll.results).map(key => ({ name: key, value: poll.results[key] }))}>
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => val.length > 10 ? val.substring(0,10)+'...' : val} />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} cursor={{fill: '#374151', opacity: 0.4}} />
                                            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]}>
                                                {Object.keys(poll.results).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index % 4]} />
                                                ))}
                                            </Bar>
                                        </RechartsBar>
                                     </ResponsiveContainer>
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
             )}

             {/* Tab: Templates Management */}
             {activeTab === 'templates' && (
                <div className="p-6 h-full overflow-y-auto">
                    <div className="mb-8 p-4 bg-slate-900 border border-slate-700 rounded-lg">
                        <h3 className="text-lg font-bold text-white mb-4 text-right flex items-center justify-end gap-2">
                            إضافة قالب جديد <FileText size={18} className="text-blue-400" />
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1 text-right">اسم القالب</label>
                                <input 
                                    value={tplName}
                                    onChange={e => setTplName(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-blue-500 text-right"
                                    placeholder="مثال: تذكير بموعد التصويت"
                                />
                            </div>
                             <div>
                                <label className="block text-sm text-slate-400 mb-1 text-right">نص الرسالة</label>
                                <textarea 
                                    value={tplContent}
                                    onChange={e => setTplContent(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-24 text-right"
                                    placeholder="مرحباً {{1}}،..."
                                />
                                <p className="text-xs text-slate-500 mt-1 text-right">استخدم <code>{`{{1}}, {{2}}`}</code> كمتغيرات (مثل الاسم، المكان، الخ).</p>
                            </div>
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleAddTemplate}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <Check size={16} /> حفظ القالب
                                </button>
                            </div>
                        </div>
                    </div>

                    <h3 className="font-semibold text-slate-200 mb-4 text-right">القوالب المحفوظة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {whatsappTemplates.map(tpl => (
                            <div key={tpl.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl hover:border-slate-500 transition-all text-right group relative">
                                <div className="flex justify-between items-start mb-2">
                                     <button 
                                        onClick={() => deleteWhatsAppTemplate(tpl.id)}
                                        className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                     >
                                        <Trash2 size={16} />
                                     </button>
                                     <h4 className="font-bold text-white">{tpl.name}</h4>
                                </div>
                                <p className="text-slate-400 text-sm bg-slate-900/50 p-3 rounded border border-slate-700/50 font-mono">
                                    {tpl.content}
                                </p>
                                <div className="mt-3 flex justify-end gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded border ${tpl.status === 'approved' ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-yellow-900/20 text-yellow-400 border-yellow-800'}`}>
                                        {tpl.status === 'approved' ? 'معتمد' : 'قيد المراجعة'}
                                    </span>
                                    <span className="text-xs text-slate-500 px-2 py-0.5">{tpl.language.toUpperCase()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             )}
        </div>
      </div>

      {/* Right Panel: Simulator & Status */}
      <div className="flex flex-col space-y-6">
          {/* Status Card */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
             <h3 className="text-lg font-bold text-white mb-4 text-right">حالة الاتصال (Meta API)</h3>
             {whatsappAccounts.map(acc => (
                 <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700 group">
                     <div className="flex items-center gap-3">
                         <div className="relative flex h-3 w-3">
                           {acc.status === 'connected' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                           <span className={`relative inline-flex rounded-full h-3 w-3 ${acc.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-sm font-mono text-slate-300" dir="ltr">{acc.phone_number}</span>
                            <span className={`text-[10px] ${acc.status === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
                                {acc.status === 'connected' ? 'متصل' : 'غير متصل'}
                            </span>
                         </div>
                     </div>
                     <span className="text-xs text-slate-500">{acc.name}</span>
                 </div>
             ))}
             <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center text-xs text-slate-400">
                 <div className="flex items-center gap-1">
                    <Wifi size={14} className="text-green-500" />
                    <span>API Latency: 45ms</span>
                 </div>
                 <span>Quota: 85% Free</span>
             </div>
          </div>

          {/* Simulator Card */}
          <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl shadow-lg p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-right justify-end border-b border-slate-800 pb-4">
                  <div>
                      <h3 className="font-bold text-white">محاكي Webhook</h3>
                      <p className="text-xs text-slate-500">تجربة الأوامر دون الحاجة لهاتف فعلي</p>
                  </div>
                  <Terminal className="text-purple-400" />
              </div>

              <div className="space-y-4 flex-1">
                  <div>
                      <label className="block text-xs text-slate-400 mb-1 text-right">رقم المرسل (افتراضي)</label>
                      <input 
                        value={simSender}
                        onChange={e => setSimSender(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white font-mono text-sm"
                        dir="ltr"
                      />
                  </div>
                  <div>
                      <label className="block text-xs text-slate-400 mb-1 text-right">نص الرسالة</label>
                      <textarea 
                        value={simMessage}
                        onChange={e => setSimMessage(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white font-mono text-sm h-24"
                        placeholder="REPORT Beirut 50 2"
                        dir="ltr"
                      />
                      <div className="mt-2 text-xs text-slate-500 text-right space-y-1">
                          <p>جرب الأوامر التالية:</p>
                          <code className="block bg-slate-950 p-1 rounded text-green-400">REPORT Beirut 60 5</code>
                          <code className="block bg-slate-950 p-1 rounded text-green-400">ALERT South critical</code>
                          <code className="block bg-slate-950 p-1 rounded text-green-400">STATUS Metn</code>
                      </div>
                  </div>

                  <button 
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                      {isSimulating ? <RefreshCw className="animate-spin" size={16}/> : <Smartphone size={16}/>}
                      محاكاة إرسال Webhook
                  </button>

                  {simResponse && (
                      <div className="mt-4 p-3 bg-slate-800 rounded border border-purple-500/30">
                          <span className="text-xs text-purple-400 block mb-1 text-right">الرد الآلي (Bot Response):</span>
                          <p className="text-sm text-white text-right">{simResponse}</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default WhatsAppCommandCenter;
