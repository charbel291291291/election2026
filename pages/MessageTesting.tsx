import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { generateMessageVariants } from '../services/geminiService';
import { Sparkles, BarChart2, Copy } from 'lucide-react';

const MessageTesting: React.FC = () => {
  const { messages, addMessageVariant, user } = useStore();
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic || !audience) return;
    setLoading(true);
    
    // Append Lebanon context to the service call invisibly if needed, 
    // but relies on service handling prompt.
    const variants = await generateMessageVariants(topic, audience);
    
    variants.forEach((v, idx) => {
      if (v.title && v.content) {
        addMessageVariant({
          id: `gen-${Date.now()}-${idx}`,
          organization_id: user?.organization_id || 'org-1',
          title: v.title,
          content: v.content,
          metrics: { impressions: 0, interactions: 0, conversions: 0 }
        });
      }
    });

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-right">مختبر الرسائل الانتخابية (SMS / WhatsApp)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl h-fit text-right">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 flex-row-reverse justify-between">
             مولّد الذكاء الاصطناعي <Sparkles className="text-yellow-400" size={20} />
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">الموضوع الأساسي</label>
              <input 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-600 rounded p-2 text-white"
                placeholder="مثال: دعوة لمهرجان انتخابي، رد على شائعة..."
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">الجمهور المستهدف</label>
              <input 
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-600 rounded p-2 text-white"
                placeholder="مثال: شباب كسروان، مغتربين، مترددين"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري توليد الرسائل...' : 'توليد المقترحات'}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-right">الرسائل النشطة (A/B Testing)</h2>
          {messages.length === 0 && <p className="text-slate-500 text-right">لم يتم إنشاء رسائل بعد.</p>}
          
          {messages.map((msg) => (
            <div key={msg.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-500 transition-colors text-right">
              <div className="flex justify-between items-start mb-3 flex-row-reverse">
                <h3 className="font-bold text-lg text-white">{msg.title}</h3>
                <div className="flex gap-2 text-xs">
                  <span className="bg-slate-700 px-2 py-1 rounded text-slate-300">نشط</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4 bg-slate-900/50 p-3 rounded border-r-2 border-blue-500 italic">
                "{msg.content}"
              </p>
              
              <div className="grid grid-cols-3 gap-4 border-t border-slate-700 pt-4" dir="ltr">
                <div className="text-center">
                   <p className="text-xs text-slate-500 uppercase">معدل التحويل (Conversion)</p>
                  <p className="font-mono font-bold text-blue-400">
                    {msg.metrics.interactions ? ((msg.metrics.conversions / msg.metrics.interactions) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase">تفاعل (CTR)</p>
                  <p className="font-mono font-bold text-emerald-400">
                    {msg.metrics.impressions ? ((msg.metrics.interactions / msg.metrics.impressions) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase">وصول (Impressions)</p>
                  <p className="font-mono font-bold text-white">{msg.metrics.impressions.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageTesting;