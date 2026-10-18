import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold shadow-sm transition"
        title="Cài đặt ứng dụng lên màn hình chính máy tính hoặc điện thoại"
      >
        <Download className="w-3.5 h-3.5 text-amber-400" />
        <span>Cài đặt PWA</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-800 text-amber-300 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Cài trên iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Cài đặt trên iPhone/iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-300">
                1. Nhấn nút <strong>Chia sẻ (Share)</strong> ở thanh công cụ Safari.<br /><br />
                2. Cuộn xuống và chọn <strong>Thêm vào Màn hình chính (Add to Home Screen)</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 text-xs transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
