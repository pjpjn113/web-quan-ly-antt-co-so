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
  SQL_STEP_1_TABLES_SCHEMA,
  SQL_STEP_2_SECURITY_AND_RLS,
  SQL_STEP_3_SET_FIRST_ADMIN,
  SQL_STEP_4_MIGRATE_AND_CLEANUP,
} from '../services/supabaseClient';
import { UserAccount, UserRole } from '../types';
import { formatUserDateVN } from '../utils/helpers';

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

  // Users list state (Yêu cầu 4: tài khoản thường chỉ xem hồ sơ mình, ADMIN xem danh sách)
  const [userList, setUserList] = useState<UserAccount[]>(() => storageService.getUsers(currentUser));
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersLoadError, setUsersLoadError] = useState<string | null>(() => storageService.getLastUsersError());

  // Supabase states
  const [connReport, setConnReport] = useState<SupabaseConnectionReport | null>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false);
  const [isSyncingPush, setIsSyncingPush] = useState(false);
  const [isSyncingPull, setIsSyncingPull] = useState(false);
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);

  // 4 SQL Migration Steps state
  const [activeSqlStep, setActiveSqlStep] = useState<1 | 2 | 3 | 4>(1);
  const [copiedStepIndex, setCopiedStepIndex] = useState<number | null>(null);
  const [isChangingRole, setIsChangingRole] = useState<string | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(true);

  const handleCopyStep = async (stepNumber: 1 | 2 | 3 | 4, sqlContent: string, title: string) => {
    try {
      await navigator.clipboard.writeText(sqlContent);
      setCopiedStepIndex(stepNumber);
      onShowToast(
        `Đã sao chép ${title}`,
        'Hãy dán vào SQL Editor trên Supabase và bấm nút RUN để thực thi.',
        'success'
      );
      setTimeout(() => setCopiedStepIndex(null), 3000);
    } catch {
      onShowToast('Lỗi', 'Không thể tự động sao chép. Vui lòng chọn và copy mã thủ công.', 'warning');
    }
  };

  const refreshUsersList = useCallback(
    async (notifyOnSuccess = false) => {
      setIsLoadingUsers(true);
      try {
        const res = await storageService.fetchUsersFromSupabase(currentUser);
        setUserList(res.users);
        if (!res.success) {
          const errText = res.error || 'Truy vấn danh sách tài khoản trên Supabase thất bại.';
          setUsersLoadError(errText);
          onShowToast('Lỗi tải danh sách tài khoản', errText, 'error');
        } else {
          setUsersLoadError(null);
          if (notifyOnSuccess) {
            onShowToast('Đã cập nhật danh sách', `Đã tải ${res.users.length} hồ sơ tài khoản từ Supabase.`, 'info');
          }
        }
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [currentUser, onShowToast]
  );

  // Yêu cầu 2: Chỉ quản trị viên được thay đổi role của người khác
  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    if (currentUser.role !== 'ADMIN') {
      onShowToast('Từ chối quyền', 'Chỉ Quản trị viên (ADMIN) mới có quyền đổi vai trò người dùng.', 'error');
      return;
    }
    setIsChangingRole(targetUserId);
    try {
      const res = await storageService.updateUserRole(targetUserId, newRole, currentUser);
      if (res.success) {
        setUserList(storageService.getUsers(currentUser));
        onShowToast('Đã đổi vai trò', `Đã cập nhật vai trò tài khoản thành ${newRole}.`, 'success');
      } else {
        onShowToast('Lỗi đổi vai trò', res.error, 'error');
      }
    } finally {
      setIsChangingRole(null);
    }
  };

  const handleSyncUsersToSupabase = async () => {
    setIsSyncingUsers(true);
    try {
      const res = await storageService.syncUsersToSupabase();
      if (res.success) {
        onShowToast('Đã đồng bộ lên Supabase', res.message, 'success');
        await checkCloudStatus();
        await refreshUsersList(false);
      } else {
        onShowToast('Chưa thể lưu lên Supabase', res.message, 'warning');
        setShowSqlGuide(true);
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
        setShowSqlGuide(true);
      }
    } finally {
      setIsCheckingSupabase(false);
    }
  }, []);

  useEffect(() => {
    void checkCloudStatus();
    void refreshUsersList(false);
    const unsub = storageService.subscribeDataRefresh(() => {
      setUserList(storageService.getUsers(currentUser));
      setUsersLoadError(storageService.getLastUsersError());
    });
    return unsub;
  }, [checkCloudStatus, refreshUsersList, currentUser]);

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
        setShowSqlGuide(true);
      }
    } finally {
      setIsSyncingPush(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setIsSyncingPull(true);
    try {
      const res = await storageService.pullFromSupabase();
      setUserList(storageService.getUsers(currentUser));
      setUsersLoadError(storageService.getLastUsersError());
      if (res.success) {
        onRefreshData();
        onShowToast('Tải dữ liệu từ Supabase thành công', res.message, 'success');
        await checkCloudStatus();
      } else {
        onShowToast('Chưa thể tải dữ liệu', res.message, 'error');
        if (res.missingTables) {
          setShowSqlGuide(true);
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
              onClick={() => setShowSqlGuide((prev: boolean) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>{showSqlGuide ? 'Ẩn mã SQL' : 'Xem mã SQL 4 bước'}</span>
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

          {/* HỆ THỐNG 4 BƯỚC MIGRATION SQL & BẢO MẬT SUPABASE */}
          {showSqlGuide && (
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-slate-900 text-slate-100 p-4 sm:p-6 space-y-4 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30 uppercase">
                    Quy trình chuẩn hóa bảo mật 4 bước
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    Có BEGIN/COMMIT cho mỗi bước
                  </span>
                </div>
                <h4 className="text-base font-black text-amber-300 uppercase mt-1 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-amber-400" />
                  MÃ LỆNH SQL THIẾT LẬP CƠ SỞ DỮ LIỆU & BẢO MẬT SUPABASE
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Chọn từng bước bên dưới để xem chi tiết, sao chép mã và dán vào Supabase SQL Editor.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql/new`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>MỞ SUPABASE SQL EDITOR</span>
                </a>
              </div>
            </div>

            {/* Step Navigation Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveSqlStep(1)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeSqlStep === 1
                    ? 'bg-amber-950/80 border-amber-400 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black tracking-wider uppercase text-amber-400">Bước 1</span>
                  {copiedStepIndex === 1 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold text-slate-100">8 Bảng Dữ Liệu</div>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Khởi tạo cấu trúc các bảng</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveSqlStep(2)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeSqlStep === 2
                    ? 'bg-amber-950/80 border-amber-400 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black tracking-wider uppercase text-amber-400">Bước 2</span>
                  {copiedStepIndex === 2 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold text-slate-100">RLS & Bảo Mật</div>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Schema riêng, is_admin(), VIEWER</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveSqlStep(3)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeSqlStep === 3
                    ? 'bg-amber-950/80 border-amber-400 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black tracking-wider uppercase text-amber-400">Bước 3</span>
                  {copiedStepIndex === 3 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold text-slate-100">Gán ADMIN Đầu Tiên</div>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Dựa trên User UID Auth</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveSqlStep(4)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeSqlStep === 4
                    ? 'bg-amber-950/80 border-amber-400 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black tracking-wider uppercase text-amber-400">Bước 4</span>
                  {copiedStepIndex === 4 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold text-slate-100">Làm Sạch Mật Khẩu</div>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Sau khi ADMIN đã hoạt động</p>
              </button>
            </div>

            {/* Step Details & Code Block */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-emerald-300">
                    {activeSqlStep === 1 && 'Bước 1: Khởi tạo cấu trúc 8 bảng nghiệp vụ (BEGIN ... COMMIT)'}
                    {activeSqlStep === 2 && 'Bước 2: Phân quyền RLS, Schema app_security, Hàm is_admin() & Trigger cố định VIEWER (BEGIN ... COMMIT)'}
                    {activeSqlStep === 3 && 'Bước 3: Thiết lập tài khoản ADMIN đầu tiên theo User UID trong Supabase Auth (BEGIN ... COMMIT)'}
                    {activeSqlStep === 4 && 'Bước 4: Chuyển đổi tài khoản cũ & làm sạch mật khẩu đã lưu (BEGIN ... COMMIT)'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeSqlStep === 1 && 'Chạy lệnh này trước tiên để tạo các bảng lưu trữ trên Supabase PostgreSQL.'}
                    {activeSqlStep === 2 && 'Bảo vệ an toàn: Người đăng ký mới luôn là VIEWER; chỉ ADMIN đổi role người khác; tài khoản thường chỉ xem hồ sơ mình.'}
                    {activeSqlStep === 3 && 'Chủ dự án copy User UID của tài khoản Admin từ Auth -> Users, dán vào biến v_target_uuid và chạy lệnh. Không tự chọn tài khoản đầu tiên.'}
                    {activeSqlStep === 4 && 'Điều kiện tiên quyết: Chỉ chạy SAU KHI đã đăng nhập thành công bằng Auth và quyền ADMIN đã hoạt động.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const content = 
                      activeSqlStep === 1 ? SQL_STEP_1_TABLES_SCHEMA :
                      activeSqlStep === 2 ? SQL_STEP_2_SECURITY_AND_RLS :
                      activeSqlStep === 3 ? SQL_STEP_3_SET_FIRST_ADMIN :
                      SQL_STEP_4_MIGRATE_AND_CLEANUP;
                    const title = `SQL Bước ${activeSqlStep}`;
                    void handleCopyStep(activeSqlStep, content, title);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  {copiedStepIndex === activeSqlStep ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedStepIndex === activeSqlStep ? 'ĐÃ SAO CHÉP!' : `SAO CHÉP MÃ BƯỚC ${activeSqlStep}`}</span>
                </button>
              </div>

              <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-80 leading-relaxed select-all">
                {activeSqlStep === 1 && SQL_STEP_1_TABLES_SCHEMA}
                {activeSqlStep === 2 && SQL_STEP_2_SECURITY_AND_RLS}
                {activeSqlStep === 3 && SQL_STEP_3_SET_FIRST_ADMIN}
                {activeSqlStep === 4 && SQL_STEP_4_MIGRATE_AND_CLEANUP}
              </pre>
            </div>
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

      {/* Danh sách tài khoản cán bộ trên hệ thống */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  {currentUser.role === 'ADMIN' ? 'Quản Lý Danh Sách Tài Khoản Cán Bộ' : 'Hồ Sơ Cán Bộ Của Bạn'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {userList.length} tài khoản
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser.role === 'ADMIN'
                  ? 'Quản trị viên có quyền thay đổi vai trò (role) của cán bộ hoặc xóa tài khoản'
                  : 'Tài khoản thường chỉ có quyền xem hồ sơ của chính mình'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {currentUser.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => void handleSyncUsersToSupabase()}
                disabled={isSyncingUsers}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <ArrowUpFromLine className={`w-3.5 h-3.5 ${isSyncingUsers ? 'animate-bounce' : ''}`} />
                <span>{isSyncingUsers ? 'Đang lưu lên Supabase...' : 'Lưu tài khoản lên Supabase ngay'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => void refreshUsersList(true)}
              disabled={isLoadingUsers}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              <span>{isLoadingUsers ? 'Đang tải...' : 'Làm mới danh sách'}</span>
            </button>
          </div>
        </div>

        {usersLoadError && (
          <div className="mx-4 sm:mx-5 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Lỗi truy vấn danh sách tài khoản từ Supabase (public.users):</div>
              <p className="mt-0.5 font-mono text-[11px] text-rose-800 break-all">{usersLoadError}</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tên đăng nhập</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Vai trò (Phân quyền)</th>
                <th className="py-3 px-4">Chức vụ & Đơn vị</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Ngày tạo</th>
                {currentUser.role === 'ADMIN' && <th className="py-3 px-4 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {userList.length === 0 ? (
                <tr>
                  <td colSpan={currentUser.role === 'ADMIN' ? 7 : 6} className="py-8 text-center text-slate-400">
                    {usersLoadError
                      ? `Không thể tải danh sách tài khoản: ${usersLoadError}`
                      : 'Chưa có tài khoản nào được ghi nhận.'}
                  </td>
                </tr>
              ) : (
                userList.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {u.username || 'Chưa cập nhật'}
                        {isSelf && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            Bạn
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {u.fullName || 'Chưa cập nhật'}
                      </td>
                      <td className="py-3 px-4">
                        {currentUser.role === 'ADMIN' ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={u.role}
                              disabled={isSelf || isChangingRole === u.id}
                              onChange={(e) => void handleRoleChange(u.id, e.target.value as UserRole)}
                              className="text-xs font-bold py-1 px-2.5 rounded-lg border bg-white text-slate-800 border-slate-300 focus:outline-none focus:border-red-500 cursor-pointer disabled:bg-slate-100 disabled:opacity-75 disabled:cursor-not-allowed transition"
                              title={isSelf ? 'Không thể tự thay đổi vai trò của tài khoản đang đăng nhập' : 'Chọn để thay đổi vai trò'}
                            >
                              <option value="VIEWER">VIEWER (Tra cứu)</option>
                              <option value="MANAGER">MANAGER (Quản lý)</option>
                              <option value="ADMIN">ADMIN (Quản trị)</option>
                            </select>
                            {isChangingRole === u.id && (
                              <span className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin shrink-0" />
                            )}
                          </div>
                        ) : (
                          <span>
                            {u.role === 'ADMIN' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                                <Shield className="w-3 h-3" /> ADMIN
                              </span>
                            )}
                            {u.role === 'MANAGER' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                <UserCheck className="w-3 h-3" /> QUẢN LÝ
                              </span>
                            )}
                            {u.role === 'VIEWER' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <Users className="w-3 h-3" /> TRA CỨU
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{u.chucVu || 'Chưa cập nhật'}</div>
                        <div className="text-[11px] text-slate-400">{u.donVi || 'Chưa cập nhật'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {u.soDienThoai || 'Chưa cập nhật'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {formatUserDateVN(u.createdAt)}
                      </td>
                      {currentUser.role === 'ADMIN' && (
                        <td className="py-3 px-4 text-center">
                          {isSelf ? (
                            <span className="text-[11px] text-slate-400 italic">Hiện tại</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${u.username}" (${u.fullName}) không?`)) {
                                  const res = storageService.deleteUser(u.id, currentUser);
                                  if (res.success) {
                                    setUserList(storageService.getUsers(currentUser));
                                    onShowToast('Đã xóa tài khoản', `Đã xóa tài khoản "${u.username}" khỏi hệ thống.`, 'info');
                                  } else {
                                    onShowToast('Lỗi', res.error, 'error');
                                  }
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                              title="Xóa tài khoản này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Chú thích bảo mật */}
        <div className="p-4 bg-emerald-50/60 border-t border-emerald-200 text-xs text-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Bảo mật tài khoản xác thực Supabase Auth & RLS:</span>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                Tài khoản đăng ký mới luôn là <strong>VIEWER</strong>. Mật khẩu được mã hóa an toàn trên hệ thống Supabase Auth, tuyệt đối không gửi hay lưu mật khẩu vào bảng users. Hàm bảo mật nội bộ <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300">app_security.is_admin()</code> kiểm soát chặt chẽ quyền cập nhật vai trò người dùng.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <a
              href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/editor`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-900 font-bold text-[11px] shadow-xs transition flex items-center gap-1.5"
            >
              <span>Mở Table Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
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
