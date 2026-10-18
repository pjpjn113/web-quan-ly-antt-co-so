import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  User, 
  LogOut, 
  Menu, 
  Clock, 
  ShieldCheck, 
  Eye,
  Cloud,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { UserAccount } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { formatDateTimeVN } from '../../utils/helpers';
import { storageService, SupabaseSyncStatus } from '../../services/storage';

interface HeaderProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onToggleSidebar: () => void;
  needUpdateCount?: number;
  onOpenSupabaseConfig?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onToggleSidebar,
  onOpenSupabaseConfig,
}) => {
  const [syncStatus, setSyncStatus] = useState<SupabaseSyncStatus>('checking');
  const [syncMessage, setSyncMessage] = useState<string>('Đang kết nối Supabase...');

  useEffect(() => {
    const unsubscribe = storageService.subscribeSyncStatus((status, message) => {
      setSyncStatus(status);
      setSyncMessage(message);
    });
    return unsubscribe;
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-500/20 text-red-300 border border-red-500/40 tracking-wider">
            <ShieldCheck className="w-3 h-3 text-red-400" />
            ADMIN
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40 tracking-wider">
            <Shield className="w-3 h-3 text-blue-400" />
            CÁN BỘ QUẢN LÝ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-600/30 text-slate-300 border border-slate-500/40 tracking-wider">
            <Eye className="w-3 h-3 text-slate-400" />
            TRA CỨU (VIEWER)
          </span>
        );
    }
  };

  const renderSupabaseBadge = () => {
    if (syncStatus === 'connected_ready') {
      return (
        <button
          type="button"
          onClick={onOpenSupabaseConfig}
          title={syncMessage}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Supabase: Đã kết nối</span>
        </button>
      );
    }

    if (syncStatus === 'connected_missing_tables') {
      return (
        <button
          type="button"
          onClick={onOpenSupabaseConfig}
          title="Nhấn vào đây để lấy mã lệnh SQL khởi tạo bảng trên Supabase"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-[11px] font-bold transition cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Supabase: Cần tạo bảng SQL</span>
        </button>
      );
    }

    if (syncStatus === 'checking' || syncStatus === 'syncing') {
      return (
        <button
          type="button"
          onClick={onOpenSupabaseConfig}
          title={syncMessage}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-500/15 border border-sky-400/40 text-sky-300 text-[11px] font-bold transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
          <span className="hidden md:inline">Supabase: Đang đồng bộ...</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={onOpenSupabaseConfig}
        title={syncMessage}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[11px] font-bold transition cursor-pointer"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        <span className="hidden md:inline">Supabase: Kiểm tra kết nối</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Police Red-Gold Line Accent */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />

      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left branding & menu button */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            type="button"
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition lg:hidden"
            aria-label="Mở danh mục"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            {/* Huy hiệu Công an nhân dân Việt Nam chính thức */}
            <div className="relative shrink-0 flex items-center justify-center">
              <img
                src="/huyhieu_cand.svg"
                alt="Huy hiệu Công an nhân dân"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)] transition-transform duration-200 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                  CÔNG AN TỈNH ĐỒNG THÁP
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black tracking-wide bg-gradient-to-r from-red-700 to-red-800 text-amber-300 border border-amber-400/50 shadow-xs uppercase">
                  CÔNG AN XÃ LAI VUNG
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase truncate mt-0.5">
                QUẢN LÝ THÀNH VIÊN ANTT CƠ SỞ
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate hidden md:block">
                Lực lượng tham gia bảo vệ an ninh, trật tự ở cơ sở • Luật số 30/2023/QH15
              </p>
            </div>
          </div>
        </div>

        {/* Right side tools & user */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Supabase Connection Badge */}
          {renderSupabaseBadge()}

          {/* System Admin Contact Badge */}
          <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex items-center gap-1.5">
              <span>Quản lý HT: <strong className="text-white font-semibold">Trung tá Trần Thanh Tuấn</strong> – Phó Trưởng CAX</span>
              <span className="text-amber-400 font-bold">•</span>
              <a href="tel:0913344189" className="font-mono font-bold text-amber-300 hover:text-amber-200 hover:underline">
                0913344189
              </a>
            </div>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* User Account Info Pill */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                  {currentUser.fullName}
                </span>
                {getRoleBadge(currentUser.role)}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Đăng nhập: {formatDateTimeVN(currentUser.lastLoginAt || currentUser.createdAt)}</span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-inner">
              <User className="w-4 h-4 text-amber-300" />
            </div>

            {/* Logout button */}
            <button
              type="button"
              id="btn-logout"
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

