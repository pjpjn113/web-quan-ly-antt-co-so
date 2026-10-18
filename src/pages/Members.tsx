import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Download,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  BarChart3,
  UserMinus,
  FileText,
  FileCheck2,
  Building2,
  Calendar,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { 
  NhanSu, 
  DiaBanAp, 
  ToANTT, 
  UserAccount, 
  FilterParams,
  DismissMemberData
} from '../types';
import { calculateAge, getAgeGroup, formatDateVN, getMemberServiceDuration } from '../utils/helpers';
import { maskCCCD, maskPhoneNumber } from '../utils/security';
import { MemberFilterStats } from '../components/members/MemberFilterStats';
import { MemberSummaryModal } from '../components/members/MemberSummaryModal';
import { DismissMemberModal } from '../components/members/DismissMemberModal';
import { DismissalDecisionModal } from '../components/members/DismissalDecisionModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { storageService } from '../services/storage';
import { excelService } from '../services/excelService';

interface MembersProps {
  members: NhanSu[];
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  currentUser: UserAccount;
  onAddMember: () => void;
  onEditMember: (member: NhanSu) => void;
  onDeleteMember: (member: NhanSu) => void;
  onViewMember: (member: NhanSu) => void;
  initialFilter?: Partial<FilterParams>;
  initialStatusTab?: 'dang_hoat_dong' | 'da_thoi_viec' | 'all';
  onNavigateToImport?: () => void;
  onNavigateToExport?: () => void;
  onReloadData?: () => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const Members: React.FC<MembersProps> = ({
  members,
  diaBanList,
  toANTTList,
  currentUser,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onViewMember,
  initialFilter,
  initialStatusTab,
  onNavigateToImport,
  onNavigateToExport,
  onReloadData,
  onShowToast,
}) => {
  // Trạng thái tab hiển thị: Quân số đang hoạt động / Đã cho thôi tham gia (QĐ UBND xã) / Tất cả
  const [statusTab, setStatusTab] = useState<'dang_hoat_dong' | 'da_thoi_viec' | 'all'>(
    initialStatusTab || (initialFilter?.trang_thai === 'da_thoi_viec' ? 'da_thoi_viec' : 'dang_hoat_dong')
  );

  // Sync initialStatusTab if changed externally
  useEffect(() => {
    if (initialStatusTab) {
      setStatusTab(initialStatusTab);
    }
  }, [initialStatusTab]);

  // Modal cho thôi tham gia (nhập QĐ UBND)
  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  const [dismissingMember, setDismissingMember] = useState<NhanSu | null>(null);

  // Modal xem trích lục Quyết định thôi việc
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionMember, setDecisionMember] = useState<NhanSu | null>(null);

