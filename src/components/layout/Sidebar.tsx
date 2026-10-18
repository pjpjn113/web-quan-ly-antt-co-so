import React from 'react';
import {
  LayoutDashboard,
  Users,
  MapPin,
  ShieldAlert,
  Search,
  FileSpreadsheet,
  Download,
  BarChart3,
  AlertTriangle,
  History,
  Database,
  Trash2,
  X,
  Siren,
  GraduationCap,
  Award,
  UserMinus
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavTab = 
  | 'dashboard'
  | 'members'
  | 'dismissed-members'
  | 'patrols'
  | 'training'
  | 'awards'
  | 'territories'
  | 'teams'
  | 'search'
  | 'import'
  | 'export'
  | 'reports'
  | 'need-update'
  | 'trash'
  | 'audit'
  | 'backup';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  userRole: UserRole;
  needUpdateCount: number;
  trashCount: number;
  totalMembersCount: number;
  dismissedMembersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  userRole,
  needUpdateCount,
  trashCount,
  totalMembersCount,
  dismissedMembersCount = 0,
}) => {
  const navItems = [
    {
      tab: 'dashboard' as NavTab,
      label: 'Bàn làm việc (Dashboard)',
      icon: LayoutDashboard,
      badge: null,
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'members' as NavTab,
      label: 'Quản lý nhân sự',
      icon: Users,
      badge: totalMembersCount > 0 ? totalMembersCount : null,
      badgeColor: 'bg-blue-900/60 text-blue-200 border-blue-700/50',
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'dismissed-members' as NavTab,
      label: 'Thôi tham gia (QĐ UBND)',
      icon: UserMinus,
      badge: dismissedMembersCount > 0 ? dismissedMembersCount : null,
      badgeColor: 'bg-red-950 text-red-300 border-red-700/50 font-bold',
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'patrols' as NavTab,
      label: 'Tuần tra & Phối hợp ANTT',
      icon: Siren,
      badge: 'Hàng ngày',
      badgeColor: 'bg-red-950 text-red-300 border-red-700/50',
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'training' as NavTab,
      label: 'Tập huấn nghiệp vụ',
      icon: GraduationCap,
      badge: null,
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'awards' as NavTab,
      label: 'Thi đua - Khen thưởng',
      icon: Award,
      badge: null,
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'territories' as NavTab,
      label: 'Quản lý địa bàn (Ấp)',
      icon: MapPin,
      badge: null,
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'teams' as NavTab,
      label: 'Quản lý Tổ ANTT',
      icon: ShieldAlert,
      badge: null,
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'search' as NavTab,
      label: 'Tìm kiếm nâng cao',
      icon: Search,
      badge: null,
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'import' as NavTab,
      label: 'Nhập Excel / CSV',
      icon: FileSpreadsheet,
      badge: 'XLSX',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700/50',
      allowedRoles: ['ADMIN', 'MANAGER'],
    },
    {
      tab: 'export' as NavTab,
      label: 'Xuất dữ liệu Excel',
      icon: Download,
      badge: null,
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'reports' as NavTab,
      label: 'Báo cáo & Thống kê',
      icon: BarChart3,
      badge: null,
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'need-update' as NavTab,
      label: 'Hồ sơ cần cập nhật',
      icon: AlertTriangle,
      badge: needUpdateCount > 0 ? needUpdateCount : null,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-600/50 animate-pulse',
      allowedRoles: ['ADMIN', 'MANAGER', 'VIEWER'],
    },
    {
      tab: 'trash' as NavTab,
      label: 'Thùng rác (Xóa mềm)',
      icon: Trash2,
      badge: trashCount > 0 ? trashCount : null,
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      allowedRoles: ['ADMIN', 'MANAGER'],
    },
    {
      tab: 'audit' as NavTab,
      label: 'Nhật ký hoạt động',
      icon: History,
      badge: null,
      allowedRoles: ['ADMIN', 'MANAGER'],
    },
    {
      tab: 'backup' as NavTab,
      label: 'Sao lưu & Phục hồi',
      icon: Database,
      badge: null,
      allowedRoles: ['ADMIN'],
    },
  ];

  const handleItemClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header on Mobile */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2.5">
            <img
              src="/huyhieu_cand.svg"
              alt="Huy hiệu CAND"
              className="w-8 h-8 object-contain drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">CÔNG AN TỈNH ĐỒNG THÁP</div>
              <div className="text-xs font-black text-amber-300 uppercase leading-tight mt-0.5">CÔNG AN XÃ LAI VUNG</div>
              <div className="text-[10px] text-slate-400">Quản lý ANTT cơ sở</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Modules list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Hệ Thống Nghiệp Vụ
          </div>

          {navItems.map((item) => {
            const isAllowed = item.allowedRoles.includes(userRole);
            if (!isAllowed) return null;

            const isActive = currentTab === item.tab;
            const Icon = item.icon;

            return (
              <button
                key={item.tab}
                id={`nav-item-${item.tab}`}
                type="button"
                onClick={() => handleItemClick(item.tab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-red-800 to-red-900 text-white shadow-md border border-red-600/40 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/50 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Phiên bản MVP 1.0</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Hoạt động
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-0.5">
            <div className="text-slate-300 font-semibold truncate">
              Quản lý: Trung tá Trần Thanh Tuấn
            </div>
            <div className="text-slate-400 flex items-center justify-between">
              <span>Phó Trưởng CA xã</span>
              <a href="tel:0913344189" className="text-amber-300 font-mono font-bold hover:underline">
                0913344189
              </a>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Luật Lực lượng tham gia bảo vệ ANTT ở cơ sở số 30/2023/QH15
          </p>
        </div>
      </aside>
    </>
  );
};
