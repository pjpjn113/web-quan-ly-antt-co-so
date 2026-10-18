import React, { useState, useRef } from 'react';
import { Database, Download, Upload, RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert, FileText, Trash2, PhoneCall, ShieldCheck } from 'lucide-react';
import { storageService, SYSTEM_MANAGER_INFO } from '../services/storage';
import { UserAccount } from '../types';

interface BackupRestoreProps {
  currentUser: UserAccount;
  onRefreshData: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'warning') => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
  currentUser,
  onRefreshData,
  onShowToast,
}) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    try {
      const backupJson = storageService.exportFullBackupJSON();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timeStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      a.href = url;
      a.download = `SaoLuu_ANTT_LaiVung_${timeStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      storageService.addAuditLog(
        currentUser,
        'SAO_LUU',
        'Cơ sở dữ liệu toàn hệ thống',
        'Xuất file sao lưu dự phòng định dạng JSON'
      );

      onShowToast('Thành công', 'Đã tải xuống file sao lưu hệ thống an toàn.', 'success');
    } catch (err: any) {
      onShowToast('Lỗi', 'Không thể sao lưu: ' + err.message, 'error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setIsRestoring(true);
        const success = storageService.restoreFromBackupJSON(content);
        if (success) {
          storageService.addAuditLog(
            currentUser,
            'PHUC_HOI',
            'Cơ sở dữ liệu toàn hệ thống',
            `Phục hồi thành công từ file: ${file.name}`
          );
          onRefreshData();
          onShowToast('Thành công', 'Đã phục hồi dữ liệu từ file sao lưu thành công!', 'success');
        } else {
          onShowToast('Lỗi', 'File sao lưu không hợp lệ hoặc sai cấu trúc.', 'error');
        }
      } catch (err: any) {
        onShowToast('Lỗi', 'Lỗi phân tích file sao lưu: ' + err.message, 'error');
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    type: 'reset_demo' | 'clear_all';
    title: string;
    message: string;
  } | null>(null);

  const handleResetToDemo = () => {
    setConfirmAction({
      isOpen: true,
      type: 'reset_demo',
      title: 'Khôi phục dữ liệu mẫu thử nghiệm (DEMO)',
      message: 'Bạn có chắc chắn muốn nạp lại dữ liệu DEMO mẫu ban đầu? Toàn bộ các thay đổi thủ công sẽ được thay thế bằng danh sách chuẩn mẫu.',
    });
  };

  const handleClearAllData = () => {
    setConfirmAction({
      isOpen: true,
      type: 'clear_all',
      title: 'Xóa sạch toàn bộ hồ sơ nhân sự hiện có',
      message: 'CẢNH BÁO NGUY HIỂM: Đồng chí có chắc chắn muốn xóa toàn bộ danh sách hồ sơ nhân sự hiện có trong hệ thống? Thao tác này sẽ xóa sạch tất cả hồ sơ thành viên ANTT cơ sở để chuẩn bị nạp dữ liệu chính thức.',
    });
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'reset_demo') {
      storageService.resetToDemoData();
      storageService.addAuditLog(
        currentUser,
        'CHINH_SUA',
        'Khôi phục dữ liệu mẫu',
        'Cán bộ ADMIN đã thiết lập lại dữ liệu kiểm thử mặc định'
      );
      onRefreshData();
      onShowToast('Thành công', 'Đã khôi phục dữ liệu mẫu chuẩn xã Lai Vung.', 'success');
    } else if (confirmAction.type === 'clear_all') {
      storageService.clearAllData(currentUser);
      onRefreshData();
      onShowToast('Đã xóa dữ liệu', 'Đã làm sạch toàn bộ hồ sơ nhân sự trong cơ sở dữ liệu.', 'warning');
    }

    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
            SAO LƯU DỰ PHÒNG & PHỤC HỒI CƠ SỞ DỮ LIỆU
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý tính toàn vẹn dữ liệu, sao lưu định kỳ và làm sạch hệ thống
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Trạng thái: An toàn</span>
        </div>
      </div>

      {/* System Manager Contact Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
              Thông tin cán bộ quản lý hệ thống
            </div>
            <h3 className="text-base font-black text-white mt-0.5">
              {SYSTEM_MANAGER_INFO.rank} {SYSTEM_MANAGER_INFO.fullName}
            </h3>
            <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span>Chức vụ: <strong>{SYSTEM_MANAGER_INFO.title}</strong></span>
              <span>Đơn vị: <strong>{SYSTEM_MANAGER_INFO.agency}</strong></span>
              <span>Tài khoản: <strong className="font-mono text-amber-300">{SYSTEM_MANAGER_INFO.adminUsername}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <a
            href={`tel:${SYSTEM_MANAGER_INFO.phone}`}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>GỌI: {SYSTEM_MANAGER_INFO.phone}</span>
          </a>
        </div>
      </div>

      {/* Grid of Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Box 1: Sao lưu */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Xuất File Sao Lưu (.JSON)
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Tải toàn bộ hồ sơ nhân sự, danh mục ấp, danh mục tổ ANTT và lịch sử nhật ký về máy tính cá nhân để lưu giữ an toàn.
            </p>
          </div>

          <button
            type="button"
            id="btn-do-backup"
            onClick={handleExportBackup}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>TẢI BẢN SAO LƯU</span>
          </button>
        </div>

        {/* Box 2: Phục hồi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Phục Hồi Từ File Sao Lưu
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Chọn file sao lưu JSON hợp lệ đã xuất trước đó để khôi phục toàn bộ dữ liệu vào hệ thống một cách an toàn.
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              id="btn-do-restore"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRestoring}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>CHỌN FILE PHỤC HỒI</span>
            </button>
          </div>
        </div>

        {/* Box 3: Reset Demo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Khôi Phục Dữ Liệu DEMO
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Tái tạo lại danh sách 15 thành viên mẫu đầy đủ các ấp và tổ ANTT xã Lai Vung phục vụ trình diễn và tập huấn nghiệp vụ.
            </p>
          </div>

          <button
            type="button"
            id="btn-reset-demo"
            onClick={handleResetToDemo}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>NẠP LẠI DỮ LIỆU DEMO</span>
          </button>
        </div>

        {/* Box 4: Xóa hết dữ liệu */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-rose-900 uppercase">
              Xóa Hết Dữ Liệu Hiện Có
            </h3>
            <p className="text-xs text-rose-700/80 mt-2 leading-relaxed">
              Xóa sạch toàn bộ danh sách thành viên ANTT trong cơ sở dữ liệu để chuẩn bị tiếp nhận nạp dữ liệu chính thức mới.
            </p>
          </div>

            <button
            type="button"
            id="btn-wipe-all-data"
            onClick={handleClearAllData}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>XÓA SẠCH DỮ LIỆU</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && confirmAction.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${confirmAction.type === 'clear_all' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase">
                  {confirmAction.title}
                </h4>
                <span className="text-[11px] text-slate-400">Yêu cầu xác nhận an toàn</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {confirmAction.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition ${
                  confirmAction.type === 'clear_all'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {confirmAction.type === 'clear_all' ? 'Xác nhận xóa sạch' : 'Xác nhận nạp DEMO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
