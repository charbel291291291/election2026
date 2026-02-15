import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Search } from 'lucide-react';
import { chatWithData } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useStore } from '../store/useStore';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { reports, alerts } = useStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare context
    const context = `
      Active Alerts: ${alerts.filter(a => !a.resolved).length}.
      Latest Report: ${reports[0]?.notes || 'None'}.
      Role: Lebanese Election Analyst.
    `;

    const response = await chatWithData(userMsg.content, context);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: response.text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 p-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2"
        dir="rtl"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
        {!isOpen && <span className="font-semibold hidden md:inline font-sans">محلل الماكينة</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-[90vw] md:w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden text-right" dir="rtl">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="text-red-400" />
              <h3 className="font-semibold text-slate-100 font-sans">التحليل الذكي</h3>
            </div>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full border border-slate-700 font-sans">
              Gemini 3 Flash
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center text-slate-500 mt-10">
                <Bot className="mx-auto mb-2 opacity-50" size={48} />
                <p>أهلاً بك. يمكنني مساعدتك في تحليل اتجاهات التصويت، المخاطر، والوضع الميداني.</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`} // Reversed due to RTL
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <span className="text-xs text-slate-400">جاري المعالجة...</span>
                  <Loader2 className="animate-spin text-blue-400" size={16} />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل عن وضع الدائرة..."
                className="flex-1 bg-slate-800 border-none rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
              >
                <Send size={18} className="rotate-180" /> {/* Rotate send icon for RTL logic */}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;