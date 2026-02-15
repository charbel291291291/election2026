import React, { useState, useEffect, Suspense, lazy } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Map as MapIcon,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Cpu,
  LogOut,
  X,
  Vote,
  MessageCircle,
  Scale,
  Wifi,
  WifiOff,
  RefreshCw,
  Users,
  ShieldAlert,
} from "lucide-react";
import { useStore } from "../store/useStore";
import MobileNav from "./MobileNav";
import PWAInstallPrompt from "./PWAInstallPrompt";
import WhatsAppCTA from "./WhatsAppCTA";
import SuperAdminAuth from "./SuperAdminAuth";
import AlAmidAgent from "./AlAmidAgent"; // Updated Import
import CategoryExplanationModal from "./CategoryExplanationModal";
import { useCategoryExplanation } from "../hooks/useCategoryExplanation";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const {
    logout,
    user,
    organization,
    isOnline,
    pendingSyncCount,
    setOnlineStatus,
    syncOfflineQueue,
    isSuperAdmin,
  } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const { showExplanation, currentCategory, handleClose } = useCategoryExplanation();

  // Hidden Trigger Logic: 5 Rapid Clicks on Logo
  const handleLogoClick = () => {
    setLogoClicks((prev) => prev + 1);

    // Reset after 2 seconds if not completed
    setTimeout(() => setLogoClicks(0), 2000);

    if (logoClicks >= 4) {
      // 0 to 4 = 5 clicks
      const event = new Event("trigger-root-access");
      window.dispatchEvent(event);
      setLogoClicks(0);
    }
  };

  useEffect(() => {
    const handleStatusChange = () => {
      setOnlineStatus(navigator.onLine);
      if (navigator.onLine) syncOfflineQueue();
    };

    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  const navItems = [
    { path: "/", label: "لوحة القيادة", icon: LayoutDashboard },
    { path: "/field", label: "الميدان والمندوبين", icon: MapIcon },
    { path: "/alerts", label: "التنبيهات والمخاطر", icon: AlertTriangle },
    { path: "/resources", label: "الموارد والميزانية", icon: BarChart3 },
    { path: "/messages", label: "الرسائل الانتخابية", icon: MessageSquare },
    { path: "/whatsapp", label: "WhatsApp Intelligence", icon: MessageCircle },
    { path: "/legal", label: "الذكاء الانتخابي", icon: Scale },
    { path: "/simulation", label: "محاكاة الحاصل", icon: Cpu },
    ...(user?.role === "admin"
      ? [{ path: "/team", label: "إدارة الفريق", icon: Users }]
      : []),
  ];

  const NavContent = () => (
    <>
      <div className="p-8 flex flex-col items-center text-center pt-safe">
        <motion.div
          onClick={handleLogoClick}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-800 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(225,29,72,0.4)] border border-red-500/30 cursor-pointer active:scale-95 transition-transform"
        >
          <Vote className="text-white drop-shadow-md" size={32} />
        </motion.div>
        <h1 className="text-lg font-bold text-white leading-tight tracking-wide">
          {organization?.name || "ماكينة انتخابات ٢٠٢٦"}
        </h1>
        <div className="mt-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {organization?.subscription_plan === "basic"
              ? "Basic Tier"
              : "Enterprise OS"}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          // Add data-tour attribute based on path
          const tourId =
            item.path === "/"
              ? "dashboard"
              : item.path === "/field"
              ? "field-input"
              : item.path === "/whatsapp"
              ? "whatsapp"
              : item.path === "/legal"
              ? "legal"
              : item.path === "/team"
              ? "team"
              : null;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              {...(tourId ? { "data-tour": tourId } : {})}
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-red-600/20 to-red-900/10 text-white border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-6 bg-red-500 rounded-r-full"
                  />
                )}
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]"
                      : "group-hover:text-slate-200"
                  }
                />
                <span className="font-medium text-sm">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Super Admin Badge (Visible only if authenticated as root) */}
      {isSuperAdmin && (
        <Link
          to="/system-root"
          className="mx-4 mb-2 p-3 bg-red-950/50 border border-red-900 rounded-lg flex items-center gap-2 group hover:bg-red-900/80 transition-colors"
        >
          <ShieldAlert size={16} className="text-red-500 animate-pulse" />
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">
              ROOT ACTIVE
            </p>
            <p className="text-[10px] text-red-400 group-hover:text-white">
              Go to System Dashboard
            </p>
          </div>
        </Link>
      )}

      <div className="p-4 mt-auto pb-safe">
        <div className="glass-panel rounded-xl p-4 mb-3 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-white/10">
              {user?.full_name.charAt(0)}
            </div>
            <div className="overflow-hidden text-right flex-1">
              <p className="text-sm font-bold text-white truncate">
                {user?.full_name}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-300 text-xs font-bold uppercase tracking-wider border border-transparent hover:border-red-500/30"
          >
            <LogOut size={14} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div
      className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden overflow-x-hidden"
      dir="rtl"
    >
      <PWAInstallPrompt />
      <WhatsAppCTA
        message="Hello, I want to learn more about FieldOps Intelligence Platform."
        label="تواصل معنا عبر واتساب"
      />
      <SuperAdminAuth /> {/* Global Hidden Auth Trigger */}
      {!isOnline && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-1 bg-red-600 z-[100]" />
      )}
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 border-l border-white/5 bg-[#020617]/80 backdrop-blur-2xl z-20 shadow-2xl">
        <NavContent />
      </aside>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-xl flex flex-col md:hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-white/10 pt-safe">
              <h2 className="text-xl font-bold text-white">القائمة الرئيسية</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <NavContent />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden scroll-smooth z-10 min-h-screen flex flex-col">
        <div className="sticky top-0 z-30 px-4 md:px-8 py-4 backdrop-blur-md bg-[#020617]/50 border-b border-white/5 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {isOnline ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 md:px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Wifi size={14} /> <span className="hidden sm:inline">نظام متصل</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 px-2 md:px-3 py-1.5 rounded-full border border-red-500/20 animate-pulse">
                <WifiOff size={14} /> <span className="hidden sm:inline">نظام غير متصل</span>
              </div>
            )}

            {pendingSyncCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 px-2 md:px-3 py-1.5 rounded-full border border-amber-500/20">
                <RefreshCw
                  size={14}
                  className={isOnline ? "animate-spin" : ""}
                />
                <span>{pendingSyncCount} معلق</span>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 font-mono hidden md:block">
            SECURE CONNECTION // ENCRYPTED
          </div>
        </div>

        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 pb-32 md:pb-12">
          <div className="w-full max-w-full">
            {children}
          </div>
        </div>
      </main>
      <MobileNav onMenuClick={() => setIsMobileMenuOpen(true)} />
      {/* Replaced AIAssistant with AlAmidAgent */}
      <AlAmidAgent />
      
      {/* Category Explanation Modal */}
      {currentCategory && (
        <CategoryExplanationModal
          isOpen={showExplanation}
          onClose={handleClose}
          categoryId={currentCategory.id}
          categoryName={currentCategory.name}
          explanation={currentCategory.explanation}
        />
      )}
    </div>
  );
};

export default Layout;