  // Modal xác nhận khôi phục thành viên đã thôi việc
  const [reactivatingMember, setReactivatingMember] = useState<NhanSu | null>(null);
  // Lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState(initialFilter?.searchQuery || '');
  const [selectedAp, setSelectedAp] = useState(initialFilter?.ap_id || 'all');
  const [selectedTo, setSelectedTo] = useState(initialFilter?.to_antt_id || 'all');
  const [selectedChucVu, setSelectedChucVu] = useState(initialFilter?.chuc_vu || 'all');
  const [selectedGioiTinh, setSelectedGioiTinh] = useState(initialFilter?.gioi_tinh || 'all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(initialFilter?.age_group || 'all');
  const [selectedDangVien, setSelectedDangVien] = useState(initialFilter?.dang_vien || 'all');
  const [selectedVNeID, setSelectedVNeID] = useState(initialFilter?.vneid_muc_2 || 'all');
  const [selectedBank, setSelectedBank] = useState(initialFilter?.co_tai_khoan || 'all');
  const [selectedHocVan, setSelectedHocVan] = useState(initialFilter?.trinh_do_hoc_van || 'all');
  const [selectedChuyenMon, setSelectedChuyenMon] = useState(initialFilter?.trinh_do_chuyen_mon || 'all');
  const [selectedKiemNhiem, setSelectedKiemNhiem] = useState(initialFilter?.chuc_vu_kiem_nhiem || 'all');
  const [selectedThamNien, setSelectedThamNien] = useState('all');
  
  // Hiển thị bộ lọc nâng cao
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // Modal hiển thị bảng tổng hợp số lượng 19 ấp và cơ cấu
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Bảo mật: Ẩn/hiện số CCCD
  const [revealSensitive, setRevealSensitive] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const apMap = useMemo(() => new Map(diaBanList.map(a => [a.id, a.ten_ap])), [diaBanList]);
  const toMap = useMemo(() => new Map(toANTTList.map(t => [t.id, t.ten_to])), [toANTTList]);

  // Phân loại quân số
  const activeWorkingMembers = useMemo(() => members.filter(m => m.trang_thai === 'dang_hoat_dong'), [members]);
  const dismissedMembers = useMemo(() => members.filter(m => m.trang_thai === 'da_thoi_viec'), [members]);
  const allNonDeletedMembers = useMemo(() => members.filter(m => m.trang_thai !== 'da_xoa'), [members]);

  // Quân số đang hoạt động dùng cho các bộ lọc phân tích
  const activeMembers = useMemo(() => {
    if (statusTab === 'da_thoi_viec') return dismissedMembers;
    if (statusTab === 'all') return allNonDeletedMembers;
    return activeWorkingMembers;
  }, [statusTab, dismissedMembers, allNonDeletedMembers, activeWorkingMembers]);

  // Handlers cho thôi tham gia và trích lục Quyết định
  const handleOpenDismiss = (member: NhanSu) => {
    setDismissingMember(member);
    setDismissModalOpen(true);
  };

  const handleConfirmDismiss = (memberId: string, data: DismissMemberData) => {
    storageService.dismissMember(memberId, data, currentUser);
    setDismissModalOpen(false);
    setDismissingMember(null);
    if (onReloadData) {
      onReloadData();
    }
    if (onShowToast) {
      onShowToast(
        'Ban hành QĐ cho thôi việc thành công',
        `Đã cập nhật Quyết định số ${data.so_quyet_dinh_thoi_viec} của UBND xã cho thôi tham gia đối với thành viên.`,
        'success'
      );
    }
  };

  const handleReactivate = (member: NhanSu) => {
    setReactivatingMember(member);
  };

  const handleConfirmReactivate = () => {
    if (!reactivatingMember) return;
    const memberName = reactivatingMember.ho_ten;
    storageService.reactivateMember(reactivatingMember.id, currentUser);
    setReactivatingMember(null);
    if (onReloadData) {
      onReloadData();
    }
    if (onShowToast) {
      onShowToast(
        'Khôi phục hoạt động thành công',
        `Đồng chí ${memberName} đã được chuyển về trạng thái đang hoạt động.`,
        'success'
      );
    }
  };

  const handleOpenDecision = (member: NhanSu) => {
    setDecisionMember(member);
    setDecisionModalOpen(true);
  };

  const handleExportDismissedExcel = () => {
    excelService.exportDismissedMembersToExcel(members, diaBanList, toANTTList);
    if (onShowToast) {
      onShowToast('Xuất Excel thành công', 'Đã tải xuống file danh sách thành viên thôi tham gia ANTT (theo QĐ UBND xã).');
    }
  };

  // Thống kê số lượng phục vụ hiển thị trực tiếp trên các bộ lọc
  const chucVuCounts = useMemo(() => ({
    toTruong: activeMembers.filter(m => m.chuc_vu === 'Tổ trưởng').length,
    toPho: activeMembers.filter(m => m.chuc_vu === 'Tổ phó').length,
    thanhVien: activeMembers.filter(m => m.chuc_vu === 'Thành viên').length,
  }), [activeMembers]);

  const apCounts = useMemo(() => {
    const map = new Map<string, number>();
    diaBanList.forEach(a => map.set(a.id, 0));
    activeMembers.forEach(m => {
      if (m.ap_id) {
        map.set(m.ap_id, (map.get(m.ap_id) || 0) + 1);
      }
    });
    return map;
  }, [activeMembers, diaBanList]);

  const ageGroupCounts = useMemo(() => {
    const counts: Record<string, number> = {
      '18–30': 0,
      '31–45': 0,
      '46–60': 0,
      '61–70': 0,
      'Trên 70': 0,
    };
    activeMembers.forEach(m => {
      const age = calculateAge(m.ngay_sinh);
      const grp = getAgeGroup(age);
      if (grp in counts) counts[grp]++;
    });
    return counts;
  }, [activeMembers]);

  const hocVanCounts = useMemo(() => {
    const counts: Record<string, number> = { 'THPT': 0, 'THCS': 0, 'Tiểu học': 0, 'Khác': 0 };
    activeMembers.forEach(m => {
      const hv = m.trinh_do_hoc_van || 'Khác';
      if (hv in counts) counts[hv]++;
      else counts['Khác']++;
    });
    return counts;
  }, [activeMembers]);

  const chuyenMonCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Đại học': 0,
      'Cao đẳng': 0,
      'Trung cấp': 0,
      'Sơ cấp': 0,
      'Chưa qua đào tạo': 0,
    };
    activeMembers.forEach(m => {
      const cm = m.trinh_do_chuyen_mon || 'Chưa qua đào tạo';
      if (cm in counts) counts[cm]++;
      else counts['Chưa qua đào tạo']++;
    });
    return counts;
  }, [activeMembers]);

  // Lọc danh sách nhân sự (chỉ lấy danh sách chưa bị xóa mềm)
  const filteredMembers = useMemo(() => {
    return members
      .filter(m => m.trang_thai !== 'da_xoa')
      .filter(m => {
        // Lọc theo trạng thái tab: Quân số hoạt động vs Đã cho thôi tham gia (QĐ UBND)
        if (statusTab === 'dang_hoat_dong') {
          if (m.trang_thai !== 'dang_hoat_dong') return false;
        } else if (statusTab === 'da_thoi_viec') {
          if (m.trang_thai !== 'da_thoi_viec') return false;
        }

        // Tìm kiếm theo Họ tên, CCCD, Số điện thoại, Mã nhân sự, hoặc Số Quyết định
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchName = m.ho_ten.toLowerCase().includes(q);
          const matchCCCD = m.so_cccd.includes(q);
          const matchPhone = m.so_dien_thoai.includes(q);
          const matchCode = m.ma_nhan_su.toLowerCase().includes(q);
          const matchQD = (m.so_quyet_dinh_thoi_viec || '').toLowerCase().includes(q);
          if (!matchName && !matchCCCD && !matchPhone && !matchCode && !matchQD) return false;
        }

        if (selectedAp !== 'all' && m.ap_id !== selectedAp) return false;
        if (selectedTo !== 'all' && m.to_antt_id !== selectedTo) return false;
        if (selectedChucVu !== 'all' && m.chuc_vu !== selectedChucVu) return false;
        if (selectedGioiTinh !== 'all' && m.gioi_tinh !== selectedGioiTinh) return false;
        if (selectedHocVan !== 'all' && m.trinh_do_hoc_van !== selectedHocVan) return false;
        if (selectedChuyenMon !== 'all' && m.trinh_do_chuyen_mon !== selectedChuyenMon) return false;

        if (selectedDangVien !== 'all') {
          const isDV = selectedDangVien === 'yes';
          if (m.dang_vien !== isDV) return false;
        }

        if (selectedVNeID !== 'all') {
          const isV = selectedVNeID === 'yes';
          if (m.vneid_muc_2 !== isV) return false;
        }

        if (selectedBank !== 'all') {
          const hasB = selectedBank === 'yes';
          if (m.co_tai_khoan !== hasB) return false;
        }

        if (selectedAgeGroup !== 'all') {
          const age = calculateAge(m.ngay_sinh);
          const grp = getAgeGroup(age);
          if (grp !== selectedAgeGroup) return false;
        }

        if (selectedKiemNhiem !== 'all') {
          if (selectedKiemNhiem === 'has_any') {
            if (!m.chuc_vu_kiem_nhiem || m.chuc_vu_kiem_nhiem === 'Không kiêm nhiệm') return false;
          } else if (selectedKiemNhiem === 'none') {
            if (m.chuc_vu_kiem_nhiem && m.chuc_vu_kiem_nhiem !== 'Không kiêm nhiệm') return false;
          } else {
            if (m.chuc_vu_kiem_nhiem !== selectedKiemNhiem) return false;
          }
        }

        // Lọc theo thâm niên tham gia lực lượng ANTT
        if (selectedThamNien !== 'all') {
          const duration = getMemberServiceDuration(m);
          if (!duration || !duration.isValid) return false;
          const totalMonths = duration.years * 12 + duration.months;
          if (selectedThamNien === '<6m' && totalMonths >= 6) return false;
          if (selectedThamNien === '6m-1y' && (totalMonths < 6 || totalMonths >= 12)) return false;
          if (selectedThamNien === '1y-2y' && (totalMonths < 12 || totalMonths >= 24)) return false;
          if (selectedThamNien === '>=2y' && totalMonths < 24) return false;
        }

        return true;
      });
  }, [
    members,
    statusTab,
    searchTerm,
    selectedAp,
    selectedTo,
    selectedChucVu,
    selectedKiemNhiem,
    selectedThamNien,
    selectedGioiTinh,
    selectedAgeGroup,
    selectedDangVien,
    selectedVNeID,
    selectedBank,
    selectedHocVan,
    selectedChuyenMon,
  ]);

  // Phân trang
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedAp('all');
    setSelectedTo('all');
    setSelectedChucVu('all');
    setSelectedKiemNhiem('all');
    setSelectedThamNien('all');
    setSelectedGioiTinh('all');
    setSelectedAgeGroup('all');
    setSelectedDangVien('all');
    setSelectedVNeID('all');
    setSelectedBank('all');
    setSelectedHocVan('all');
    setSelectedChuyenMon('all');
    setCurrentPage(1);
  };

  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  return (
    <div className="space-y-4">
      {/* Top Header & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                {statusTab === 'da_thoi_viec' 
                  ? 'DANH SÁCH THÀNH VIÊN ĐÃ CHO THÔI THAM GIA LỰC LƯỢNG ANTT CƠ SỞ'
                  : 'DANH SÁCH NHÂN SỰ LỰC LƯỢNG ANTT CƠ SỞ'}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                statusTab === 'da_thoi_viec' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {filteredMembers.length} thành viên
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {statusTab === 'da_thoi_viec'
                ? 'Danh sách thành viên đã có Quyết định cho thôi tham gia của UBND cấp xã (…/QĐ-UBND)'
                : 'Quản lý hồ sơ, chức vụ, địa bàn công tác xã Lai Vung'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick open summary modal */}
            <button
              type="button"
              id="btn-open-summary"
              onClick={() => setShowSummaryModal(true)}
              className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              title="Xem bảng thống kê số lượng thành viên theo 19 ấp, nhóm tuổi, chức vụ và trình độ"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>BẢNG SỐ LƯỢNG 19 ẤP</span>
            </button>

            {/* Sensitive unmask toggle */}
            <button
              type="button"
              id="btn-toggle-mask"
              onClick={() => setRevealSensitive(!revealSensitive)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Ẩn/Hiện số CCCD trên bảng danh sách"
            >
              {revealSensitive ? <EyeOff className="w-3.5 h-3.5 text-slate-600" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
              <span className="hidden md:inline">{revealSensitive ? 'Ẩn CCCD' : 'Hiện CCCD'}</span>
            </button>

            {statusTab === 'da_thoi_viec' ? (
              <button
                type="button"
                onClick={handleExportDismissedExcel}
                className="px-3 py-1.5 rounded-lg border border-red-300 text-red-800 bg-red-50 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                title="Xuất riêng danh sách thành viên thôi việc ra file Excel"
              >
                <Download className="w-3.5 h-3.5 text-red-600" />
                <span>Xuất Excel Thôi Việc</span>
              </button>
            ) : (
              <>
                {onNavigateToImport && canEdit && (
                  <button
                    type="button"
                    id="btn-nav-import"
                    onClick={onNavigateToImport}
                    className="px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nhập Excel</span>
                  </button>
                )}

                {onNavigateToExport && (
                  <button
                    type="button"
                    id="btn-nav-export"
                    onClick={onNavigateToExport}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden sm:inline">Xuất Excel</span>
                  </button>
                )}
              </>
            )}

            {canEdit && (
              <button
                type="button"
                id="btn-add-member"
                onClick={onAddMember}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>THÊM THÀNH VIÊN</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Tab Navigation Switcher */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => { setStatusTab('dang_hoat_dong'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
              statusTab === 'dang_hoat_dong'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Quân số đang hoạt động</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              statusTab === 'dang_hoat_dong' ? 'bg-emerald-900 text-emerald-100' : 'bg-white text-emerald-800 border border-slate-200'
            }`}>
              {activeWorkingMembers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setStatusTab('da_thoi_viec'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
              statusTab === 'da_thoi_viec'
                ? 'bg-red-700 text-white shadow-xs ring-2 ring-red-500/30'
                : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
            }`}
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Thành viên đã cho thôi tham gia (QĐ UBND xã)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              statusTab === 'da_thoi_viec' ? 'bg-red-950 text-red-100' : 'bg-red-200 text-red-900'
            }`}>
              {dismissedMembers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setStatusTab('all'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
              statusTab === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Tất cả quân số</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              statusTab === 'all' ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-700 border border-slate-200'
            }`}>
              {allNonDeletedMembers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Banner chuyên đề khi xem danh sách Đã cho thôi tham gia */}
      {statusTab === 'da_thoi_viec' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-red-900 text-white border border-red-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/30 border border-red-500/50 text-amber-300 shrink-0 mt-0.5">
              <UserMinus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                  DANH SÁCH THÀNH VIÊN ĐÃ CHO THÔI THAM GIA LỰC LƯỢNG ANTT CƠ SỞ (QĐ UBND CẤP XÃ)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white">
                  {dismissedMembers.length} thành viên đã có QĐ nghỉ
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Căn cứ Điều 17 Luật Lực lượng tham gia bảo vệ an ninh trật tự ở cơ sở số 30/2023/QH15. 
                Hệ thống quản lý đầy đủ <strong>Số Quyết định nghỉ của UBND xã (.../QĐ-UBND)</strong>, ngày ký ban hành, ngày thôi tham gia, lý do theo quy định và tình trạng bàn giao thẻ, trang phục, công cụ hỗ trợ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              type="button"
              onClick={handleExportDismissedExcel}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel DS thôi việc</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Quick Breakdown & Filter Component */}
      <MemberFilterStats
        members={members}
        filteredCount={filteredMembers.length}
        diaBanList={diaBanList}
        toANTTList={toANTTList}
        selectedAp={selectedAp}
        selectedChucVu={selectedChucVu}
        selectedAgeGroup={selectedAgeGroup}
        selectedHocVan={selectedHocVan}
        selectedChuyenMon={selectedChuyenMon}
        onSelectAp={apId => {
          setSelectedAp(apId);
          setCurrentPage(1);
        }}
        onSelectChucVu={chucVu => {
          setSelectedChucVu(chucVu);
          setCurrentPage(1);
        }}
        onSelectAgeGroup={ageGroup => {
          setSelectedAgeGroup(ageGroup);
          setCurrentPage(1);
        }}
        onSelectHocVan={hocVan => {
          setSelectedHocVan(hocVan);
          setCurrentPage(1);
        }}
        onSelectChuyenMon={chuyenMon => {
          setSelectedChuyenMon(chuyenMon);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        onOpenSummaryModal={() => setShowSummaryModal(true)}
      />

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-input"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm theo Họ tên, số CCCD, số điện thoại, mã nhân sự..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Quick Selectors: Ấp & Tổ & Chức vụ */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedAp}
              onChange={e => {
                setSelectedAp(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="all">Tất cả 19 Ấp ({activeMembers.length} đ/c)</option>
              {diaBanList.map(ap => {
                const count = apCounts.get(ap.id) || 0;
                return (
                  <option key={ap.id} value={ap.id}>
                    {ap.ten_ap} ({count} đ/c)
                  </option>
                );
              })}
            </select>

            <select
              value={selectedTo}
              onChange={e => {
                setSelectedTo(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="all">Tất cả Tổ ANTT ({toANTTList.length})</option>
              {toANTTList.map(to => (
                <option key={to.id} value={to.id}>{to.ten_to}</option>
              ))}
            </select>

            <select
              value={selectedChucVu}
              onChange={e => {
                setSelectedChucVu(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="all">Tất cả chức vụ ({activeMembers.length})</option>
              <option value="Tổ trưởng">Tổ trưởng ({chucVuCounts.toTruong} đ/c)</option>
              <option value="Tổ phó">Tổ phó ({chucVuCounts.toPho} đ/c)</option>
              <option value="Thành viên">Thành viên ({chucVuCounts.thanhVien} đ/c)</option>
            </select>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition ${
                showAdvancedFilters
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Bộ lọc chi tiết</span>
            </button>

            {(searchTerm || selectedAp !== 'all' || selectedTo !== 'all' || selectedChucVu !== 'all' || selectedKiemNhiem !== 'all' || selectedGioiTinh !== 'all' || selectedAgeGroup !== 'all' || selectedDangVien !== 'all' || selectedVNeID !== 'all' || selectedBank !== 'all' || selectedHocVan !== 'all' || selectedChuyenMon !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 text-slate-400 hover:text-red-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                title="Xóa bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 animate-in fade-in duration-150">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kiêm nhiệm</label>
              <select
                value={selectedKiemNhiem}
                onChange={e => { setSelectedKiemNhiem(e.target.value); setCurrentPage(1); }}
                className="w-full p-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800"
              >
                <option value="all">Tất cả kiêm nhiệm</option>
                <option value="has_any">Có kiêm nhiệm bất kỳ</option>
                <option value="none">Không kiêm nhiệm</option>
                <option value="Tổ trưởng dân phòng">Tổ trưởng dân phòng</option>
                <option value="Tổ phó dân phòng">Tổ phó dân phòng</option>
                <option value="Bí thư chi bộ ấp">Bí thư chi bộ ấp</option>
                <option value="Phó Bí thư chi bộ ấp">Phó Bí thư chi bộ ấp</option>
                <option value="Phó Trưởng ấp">Phó Trưởng ấp</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Giới tính</label>
              <select
                value={selectedGioiTinh}
                onChange={e => { setSelectedGioiTinh(e.target.value); setCurrentPage(1); }}
                className="w-full p-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Độ tuổi</label>
              <select
                value={selectedAgeGroup}
                onChange={e => { setSelectedAgeGroup(e.target.value); setCurrentPage(1); }}
                className="w-full p-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Tất cả nhóm tuổi ({activeMembers.length})</option>
                <option value="18–30">18–30 tuổi ({ageGroupCounts['18–30']} đ/c)</option>
                <option value="31–45">31–45 tuổi ({ageGroupCounts['31–45']} đ/c)</option>
                <option value="46–60">46–60 tuổi ({ageGroupCounts['46–60']} đ/c)</option>
                <option value="61–70">61–70 tuổi ({ageGroupCounts['61–70']} đ/c)</option>
                <option value="Trên 70">Trên 70 tuổi ({ageGroupCounts['Trên 70']} đ/c)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Học vấn</label>
              <select
                value={selectedHocVan}
                onChange={e => { setSelectedHocVan(e.target.value); setCurrentPage(1); }}
                className="w-full p-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Tất cả học vấn ({activeMembers.length})</option>
                <option value="THPT">THPT ({hocVanCounts['THPT']} đ/c)</option>
                <option value="THCS">THCS ({hocVanCounts['THCS']} đ/c)</option>
                <option value="Tiểu học">Tiểu học ({hocVanCounts['Tiểu học']} đ/c)</option>
                <option value="Khác">Khác ({hocVanCounts['Khác']} đ/c)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chuyên môn</label>
              <select
                value={selectedChuyenMon}
                onChange={e => { setSelectedChuyenMon(e.target.value); setCurrentPage(1); }}
                className="w-full p-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Tất cả chuyên môn ({activeMembers.length})</option>
                <option value="Đại học">Đại học ({chuyenMonCounts['Đại học']} đ/c)</option>
                <option value="Cao đẳng">Cao đẳng ({chuyenMonCounts['Cao đẳng']} đ/c)</option>
                <option value="Trung cấp">Trung cấp ({chuyenMonCounts['Trung cấp']} đ/c)</option>
                <option value="Sơ cấp">Sơ cấp ({chuyenMonCounts['Sơ cấp']} đ/c)</option>
                <option value="Chưa qua đào tạo">Chưa qua đào tạo ({chuyenMonCounts['Chưa qua đào tạo']} đ/c)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Đảng viên</label>
              <select
                value={selectedDangVien}
                onChange={e => { setSelectedDangVien(e.target.value); setCurrentPage(1); }}
                className="w-full p-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="yes">Là Đảng viên</option>
                <option value="no">Chưa vào Đảng</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">VNeID Mức 2</label>
              <select
                value={selectedVNeID}
                onChange={e => { setSelectedVNeID(e.target.value); setCurrentPage(1); }}
                className="w-full p-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="yes">Đã kích hoạt</option>
                <option value="no">Chưa kích hoạt</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">TK Ngân hàng</label>
              <select
                value={selectedBank}
                onChange={e => { setSelectedBank(e.target.value); setCurrentPage(1); }}
                className="w-full p-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="yes">Đã có tài khoản</option>
                <option value="no">Chưa có tài khoản</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-600" />
                <span>Thâm niên ANTT</span>
              </label>
              <select
                value={selectedThamNien}
                onChange={e => { setSelectedThamNien(e.target.value); setCurrentPage(1); }}
                className="w-full p-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800"
              >
                <option value="all">Tất cả thâm niên</option>
                <option value="<6m">Dưới 6 tháng</option>
                <option value="6m-1y">Từ 6 tháng - dưới 1 năm</option>
                <option value="1y-2y">Từ 1 năm - dưới 2 năm</option>
                <option value=">=2y">Từ 2 năm trở lên</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {statusTab === 'da_thoi_viec' ? (
                <tr className="bg-red-950 text-white font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3">Mã NS</th>
                  <th className="py-3 px-4">Họ và Tên (Ảnh 4x6)</th>
                  <th className="py-3 px-3 text-amber-300">Số QĐ Thôi Việc (…/QĐ-UBND)</th>
                  <th className="py-3 px-3">Ngày Ký / Ngày Nghỉ</th>
                  <th className="py-3 px-3 text-amber-200 whitespace-nowrap">Thời gian tham gia / cống hiến</th>
                  <th className="py-3 px-3">Lý do cho thôi tham gia</th>
                  <th className="py-3 px-3">Chức vụ trước khi thôi</th>
                  <th className="py-3 px-3">Địa bàn (Ấp)</th>
                  <th className="py-3 px-3 text-center">Bàn giao thẻ/TB</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              ) : (
                <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3">Mã NS</th>
                  <th className="py-3 px-4">Họ và Tên</th>
                  <th className="py-3 px-3">Năm sinh (Tuổi)</th>
                  <th className="py-3 px-3">Giới tính</th>
                  <th className="py-3 px-3">Số CCCD</th>
                  <th className="py-3 px-3">Chức vụ</th>
                  <th className="py-3 px-3 text-amber-300 whitespace-nowrap">Thời gian tham gia (Thâm niên)</th>
                  <th className="py-3 px-3">Địa bàn (Ấp)</th>
                  <th className="py-3 px-3">Tổ ANTT</th>
                  <th className="py-3 px-3 text-center">Đảng viên</th>
                  <th className="py-3 px-3 text-center">VNeID M2</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={statusTab === 'da_thoi_viec' ? 11 : 13} className="py-10 text-center text-slate-400">
                    {activeWorkingMembers.length === 0 && dismissedMembers.length === 0 ? (
                      <div className="max-w-lg mx-auto py-6 px-4 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
                          <Users className="w-7 h-7" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase">
                          Hệ thống hiện chưa có hồ sơ thành viên
                        </h4>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          Dữ liệu mẫu đã được xóa sạch theo yêu cầu quản lý. Đồng chí có thể bắt đầu tạo mới từng hồ sơ hoặc nạp danh sách chính thức từ file Excel (.xlsx).
                        </p>
                        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 w-full text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">
                              Quản lý hệ thống: Trung tá Trần Thanh Tuấn
                            </span>
                            <span className="text-[11px] text-slate-500">Phó Trưởng CA xã</span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span>Chi tiết liên hệ / hỗ trợ:</span>
                            <a href="tel:0913344189" className="text-red-700 font-mono font-bold hover:underline">
                              0913344189
                            </a>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={onAddMember}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                          >
                            + Thêm thành viên mới
                          </button>
                          {onNavigateToImport && (
                            <button
                              type="button"
                              onClick={onNavigateToImport}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
                            >
                              Nhập file Excel (.xlsx)
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">
                          Không tìm thấy hồ sơ thành viên nào phù hợp
                        </p>
                        <button
                          onClick={handleResetFilters}
                          className="text-xs text-red-600 hover:underline font-bold"
                        >
                          Đặt lại bộ lọc tìm kiếm
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member, idx) => {
                  const age = calculateAge(member.ngay_sinh);
                  const serviceDuration = getMemberServiceDuration(member);
                  const stt = (currentPage - 1) * pageSize + idx + 1;

                  // Giao diện dòng cho Thành viên Đã cho thôi tham gia (theo QĐ UBND xã)
                  if (statusTab === 'da_thoi_viec') {
                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-red-50/50 transition group"
                      >
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          {stt}
                        </td>

                        <td className="py-3 px-3 font-mono font-semibold text-red-700">
                          {member.ma_nhan_su}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {/* 4x6 Thumbnail */}
                            <div 
                              onClick={() => onViewMember(member)}
                              className="w-8 h-11 rounded overflow-hidden bg-slate-100 border border-slate-300 shrink-0 shadow-2xs flex items-center justify-center cursor-pointer hover:border-red-500 hover:ring-2 hover:ring-red-400/30 transition group"
                              title="Xem chi tiết hồ sơ & ảnh 4x6"
                            >
                              {member.anh_chan_dung ? (
                                <img
                                  src={member.anh_chan_dung}
                                  alt={member.ho_ten}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-100 group-hover:bg-red-50 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-red-700">
                                  {member.ho_ten.charAt(0)}
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onViewMember(member)}
                                  className="font-bold text-slate-900 hover:text-red-700 text-left transition uppercase"
                                >
                                  {member.ho_ten}
                                </button>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-red-100 text-red-800 border border-red-300">
                                  ĐÃ THÔI VIỆC
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>{maskPhoneNumber(member.so_dien_thoai)}</span>
                                <span>•</span>
                                <span>{formatDateVN(member.ngay_sinh)} ({age}t)</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Số QĐ Thôi Việc của UBND xã */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-red-100 text-red-900 border border-red-300 shadow-2xs">
                              {member.so_quyet_dinh_thoi_viec || 'Chưa nhập số QĐ'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {member.co_quan_ban_hanh_thoi_viec || 'UBND xã Lai Vung'}
                          </span>
                        </td>

                        {/* Ngày ký & Ngày thôi việc */}
                        <td className="py-3 px-3 whitespace-nowrap text-xs">
                          <div className="text-slate-800">
                            <span className="text-slate-400 text-[10px]">Ký: </span>
                            <strong className="text-slate-700">{formatDateVN(member.ngay_quyet_dinh_thoi_viec)}</strong>
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            <span className="text-slate-400 text-[10px]">Nghỉ: </span>
                            <span>{formatDateVN(member.ngay_thoi_viec)}</span>
                          </div>
                        </td>

                        {/* Thời gian tham gia cống hiến (Năm, Tháng, Ngày) */}
                        <td className="py-3 px-3 whitespace-nowrap text-xs">
                          {serviceDuration && serviceDuration.isValid ? (
                            <div>
                              <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="text-red-700 font-bold">{serviceDuration.formattedText}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                                Tổng cộng: <strong className="text-slate-800 font-mono">{serviceDuration.totalDays.toLocaleString('vi-VN')}</strong> ngày
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Từ {serviceDuration.startDateFormatted} đến {serviceDuration.endDateFormatted}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Chưa xác định</span>
                          )}
                        </td>

                        {/* Lý do cho thôi tham gia */}
                        <td className="py-3 px-3 text-xs max-w-xs">
                          <span 
                            className="line-clamp-2 text-slate-700 font-medium leading-snug"
                            title={member.ly_do_thoi_viec || 'Theo quyết định'}
                          >
                            {member.ly_do_thoi_viec || '—'}
                          </span>
                        </td>

                        {/* Chức vụ trước khi nghỉ */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-100 text-slate-700 border-slate-200">
                              {member.chuc_vu}
                            </span>
                            {member.chuc_vu_kiem_nhiem && member.chuc_vu_kiem_nhiem !== 'Không kiêm nhiệm' && (
                              <span className="text-[9px] text-indigo-700 font-semibold">
                                Kiêm: {member.chuc_vu_kiem_nhiem}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Địa bàn */}
                        <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap text-xs">
                          <div>{apMap.get(member.ap_id) || 'Chưa gán'}</div>
                          <div className="text-[10px] text-slate-400">{toMap.get(member.to_antt_id)}</div>
                        </td>

                        {/* Bàn giao thẻ / TB */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {member.da_thu_hoi_the_trang_thiet_bi !== false ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Đã thu hồi
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Chưa thu hồi
                            </span>
                          )}
                        </td>

                        {/* Thao tác cho thành viên thôi việc */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenDecision(member)}
                              className="p-1.5 rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition"
                              title="Xem & In Trích lục Quyết định của UBND cấp xã"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            {canEdit && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDismiss(member)}
                                  className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition"
                                  title="Chỉnh sửa thông tin Quyết định nghỉ"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleReactivate(member)}
                                  className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 transition"
                                  title="Khôi phục trở lại lực lượng ANTT cơ sở"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onDeleteMember(member)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                  title="Xóa mềm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // Dòng hiển thị mặc định cho Quân số hoạt động
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        {stt}
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-red-700">
                        {member.ma_nhan_su}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {/* 4x6 Thumbnail */}
                          <div 
                            onClick={() => onViewMember(member)}
                            className="w-8 h-11 rounded overflow-hidden bg-slate-100 border border-slate-300 shrink-0 shadow-2xs flex items-center justify-center cursor-pointer hover:border-red-500 hover:ring-2 hover:ring-red-400/30 transition group"
                            title="Xem chi tiết hồ sơ & ảnh 4x6"
                          >
                            {member.anh_chan_dung ? (
                              <img
                                src={member.anh_chan_dung}
                                alt={member.ho_ten}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-100 group-hover:bg-red-50 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-red-700">
                                {member.ho_ten.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onViewMember(member)}
                                className="font-bold text-slate-900 hover:text-red-700 text-left transition uppercase"
                              >
                                {member.ho_ten}
                              </button>
                              {member.is_demo && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                                  DEMO
                                </span>
                              )}
                              {member.trang_thai === 'da_thoi_viec' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-red-100 text-red-800 border border-red-300">
                                  ĐÃ THÔI VIỆC
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>{maskPhoneNumber(member.so_dien_thoai)}</span>
                              <span>•</span>
                              <span>{member.dan_toc}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {formatDateVN(member.ngay_sinh)}
                        </span>
                        <span className="ml-1 text-[11px] text-slate-500 font-bold">
                          ({age !== null ? `${age}t` : '—'})
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        {member.gioi_tinh}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-800 font-semibold whitespace-nowrap">
                        {revealSensitive ? member.so_cccd : maskCCCD(member.so_cccd)}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            member.chuc_vu === 'Tổ trưởng'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : member.chuc_vu === 'Tổ phó'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {member.chuc_vu}
                          </span>
                          {member.chuc_vu_kiem_nhiem && member.chuc_vu_kiem_nhiem !== 'Không kiêm nhiệm' && (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                              title={`Chức vụ kiêm nhiệm: ${member.chuc_vu_kiem_nhiem}`}
                            >
                              Kiêm: {member.chuc_vu_kiem_nhiem}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Thời gian tham gia (Thâm niên: Số năm, tháng, ngày) */}
                      <td className="py-3 px-3 whitespace-nowrap text-xs">
                        {serviceDuration && serviceDuration.isValid ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-extrabold text-slate-900 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                                {serviceDuration.formattedText}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <span>Tổng:</span>
                              <strong className="text-red-700 font-mono">{serviceDuration.totalDays.toLocaleString('vi-VN')}</strong>
                              <span>ngày</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              QĐ: {formatDateVN(member.ngay_tham_gia_antt)} {member.so_quyet_dinh ? `(${member.so_quyet_dinh})` : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Chưa cập nhật QĐ</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {apMap.get(member.ap_id) || 'Chưa gán'}
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {toMap.get(member.to_antt_id) || 'Chưa gán'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {member.dang_vien ? (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                            Đảng viên
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {member.vneid_muc_2 ? (
                          <span className="inline-flex items-center text-emerald-600 font-bold text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5 mr-0.5" />
                            Đạt
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-600 font-medium text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 mr-0.5" />
                            Chưa
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onViewMember(member)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Xem chi tiết trích lục"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Cho thôi việc nếu đang hoạt động */}
                          {canEdit && member.trang_thai === 'dang_hoat_dong' && (
                            <button
                              type="button"
                              onClick={() => handleOpenDismiss(member)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition"
                              title="Ban hành Quyết định cho thôi tham gia (QĐ UBND xã)"
                            >
                              <UserMinus className="w-4 h-4 text-rose-600" />
                            </button>
                          )}

                          {canEdit && (
                            <>
                              <button
                                type="button"
                                onClick={() => onEditMember(member)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                                title="Chỉnh sửa thông tin"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDeleteMember(member)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Xóa mềm (chuyển vào thùng rác)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-slate-300 rounded-lg bg-white font-semibold"
            >
              <option value={10}>10 dòng</option>
              <option value={25}>25 dòng</option>
              <option value={50}>50 dòng</option>
            </select>
            <span>trên tổng số <strong>{filteredMembers.length}</strong> kết quả</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 transition"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-800">
              Trang {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 transition"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Matrix Modal */}
      <MemberSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        members={members}
        diaBanList={diaBanList}
        toANTTList={toANTTList}
        onSelectApAndClose={apId => {
          setSelectedAp(apId);
          setCurrentPage(1);
        }}
        onSelectChucVuAndClose={chucVu => {
          setSelectedChucVu(chucVu);
          setCurrentPage(1);
        }}
      />

      {/* Modal Ban hành Quyết định cho thôi tham gia (UBND cấp xã) */}
      <DismissMemberModal
        isOpen={dismissModalOpen}
        member={dismissingMember}
        diaBanList={diaBanList}
        toANTTList={toANTTList}
        onClose={() => {
          setDismissModalOpen(false);
          setDismissingMember(null);
        }}
        onConfirm={handleConfirmDismiss}
      />

      {/* Modal Xem & In Trích lục Quyết định của UBND xã */}
      <DismissalDecisionModal
        isOpen={decisionModalOpen}
        member={decisionMember}
        diaBanList={diaBanList}
        toANTTList={toANTTList}
        onClose={() => {
          setDecisionModalOpen(false);
          setDecisionMember(null);
        }}
        onEditDecision={(m) => {
          setDecisionModalOpen(false);
          setDismissingMember(m);
          setDismissModalOpen(true);
        }}
      />

      {/* Modal Xác nhận Khôi phục thành viên */}
      <ConfirmModal
        isOpen={!!reactivatingMember}
        title="Xác nhận khôi phục thành viên"
        message={`Đồng chí có chắc chắn muốn khôi phục đồng chí "${reactivatingMember?.ho_ten}" (${reactivatingMember?.ma_nhan_su}) trở lại danh sách đang hoạt động lực lượng ANTT cơ sở xã Lai Vung?`}
        confirmLabel="Khôi phục hoạt động"
        variant="primary"
        onConfirm={handleConfirmReactivate}
        onCancel={() => setReactivatingMember(null)}
      />
    </div>
  );
};
