'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Toast {
  id: string;
  message: string;
  type: 'improvement' | 'drop' | 'level';
}

interface ScoreToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ScoreToastContainer({ toasts, onDismiss }: ScoreToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ScoreToast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ScoreToast({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const colorClass =
    toast.type === 'improvement'
      ? 'border-emerald-500/50 bg-emerald-950/90'
      : toast.type === 'drop'
      ? 'border-red-500/50 bg-red-950/90'
      : 'border-blue-500/50 bg-blue-950/90';

  return (
    <motion.button
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm pointer-events-auto ${colorClass}`}
      onClick={() => onDismiss(toast.id)}
    >
      <span className="text-sm text-white font-medium">{toast.message}</span>
    </motion.button>
  );
}
