import React from 'react';
import { AlertTriangle, Trash2, RefreshCw, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  secondaryConfirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onSecondaryConfirm?: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận',
  secondaryConfirmLabel,
  cancelLabel = 'Hủy bỏ',
  variant = 'danger',
  onConfirm,
  onSecondaryConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="confirm-modal-box"
        className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl shrink-0 ${
                variant === 'danger'
                  ? 'bg-rose-100 text-rose-700'
                  : variant === 'warning'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {variant === 'danger' ? (
                <Trash2 className="w-6 h-6" />
              ) : variant === 'warning' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <RefreshCw className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            id="btn-cancel-modal"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition shadow-xs"
          >
            {cancelLabel}
          </button>
          {secondaryConfirmLabel && onSecondaryConfirm && (
            <button
              type="button"
              id="btn-secondary-confirm-modal"
              onClick={onSecondaryConfirm}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition"
            >
              {secondaryConfirmLabel}
            </button>
          )}
          <button
            type="button"
            id="btn-confirm-modal"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
