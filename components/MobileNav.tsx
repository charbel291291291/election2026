import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map as MapIcon,
  PlusCircle,
  AlertTriangle,
  Menu,
} from "lucide-react";
import { motion } from "framer-motion";

const MobileNav: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const items = [
    { path: "/", icon: LayoutDashboard, label: "الرئيسية" },
    { path: "/alerts", icon: AlertTriangle, label: "تنبيهات" },
    { path: "/field", icon: PlusCircle, label: "تقرير", special: true },
    { action: onMenuClick, icon: Menu, label: "القائمة" },
  ];

  return (
    <div
      data-tour="mobile-nav"
      className="md:hidden fixed bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none"
    >
      <div className="glass-panel rounded-2xl px-2 py-2 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 pointer-events-auto w-full max-w-xs">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const active = item.path && isActive(item.path);

          if (item.special) {
            return (
              <Link
                key={idx}
                to={item.path!}
                className="relative -top-6 bg-gradient-to-tr from-red-600 to-rose-500 text-white p-4 rounded-full shadow-[0_8px_20px_rgba(225,29,72,0.5)] border-4 border-slate-950 transition-transform active:scale-95"
              >
                <Icon size={28} strokeWidth={2.5} />
              </Link>
            );
          }

          const Wrapper = item.path ? Link : "button";
          const props = item.path
            ? { to: item.path }
            : { onClick: item.action };

          return (
            // @ts-ignore
            <Wrapper
              key={idx}
              {...props}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all relative ${
                active ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="mobileNavActive"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                className={
                  active ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""
                }
              />
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
