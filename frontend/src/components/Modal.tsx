import { motion, AnimatePresence } from "framer-motion";
import { Alert01Icon, CheckmarkBadge01Icon, Cancel01Icon } from "hugeicons-react";

export type ModalConfig = {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "error" | "success" | "confirm";
  onConfirm?: () => void;
  onClose?: () => void;
};

export default function Modal({ config }: { config: ModalConfig }) {
  if (!config.isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-sm bg-[#171717] border border-[#2A2A2A] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                config.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                config.type === 'confirm' ? 'bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/20' :
                'bg-green-500/10 text-green-500 border border-green-500/20'
              }`}>
                {config.type === 'error' ? <Alert01Icon size={24} /> :
                 config.type === 'confirm' ? <Alert01Icon size={24} /> :
                 <CheckmarkBadge01Icon size={24} />}
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">{config.title}</h3>
            </div>
            
            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
              {config.message}
            </p>

            <div className="flex gap-3">
              {config.type === 'confirm' && (
                <button
                  onClick={config.onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#333333] hover:bg-[#2A2A2A] text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={config.onConfirm || config.onClose}
                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-white transition-colors shadow-lg ${
                  config.type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' :
                  config.type === 'confirm' ? 'bg-[#FF6B4A] hover:bg-[#ff4411] shadow-[#FF6B4A]/20' :
                  'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                }`}
              >
                {config.type === 'confirm' ? 'Confirm' : 'Got it'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
