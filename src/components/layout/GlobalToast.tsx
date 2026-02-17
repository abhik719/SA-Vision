import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function GlobalToast() {
  const toast = useAppStore((s) => s.toast);
  const dismissToast = useAppStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, toast.durationMs);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 top-[72px] z-[9999] flex justify-center"
        >
          <div className="pointer-events-auto flex items-center gap-[10px] rounded-[12px] border border-green-200 bg-white px-[20px] py-[14px] shadow-lg shadow-black/8">
            <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-green-50">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-[14px] font-semibold text-li-text-primary">
                {toast.text}
              </span>
              {toast.subtext && (
                <span className="font-body text-[12px] text-li-text-secondary">
                  {toast.subtext}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
