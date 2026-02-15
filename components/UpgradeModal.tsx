
import React from 'react';
import { X, Crown, Users } from 'lucide-react';
import WhatsAppCTA from './WhatsAppCTA';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "ترقية خطة الاشتراك",
  description = "لقد وصلت إلى الحد الأقصى للمستخدمين في خطتك الحالية. للترقية إلى الخطة الاحترافية (Pro) أو المؤسسات (Enterprise)، يرجى التواصل معنا."
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
            <Crown size={32} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            {description}
          </p>

          <div className="w-full space-y-3">
             <div className="w-full flex justify-center">
                 <WhatsAppCTA 
                    message="Hello, I want to upgrade to the PRO plan to add more users." 
                    label="تواصل للترقية عبر واتساب"
                 />
             </div>
             <button 
               onClick={onClose}
               className="w-full py-3 text-slate-400 hover:text-white text-sm"
             >
               إلغاء
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
