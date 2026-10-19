import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  PhoneCall,
  ShieldCheck,
  Cloud,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Code2,
  ArrowUpFromLine,
  ArrowDownToLine,
  Users,
  UserCheck,
  Shield,
} from 'lucide-react';
import {
  storageService,
  SYSTEM_MANAGER_INFO,
  SupabaseConnectionReport,
} from '../services/storage';
import {
  SUPABASE_URL,
  SUPABASE_PROJECT_REF,
  SUPABASE_SQL_SCHEMA,
} from '../services/supabaseClient';
import { UserAccount } from '../types';

interface BackupRestoreProps {
  currentUser: UserAccount;
  onRefreshData: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
  currentUser,
  onRefreshData,
  onShowToast,
}) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Users list state
  const [userList, setUserList] = useState<UserAccount[]>(() => storageService.getUsers());

  // Supabase states
  const [connReport, setConnReport] = useState<SupabaseConnectionReport | null>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false);
  const [isSyncingPush, setIsSyncingPush] = useState(false);
  const [isSyncingPull, setIsSyncingPull] = useState(false);
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSyncUsersToSupabase = async () => {
    setIsSyncingUsers(true);
    try {
      const res = await storageService.syncUsersToSupabase();
      if (res.success) {
        onShowToast('Đã đồng bộ lên Supabase', res.message, 'success');
        await checkCloudStatus();
      } else {
        onShowToast('Chưa thể lưu lên Supabase', res.message, 'warning');
        setShowSqlModal(true);
      }
    } finally {
      setIsSyncingUsers(false);
    }
  };

  const checkCloudStatus = useCallback(async () => {
    setIsCheckingSupabase(true);
    try {
      const report = await storageService.checkSupabaseConnection();
      setConnReport(report);
      if (report.status === 'connected_missing_tables') {
        setShowSqlModal(true);
      }
    } finally {
      setIsCheckingSupabase(false);
    }
  }, []);

  useEffect(() => {
    void checkCloudStatus();
  }, [checkCloudStatus]);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      onShowToast(
        'Đã sao chép mã lệnh SQL',
        'Hãy dán vào SQL Editor trên Supabase và nhấn nút RUN.',
        'success'
      );
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      onShowToast('Không thể tự động sao chép', 'Vui lòng bôi đen và copy đoạn mã SQL bên dưới.', 'warning');
    }
  };

  const handlePushToSupabase = async () => {
    setIsSyncingPush(true);
    try {
      const res = await storageService.pushAllToSupabase();
      if (res.success) {
        storageService.addAuditLog(
          currentUser,
          'SAO_LUU',
          'Đám mây Supabase',
          'Đồng bộ đẩy toàn bộ dữ liệu từ phần mềm lên cơ sở dữ liệu Supabase'
        );
        onShowToast('Đồng bộ lên Supabase thành công', res.message, 'success');
        await checkCloudStatus();
      } else {
        onShowToast('Chưa thể đẩy dữ liệu', res.message, 'warning');
        setShowSqlModal(true);
      }
    } finally {
      setIsSyncingPush(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setIsSyncingPull(true);
    try {
      const res = await storageService.pullFromSupabase();
      if (res.success) {
        onRefreshData();
        onShowToast('Tải dữ liệu từ Supabase thành công', res.message, 'success');
        await checkCloudStatus();
      } else {
        onShowToast('Chưa thể tải dữ liệu', res.message, 'warning');
        if (res.missingTables) {
          setShowSqlModal(true);
        }
      }
    } finally {
      setIsSyncingPull(false);
    }
  };

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
          void checkCloudStatus();
          onShowToast('Thành công', 'Đã phục hồi dữ liệu từ file sao lưu và đồng bộ lên Supabase!', 'success');
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
      message: 'Bạn có chắc chắn muốn nạp lại dữ liệu DEMO mẫu ban đầu? Toàn bộ các thay đổi thủ công sẽ được thay thế bằng danh sách chuẩn mẫu và đồng bộ lên Supabase.',
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
      void checkCloudStatus();
      onShowToast('Thành công', 'Đã khôi phục dữ liệu mẫu chuẩn xã Lai Vung.', 'success');
    } else if (confirmAction.type === 'clear_all') {
      storageService.clearAllData(currentUser);
      onRefreshData();
      void checkCloudStatus();
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
            KẾT NỐI ĐÁM MÂY SUPABASE & SAO LƯU DỰ PHÒNG
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý kết nối trực tuyến cơ sở dữ liệu Supabase, đồng bộ đa thiết bị và sao lưu định kỳ
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Project ID: {SUPABASE_PROJECT_REF}</span>
        </div>
      </div>

      {/* SUPABASE CLOUD CONNECTION PANEL */}
      <div className="bg-white rounded-2xl border-2 border-emerald-600/30 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 px-5 py-4 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <Cloud className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-300">
                  Cơ sở dữ liệu đám mây chính thức
                </span>
                {connReport?.status === 'connected_ready' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> ĐANG HOẠT ĐỘNG TRỰC TUYẾN
                  </span>
                )}
                {connReport?.status === 'connected_missing_tables' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/30 border border-amber-400/50 text-amber-200 text-[10px] font-bold">
                    <AlertTriangle className="w-3 h-3" /> CHỜ CHẠY SQL TẠO BẢNG LẦN ĐẦU
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                KẾT NỐI DỮ LIỆU TRỰC TIẾP VỚI SUPABASE
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5 font-mono break-all">
                URL: {SUPABASE_URL}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => void checkCloudStatus()}
              disabled={isCheckingSupabase}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSupabase ? 'animate-spin' : ''}`} />
              <span>Kiểm tra kết nối</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSqlModal(prev => !prev)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-sm"
            >
              <Code2 className="w-4 h-4" />
              <span>{showSqlModal ? 'Ẩn mã SQL tạo bảng' : 'Mã SQL khởi tạo bảng'}</span>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Status Banner */}
          {connReport && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                connReport.status === 'connected_ready'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : connReport.status === 'connected_missing_tables'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {connReport.status === 'connected_ready' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-extrabold uppercase">
                    {connReport.status === 'connected_ready'
                      ? 'Trạng thái: Đã kết nối thông suốt với bảng dữ liệu trên Supabase'
                      : connReport.status === 'connected_missing_tables'
                      ? 'Bước cuối cùng: Khởi tạo các bảng dữ liệu trên Supabase (Chỉ làm 1 lần duy nhất)'
                      : 'Cảnh báo kết nối Supabase'}
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">{connReport.message}</p>
                </div>
              </div>

              {connReport.status === 'connected_missing_tables' && (
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql/new`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 inline-flex items-center gap-1.5 shadow-xs transition"
                >
                  <span>Mở Supabase SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Table Record Counts on Supabase */}
          {connReport?.tableCounts && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-semibold">Bảng nhan_su</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">
                  {connReport.tableCounts.nhan_su} <span className="text-xs font-normal text-slate-500">hồ sơ</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-semibold">Bảng dia_ban_ap</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">
                  {connReport.tableCounts.dia_ban_ap} <span className="text-xs font-normal text-slate-500">ấp</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-semibold">Bảng to_antt</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">
                  {connReport.tableCounts.to_antt} <span className="text-xs font-normal text-slate-500">tổ</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-semibold">Bảng nhat_ky_tuan_tra</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">
                  {connReport.tableCounts.nhat_ky_tuan_tra} <span className="text-xs font-normal text-slate-500">ca trực</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-semibold">Bảng dot_tap_huan</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">
                  {connReport.tableCounts.dot_tap_huan} <span className="text-xs font-normal text-slate-500">đợt</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-semibold">Bảng ho_so_khen_thuong</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">
                  {connReport.tableCounts.ho_so_khen_thuong} <span className="text-xs font-normal text-slate-500">hồ sơ</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons for 2-way Sync */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-emerald-950 uppercase flex items-center gap-1.5">
                  <ArrowUpFromLine className="w-4 h-4 text-emerald-700" />
                  Đẩy toàn bộ dữ liệu hiện tại lên Supabase
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Đồng bộ tất cả hồ sơ nhân sự, 19 Ấp, 19 Tổ ANTT, sổ tuần tra, tập huấn và khen thưởng từ máy hiện tại lên các bảng trên Supabase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handlePushToSupabase()}
                disabled={isSyncingPush}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowUpFromLine className={`w-4 h-4 ${isSyncingPush ? 'animate-bounce' : ''}`} />
                <span>{isSyncingPush ? 'ĐANG ĐẨY DỮ LIỆU LÊN SUPABASE...' : 'ĐẨY DỮ LIỆU LÊN SUPABASE NGAY'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 flex flex-col justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-blue-950 uppercase flex items-center gap-1.5">
                  <ArrowDownToLine className="w-4 h-4 text-blue-700" />
                  Tải dữ liệu mới nhất từ Supabase về máy
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Cập nhật toàn bộ dữ liệu mới nhất đang lưu trên đám mây Supabase về màn hình làm việc (dùng khi nhiều cán bộ cùng nhập liệu).
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handlePullFromSupabase()}
                disabled={isSyncingPull}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowDownToLine className={`w-4 h-4 ${isSyncingPull ? 'animate-bounce' : ''}`} />
                <span>{isSyncingPull ? 'ĐANG TẢI TỪ SUPABASE...' : 'TẢI DỮ LIỆU TỪ SUPABASE VỀ MÁY'}</span>
              </button>
            </div>
          </div>

          {/* SQL Schema Box (Expandable or Auto-shown if tables missing) */}
          {showSqlModal && (
            <div className="rounded-2xl border-2 border-amber-400 bg-slate-900 text-slate-100 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
                <div>
                  <h4 className="text-sm font-black text-amber-300 uppercase flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    MÃ LỆNH SQL KHỞI TẠO 8 BẢNG DỮ LIỆU TRÊN SUPABASE
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    <strong>Hướng dẫn 3 bước:</strong> (1) Nhấn nút <strong>"Sao chép mã SQL"</strong> bên phải $\rightarrow$ (2) Nhấn <strong>"Mở SQL Editor trên Supabase"</strong> $\rightarrow$ (3) Dán (Ctrl+V) vào khung soạn thảo và bấm nút <strong>RUN</strong> màu xanh.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleCopySql()}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSql ? 'ĐÃ SAO CHÉP!' : '1. SAO CHÉP MÃ SQL'}</span>
                  </button>

                  <a
                    href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql/new`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>2. MỞ SQL EDITOR SUPABASE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-80 leading-relaxed select-all">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}
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

      {/* Danh sách tài khoản cán bộ đã đăng ký trên hệ thống */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  Tài Khoản Cán Bộ Trên Hệ Thống
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {userList.length} tài khoản
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cán bộ có thể tự đăng ký bằng tên đăng nhập & mật khẩu tại màn hình Đăng nhập
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => void handleSyncUsersToSupabase()}
              disabled={isSyncingUsers}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <ArrowUpFromLine className={`w-3.5 h-3.5 ${isSyncingUsers ? 'animate-bounce' : ''}`} />
              <span>{isSyncingUsers ? 'Đang lưu lên Supabase...' : 'Lưu tài khoản lên Supabase ngay'}</span>
            </button>

            <button
              type="button"
              onClick={() => setUserList(storageService.getUsers())}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới danh sách</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tên đăng nhập</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Chức vụ & Đơn vị</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Ngày tạo</th>
                {currentUser.role === 'ADMIN' && <th className="py-3 px-4 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {userList.map((u) => {
                const isAdmin = u.role === 'ADMIN' || u.username.toLowerCase() === 'admin';
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {u.username}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {u.fullName}
                    </td>
                    <td className="py-3 px-4">
                      {u.role === 'ADMIN' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                          <Shield className="w-3 h-3" />
                          ADMIN
                        </span>
                      )}
                      {u.role === 'MANAGER' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          <UserCheck className="w-3 h-3" />
                          QUẢN LÝ
                        </span>
                      )}
                      {u.role === 'VIEWER' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Users className="w-3 h-3" />
                          TRA CỨU
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{u.chucVu}</div>
                      <div className="text-[11px] text-slate-400">{u.donVi}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {u.soDienThoai || 'Chưa cập nhật'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    {currentUser.role === 'ADMIN' && (
                      <td className="py-3 px-4 text-center">
                        {isAdmin ? (
                          <span className="text-[11px] text-slate-400 italic">Mặc định</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${u.username}" (${u.fullName}) không?`)) {
                                const res = storageService.deleteUser(u.id);
                                if (res.success) {
                                  setUserList(storageService.getUsers());
                                  onShowToast('Đã xóa tài khoản', `Đã xóa tài khoản "${u.username}" khỏi hệ thống.`, 'info');
                                } else {
                                  onShowToast('Lỗi', res.error, 'error');
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                            title="Xóa tài khoản này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Hướng dẫn chi tiết lưu trữ tài khoản trên Supabase */}
        <div className="p-4 bg-emerald-50/60 border-t border-emerald-200 text-xs text-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Cách xem và lưu trữ tài khoản trên đám mây Supabase:</span>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                Khi bất kỳ cán bộ nào đăng ký tài khoản mới, hệ thống tự động lưu vào bảng <strong>public.users</strong> trên Supabase (chứa cột <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300">username</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300">full_name</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300">password_hash</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300">role</code>). Bạn cũng có thể bấm nút <strong>"Lưu tài khoản lên Supabase ngay"</strong> ở trên bất kỳ lúc nào.
              </p>
            </div>
          </div>

          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/editor`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-900 font-bold text-[11px] shadow-xs transition flex items-center gap-1.5 shrink-0 self-start md:self-center"
          >
            <span>Mở Table Editor trên Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
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
              Chọn file sao lưu JSON hợp lệ đã xuất trước đó để khôi phục toàn bộ dữ liệu vào hệ thống và đồng bộ lên Supabase.
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
              Tái tạo lại danh sách thành viên mẫu đầy đủ các ấp và tổ ANTT xã Lai Vung phục vụ trình diễn và tập huấn nghiệp vụ.
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
