
import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-fade-in-down md:hidden">
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 border border-blue-700/50 rounded-xl p-4 shadow-2xl flex items-center justify-between" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Download size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">تثبيت التطبيق</h3>
            <p className="text-xs text-blue-200">احصل على تجربة أسرع بدون انترنت</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowPrompt(false)}
             className="p-2 text-slate-400 hover:text-white"
           >
             <X size={18} />
           </button>
           <button 
             onClick={handleInstallClick}
             className="bg-white text-blue-900 text-xs font-bold px-3 py-2 rounded-lg"
           >
             تثبيت
           </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
