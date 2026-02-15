import React, { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "pwa_install_dismissed";
const IOS_KEY = "pwa_ios_instructions_seen";

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as any).standalone === true;

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    const iosSeen = localStorage.getItem(IOS_KEY);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) setShowBanner(true);
      setShowFloating(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (isIOS() && !iosSeen && !dismissed) {
      const t = setTimeout(() => setShowFloating(true), 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowBanner(false);
        setShowFloating(false);
        localStorage.setItem(STORAGE_KEY, "true");
      }
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleShowIOSInstructions = () => {
    setShowIOSModal(true);
  };

  const handleCloseIOSModal = () => {
    setShowIOSModal(false);
    localStorage.setItem(IOS_KEY, "true");
    setShowFloating(false);
  };

  if (isStandalone()) return null;

  return (
    <>
      {/* Top banner - Android / Chrome */}
      <AnimatePresence>
        {showBanner && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 z-[70] md:hidden"
          >
            <div
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-xl flex items-center justify-between"
              dir="rtl"
            >
              <div className="flex items-center gap-3">
                <div className="bg-violet-600 p-2.5 rounded-xl text-white">
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Install App for better experience
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    تجربة أسرع بدون متصفح
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDismiss}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={handleInstallClick}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  تثبيت
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating tech button - when banner dismissed but still installable */}
      <AnimatePresence>
        {showFloating && !showBanner && (deferredPrompt || isIOS()) && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-20 left-4 z-[65] md:hidden"
          >
            <button
              onClick={deferredPrompt ? handleInstallClick : handleShowIOSInstructions}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
            >
              <Smartphone size={22} />
            </button>
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 pointer-events-none transition-opacity">
              Install App
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Add to Home Screen instructions modal */}
      <AnimatePresence>
        {showIOSModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseIOSModal}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-[81] bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-white/10"
              dir="rtl"
            >
              <h3 className="font-bold text-lg mb-2">Add to Home Screen</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                لتثبيت التطبيق على iOS: اضغط زر المشاركة
                <span className="inline-block mx-1">⬆️</span>
                ثم اختر &quot;Add to Home Screen&quot;
              </p>
              <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside mb-6">
                <li>اضغط على أيقونة المشاركة (المربع مع السهم)</li>
                <li>انتقل للأسفل واختر &quot;Add to Home Screen&quot;</li>
                <li>اضغط &quot;Add&quot; في الزاوية</li>
              </ol>
              <button
                onClick={handleCloseIOSModal}
                className="w-full py-2.5 bg-violet-600 text-white font-semibold rounded-xl"
              >
                فهمت
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAInstallPrompt;
