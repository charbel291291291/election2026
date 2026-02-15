import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  explanation: {
    title: string;
    description: string;
    usage: string;
    dataInfo: string;
  };
}

const CategoryExplanationModal: React.FC<CategoryExplanationModalProps> = ({
  isOpen,
  onClose,
  categoryName,
  explanation,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-red-600/20 to-transparent">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white pr-10">{categoryName}</h2>
            <p className="text-sm text-slate-400 mt-1">{explanation.title}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div>
              <h3 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wider">
                ما هذا؟
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {explanation.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">
                كيفية الاستخدام
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {explanation.usage}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider">
                البيانات المعروضة
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {explanation.dataInfo}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-900/50">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-red-900/30"
            >
              فهمت
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CategoryExplanationModal;
