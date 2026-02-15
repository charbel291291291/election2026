import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  Send,
  X,
  Mic,
  Volume2,
  Maximize2,
  Minimize2,
  Minus,
  Sparkles,
  Activity,
} from "lucide-react";
import { chatWithData, GeminiLiveClient } from "../services/geminiService";
import { ChatMessage } from "../types";
import { useStore } from "../store/useStore";
import { motion, AnimatePresence } from "framer-motion";

const AlAmidAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const liveClientRef = useRef<GeminiLiveClient | null>(null);

  const { reports, alerts, user, organization } = useStore();

  // Listen for external open trigger (e.g. from MobileFooter Tech CTA)
  useEffect(() => {
    const handleOpen = () => {
      setIsMinimized(false);
      setIsOpen(true);
    };
    window.addEventListener("open-ai-assistant", handleOpen);
    return () => window.removeEventListener("open-ai-assistant", handleOpen);
  }, []);

  // Keyboard support - Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isMinimized) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMinimized]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, mode]);

  // Handle Voice Mode Connection
  useEffect(() => {
    if (mode === "voice" && voiceActive && !liveClientRef.current) {
      const client = new GeminiLiveClient();
      liveClientRef.current = client;

      client.onAudioData = (level) => {
        setAudioLevel(level);
      };

      const context = `
            You are "Al Amid" (العميد), the AI Operations Director for ${
              organization?.name || "the campaign"
            }.
            User Role: ${user?.role || "User"}.
            Active Alerts: ${alerts.filter((a) => !a.resolved).length}.
            Latest Field Report: "${reports[0]?.notes || "None"}".
            
            Talk naturally. Be concise. Use Lebanese Arabic dialect mixed with English tech terms.
            If the user is silent, wait. If they interrupt, stop speaking immediately.
        `;

      client.connect(context).catch((err) => {
        console.error("Voice Connection Failed", err);
        setVoiceActive(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "model",
            content:
              "عذراً، خدمة الصوت غير متاحة حالياً. الرجاء استخدام المحادثة النصية.",
            timestamp: new Date(),
          },
        ]);
      });
    } else if ((mode !== "voice" || !voiceActive) && liveClientRef.current) {
      liveClientRef.current.disconnect();
      liveClientRef.current = null;
      setAudioLevel(0);
    }

    return () => {
      if (liveClientRef.current) {
        liveClientRef.current.disconnect();
        liveClientRef.current = null;
      }
    };
  }, [mode, voiceActive, alerts, reports, user, organization]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const context = `
      Organization: ${organization?.name}.
      User: ${user?.full_name} (${user?.role}).
      Active Alerts: ${alerts
        .filter((a) => !a.resolved)
        .map((a) => a.alert_type)
        .join(", ")}.
      Recent Activity: ${reports.length} reports submitted today.
    `;

    const response = await chatWithData(userMsg.content, context);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "model",
      content: response.text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const toggleVoice = () => {
    if (mode === "text") {
      setMode("voice");
      setVoiceActive(true);
    } else {
      setVoiceActive(!voiceActive);
    }
  };

  // Minimize - preserve state
  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  // Close - reset everything
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsExpanded(false);
    setMessages([]);
    setInput("");
    setMode("text");
    setVoiceActive(false);
    setAudioLevel(0);

    if (liveClientRef.current) {
      liveClientRef.current.disconnect();
      liveClientRef.current = null;
    }
  }, []);

  // Restore from minimized
  const handleRestore = useCallback(() => {
    setIsMinimized(false);
    setIsOpen(true);
  }, []);

  return (
    <>
      {/* Minimized Floating Icon */}
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={handleRestore}
            data-tour="ai-assistant"
            aria-label="Restore AI Assistant"
            className="hidden md:flex fixed bottom-6 left-6 z-[9998] group"
          >
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-2xl border-2 border-red-400">
              <Bot size={24} className="text-white" />

              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                <Minus size={10} className="text-slate-900" />
              </div>

              <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                استعادة المساعد
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main FAB (when closed) - hidden on mobile, footer has CTA instead */}
      {!isOpen && !isMinimized && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsOpen(true)}
          data-tour="ai-assistant"
          aria-label="Open AI Assistant"
          className="hidden md:flex fixed bottom-6 left-6 w-16 h-16 bg-[#0f172a] border-2 border-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)] z-[9997] items-center justify-center overflow-hidden group"
        >
          <div className="absolute inset-0 bg-red-600/10 animate-pulse rounded-full"></div>
          <div className="relative z-10 w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <Bot size={32} className="text-red-500" />
          </div>
          <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full z-20"></div>
        </motion.button>
      )}

      {/* Main Window Interface */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`
                fixed z-[9999] bg-slate-900/98 backdrop-blur-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col
                ${
                  isExpanded
                    ? "inset-4 md:inset-10 rounded-2xl"
                    : "bottom-24 left-6 w-[90vw] md:w-[420px] h-[600px] rounded-2xl"
                }
            `}
            dir="rtl"
            role="dialog"
            aria-label="AI Assistant Panel"
          >
            {/* Window Header */}
            <div className="h-14 border-b border-slate-700 flex items-center justify-between px-4 bg-gradient-to-r from-slate-900 to-slate-800 select-none">
              <div className="flex items-center gap-3">
                {/* Window Controls (Mac-style) */}
                <div className="flex items-center gap-3 mr-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMinimize();
                    }}
                    aria-label="Minimize"
                    className="w-5 h-5 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors flex items-center justify-center"
                  >
                    <Minus size={10} className="text-yellow-900" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    aria-label="Close"
                    className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-400 transition-colors flex items-center justify-center"
                  >
                    <X size={10} className="text-red-900" />
                  </button>
                </div>

                {/* Title & Avatar */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-red-500/30 flex items-center justify-center relative">
                    <Bot className="text-red-500" size={16} />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      العميد (Al Amid)
                    </h3>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Sparkles size={10} className="text-purple-400" /> الذكاء
                      الاصطناعي للعمليات
                    </p>
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  aria-label={isExpanded ? "Minimize" : "Maximize"}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <Minimize2 size={18} />
                  ) : (
                    <Maximize2 size={18} />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMinimize();
                  }}
                  aria-label="Minimize"
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Minus size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  aria-label="Close"
                  className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-gradient-to-b from-slate-900 to-slate-950">
              {/* Voice Mode Visualizer */}
              {mode === "voice" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="relative">
                    <motion.div
                      animate={{ scale: 1 + audioLevel * 2 }}
                      className="w-32 h-32 rounded-full bg-gradient-to-tr from-red-600 to-purple-600 blur-md opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Mic size={48} className="text-white drop-shadow-lg" />
                    </div>
                    {voiceActive && (
                      <>
                        <div
                          className="absolute inset-0 border-2 border-red-500/30 rounded-full animate-ping"
                          style={{ animationDuration: "2s" }}
                        ></div>
                        <div
                          className="absolute inset-0 border-2 border-purple-500/30 rounded-full animate-ping"
                          style={{
                            animationDuration: "3s",
                            animationDelay: "0.5s",
                          }}
                        ></div>
                      </>
                    )}
                  </div>
                  <p className="mt-8 text-lg font-medium text-slate-300 animate-pulse">
                    {voiceActive ? "استمع إليك..." : "الميكروفون متوقف"}
                  </p>
                </div>
              )}

              {/* Text Chat */}
              <div
                className={`h-full overflow-y-auto p-4 space-y-4 ${
                  mode === "voice"
                    ? "opacity-20 pointer-events-none filter blur-sm"
                    : ""
                }`}
                ref={scrollRef}
              >
                {messages.length === 0 && mode === "text" && (
                  <div className="text-center mt-10 space-y-4">
                    <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                      <Activity className="text-slate-600" size={32} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">
                        مرحباً بك أيها القائد
                      </h4>
                      <p className="text-slate-400 text-sm px-8">
                        أنا العميد، مساعدك الذكي. يمكنني تحليل التقارير، مراقبة
                        التنبيهات، والإجابة على استفساراتك القانونية.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => setInput("ما هو وضع الدائرة اليوم؟")}
                        className="bg-slate-800 p-2 rounded hover:bg-slate-700 text-slate-300"
                      >
                        📊 وضع الدائرة
                      </button>
                      <button
                        onClick={() => setInput("هل هناك تنبيهات خطيرة؟")}
                        className="bg-slate-800 p-2 rounded hover:bg-slate-700 text-slate-300"
                      >
                        🚨 التنبيهات
                      </button>
                      <button
                        onClick={() => setInput("لخص لي تقارير المندوبين")}
                        className="bg-slate-800 p-2 rounded hover:bg-slate-700 text-slate-300"
                      >
                        📝 ملخص التقارير
                      </button>
                      <button
                        onClick={() =>
                          setInput("ما هي المهل القانونية الحالية؟")
                        }
                        className="bg-slate-800 p-2 rounded hover:bg-slate-700 text-slate-300"
                      >
                        ⚖️ المهل القانونية
                      </button>
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex justify-end">
                    <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleVoice}
                  className={`p-3 rounded-full transition-all ${
                    mode === "voice"
                      ? voiceActive
                        ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                        : "bg-slate-800 text-red-500"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {mode === "voice" && voiceActive ? (
                    <Volume2 className="animate-pulse" size={20} />
                  ) : (
                    <Mic size={20} />
                  )}
                </button>

                {mode === "text" ? (
                  <div className="flex-1 flex items-center bg-slate-900 border border-slate-700 rounded-full px-4 py-2 focus-within:border-blue-500 transition-colors">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="اكتب رسالتك للعميد..."
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="text-blue-500 hover:text-blue-400 disabled:opacity-50"
                    >
                      <Send size={18} className="rotate-180" />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between px-4">
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                      {voiceActive
                        ? "LIVE VOICE SESSION ACTIVE"
                        : "VOICE SESSION PAUSED"}
                    </span>
                    <button
                      onClick={() => setMode("text")}
                      className="text-xs text-slate-500 hover:text-white underline"
                    >
                      العودة للكتابة
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AlAmidAgent;
