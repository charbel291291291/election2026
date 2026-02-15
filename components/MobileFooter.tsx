import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Bot, User } from "lucide-react";
import { motion } from "framer-motion";

interface MobileFooterProps {
  onMenuClick: () => void;
}

const MobileFooter: React.FC<MobileFooterProps> = ({ onMenuClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTechCTAClick = () => {
    window.dispatchEvent(new Event("open-ai-assistant"));
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <footer
      data-tour="mobile-footer"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[64px] pt-safe"
    >
      <div
        className="h-full bg-white/70 dark:bg-slate-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 flex justify-between items-center px-4"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      >
        {/* Left: Tech CTA Button */}
        <div className="flex-1 flex justify-start" data-tour="cta-button">
          <motion.button
            onClick={handleTechCTAClick}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30 flex items-center justify-center transition-all hover:shadow-violet-500/50"
          >
            <div className="absolute inset-0 rounded-full bg-violet-400/20 animate-pulse" />
            <Bot size={22} className="text-white relative z-10" />
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap">
                AI Assistant
              </div>
            )}
          </motion.button>
        </div>

        {/* Center: Main Navigation Icon (Add Report) */}
        <div className="flex-1 flex justify-center" data-tour="footer-nav">
          <Link
            to="/field"
            className="relative -top-2 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-xl shadow-red-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle size={28} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Right: Profile / Settings (opens menu drawer) */}
        <div className="flex-1 flex justify-end" data-tour="footer-profile">
          <button
            onClick={onMenuClick}
            data-tour="hamburger-trigger"
            aria-label="Open menu"
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <User size={24} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;
