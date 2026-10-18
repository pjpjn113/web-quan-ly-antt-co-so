import React, { useState } from 'react';
import {
  Users,
  Shield,
  Award,
  Calendar,
  GraduationCap,
  MapPin,
  BarChart3,
  Check,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { NhanSu, DiaBanAp, ToANTT } from '../../types';
import { calculateAge, getAgeGroup } from '../../utils/helpers';

interface MemberFilterStatsProps {
  members: NhanSu[];
  filteredCount: number;
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  selectedAp: string;
  selectedChucVu: string;
  selectedAgeGroup: string;
  selectedHocVan: string;
  selectedChuyenMon: string;
  onSelectAp: (apId: string) => void;
  onSelectChucVu: (chucVu: string) => void;
  onSelectAgeGroup: (ageGroup: string) => void;
  onSelectHocVan: (hocVan: string) => void;
  onSelectChuyenMon: (chuyenMon: string) => void;
  onResetFilters: () => void;
  onOpenSummaryModal: () => void;
}

type StatCategoryTab = 'chuc_vu' | 'nhom_tuoi' | 'ap' | 'trinh_do';

export const MemberFilterStats: React.FC<MemberFilterStatsProps> = ({
  members,
  filteredCount,
  diaBanList,
  selectedAp,
  selectedChucVu,
  selectedAgeGroup,
  selectedHocVan,
  selectedChuyenMon,
  onSelectAp,
  onSelectChucVu,
  onSelectAgeGroup,
  onSelectHocVan,
  onSelectChuyenMon,
  onResetFilters,
  onOpenSummaryModal,
}) => {
  const [activeTab, setActiveTab] = useState<StatCategoryTab>('chuc_vu');
  const [isExpanded, setIsExpanded] = useState(true);
  const [apClusterFilter, setApClusterFilter] = useState<'ALL' | 'AN' | 'TAN'>('ALL');

  // Active members only
  const activeMembers = members.filter(m => m.trang_thai !== 'da_xoa');
  const totalCount = activeMembers.length;

  // 1. Chức vụ counts
  const toTruongCount = activeMembers.filter(m => m.chuc_vu === 'Tổ trưởng').length;
  const toPhoCount = activeMembers.filter(m => m.chuc_vu === 'Tổ phó').length;
  const thanhVienCount = activeMembers.filter(m => m.chuc_vu === 'Thành viên').length;

  // 2. Nhóm tuổi counts
  const ageGroupKeys = ['18–30', '31–45', '46–60', '61–70', 'Trên 70'] as const;
  const ageGroupCounts: Record<string, number> = {
    '18–30': 0,
    '31–45': 0,
    '46–60': 0,
    '61–70': 0,
    'Trên 70': 0,
  };
  activeMembers.forEach(m => {
    const age = calculateAge(m.ngay_sinh);
    const grp = getAgeGroup(age);
    if (grp in ageGroupCounts) {
      ageGroupCounts[grp]++;
    }
  });

  // 3. Trình độ học vấn counts
  const hocVanKeys = ['THPT', 'THCS', 'Tiểu học', 'Khác'];
  const hocVanCounts: Record<string, number> = {
    'THPT': 0,
    'THCS': 0,
    'Tiểu học': 0,
    'Khác': 0,
  };
  activeMembers.forEach(m => {
    const hv = m.trinh_do_hoc_van || 'Khác';
    if (hv in hocVanCounts) {
      hocVanCounts[hv]++;
    } else {
      hocVanCounts['Khác']++;
    }
  });

  // Trình độ chuyên môn counts
  const chuyenMonKeys = ['Đại học', 'Cao đẳng', 'Trung cấp', 'Sơ cấp', 'Chưa qua đào tạo'];
  const chuyenMonCounts: Record<string, number> = {
    'Đại học': 0,
    'Cao đẳng': 0,
    'Trung cấp': 0,
    'Sơ cấp': 0,
    'Chưa qua đào tạo': 0,
  };
  activeMembers.forEach(m => {
    const cm = m.trinh_do_chuyen_mon || 'Chưa qua đào tạo';
    if (cm in chuyenMonCounts) {
      chuyenMonCounts[cm]++;
    } else {
      chuyenMonCounts['Chưa qua đào tạo']++;
    }
  });

  // 4. Ấp counts (19 ấp)
  const apCountsMap = new Map<string, number>();
  diaBanList.forEach(ap => apCountsMap.set(ap.id, 0));
  activeMembers.forEach(m => {
    if (m.ap_id && apCountsMap.has(m.ap_id)) {
      apCountsMap.set(m.ap_id, (apCountsMap.get(m.ap_id) || 0) + 1);
    }
  });

  // Filtered hamlets for display
  const displayedAps = diaBanList.filter(ap => {
    if (apClusterFilter === 'AN') return ap.ten_ap.toLowerCase().includes('an ');
    if (apClusterFilter === 'TAN') return ap.ten_ap.toLowerCase().includes('tân ');
    return true;
  });

  // Has any active filter
  const hasActiveFilter =
    selectedAp !== 'all' ||
    selectedChucVu !== 'all' ||
    selectedAgeGroup !== 'all' ||
    selectedHocVan !== 'all' ||
    selectedChuyenMon !== 'all';

  const selectedApName = diaBanList.find(a => a.id === selectedAp)?.ten_ap;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar of the breakdown filter panel */}
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wide">
                LỌC & THỐNG KÊ SỐ LƯỢNG THÀNH VIÊN
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Toàn xã: {totalCount} đ/c
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Nhấp vào từng nhóm để lọc tức thì danh sách nhân sự tương ứng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSummaryModal}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Mở bảng tổng hợp số lượng 19 ấp và xuất Excel"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bảng tổng hợp chi tiết</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title={isExpanded ? 'Thu gọn bảng thống kê' : 'Mở rộng bảng thống kê'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3.5 bg-slate-50/50">
          {/* Category Tabs Switcher */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('chuc_vu')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'chuc_vu'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Theo Chức vụ</span>
                {selectedChucVu !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('nhom_tuoi')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'nhom_tuoi'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Theo Nhóm tuổi</span>
                {selectedAgeGroup !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ap')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'ap'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Theo 19 Ấp</span>
                {selectedAp !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('trinh_do')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'trinh_do'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Theo Trình độ</span>
                {(selectedHocVan !== 'all' || selectedChuyenMon !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>
            </div>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={onResetFilters}
                className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Bỏ lọc ({filteredCount}/{totalCount})</span>
              </button>
            )}
          </div>

          {/* TAB 1: THEO CHỨC VỤ */}
          {activeTab === 'chuc_vu' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => onSelectChucVu('all')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedChucVu === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold opacity-90">Tất cả chức vụ</span>
                  {selectedChucVu === 'all' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xl font-black">{totalCount}</span>
                  <span className="text-[11px] opacity-75">thành viên</span>
                </div>
                <div className="text-[10px] opacity-60 mt-0.5">100% quân số</div>
              </button>

              <button
                type="button"
                onClick={() => onSelectChucVu(selectedChucVu === 'Tổ trưởng' ? 'all' : 'Tổ trưởng')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedChucVu === 'Tổ trưởng'
                    ? 'bg-red-700 text-white border-red-700 shadow-xs ring-2 ring-red-400'
                    : 'bg-white text-slate-800 border-red-200 hover:border-red-400 hover:bg-red-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 group-hover:text-red-800">
                    🎖️ Tổ trưởng
                  </span>
                  {selectedChucVu === 'Tổ trưởng' && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-red-600">{toTruongCount}</span>
                  <span className="text-[11px] opacity-75">đồng chí</span>
                </div>
                <div className="text-[10px] opacity-60 mt-0.5">
                  {totalCount > 0 ? Math.round((toTruongCount / totalCount) * 100) : 0}% quân số
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectChucVu(selectedChucVu === 'Tổ phó' ? 'all' : 'Tổ phó')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedChucVu === 'Tổ phó'
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs ring-2 ring-blue-400'
                    : 'bg-white text-slate-800 border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700">
                    🎖️ Tổ phó
                  </span>
                  {selectedChucVu === 'Tổ phó' && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-blue-600">{toPhoCount}</span>
                  <span className="text-[11px] opacity-75">đồng chí</span>
                </div>
                <div className="text-[10px] opacity-60 mt-0.5">
                  {totalCount > 0 ? Math.round((toPhoCount / totalCount) * 100) : 0}% quân số
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectChucVu(selectedChucVu === 'Thành viên' ? 'all' : 'Thành viên')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedChucVu === 'Thành viên'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400'
                    : 'bg-white text-slate-800 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700">
                    🛡️ Thành viên
                  </span>
                  {selectedChucVu === 'Thành viên' && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-emerald-600">{thanhVienCount}</span>
                  <span className="text-[11px] opacity-75">đồng chí</span>
                </div>
                <div className="text-[10px] opacity-60 mt-0.5">
                  {totalCount > 0 ? Math.round((thanhVienCount / totalCount) * 100) : 0}% quân số
                </div>
              </button>
            </div>
          )}

          {/* TAB 2: THEO NHÓM TUỔI */}
          {activeTab === 'nhom_tuoi' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectAgeGroup('all')}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedAgeGroup === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-[11px] font-semibold opacity-90">Tất cả tuổi</span>
                  <span className="text-lg font-black mt-0.5 block">{totalCount}</span>
                  <span className="text-[10px] opacity-60">100%</span>
                </button>

                {ageGroupKeys.map(grp => {
                  const count = ageGroupCounts[grp] || 0;
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  const isSelected = selectedAgeGroup === grp;

                  return (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => onSelectAgeGroup(isSelected ? 'all' : grp)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'bg-blue-700 text-white border-blue-700 shadow-xs ring-2 ring-blue-300'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <span className="block text-[11px] font-bold truncate">{grp} tuổi</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-black">{count}</span>
                        <span className="text-[10px] opacity-75">đ/c</span>
                      </div>
                      <span className="text-[10px] opacity-60">{pct}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: THEO 19 ẤP */}
          {activeTab === 'ap' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              {/* Cluster quick switcher */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setApClusterFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    apClusterFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tất cả 19 Ấp
                </button>
                <button
                  type="button"
                  onClick={() => setApClusterFilter('AN')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    apClusterFilter === 'AN'
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  Cụm Ấp An (8 ấp)
                </button>
                <button
                  type="button"
                  onClick={() => setApClusterFilter('TAN')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    apClusterFilter === 'TAN'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Cụm Ấp Tân (11 ấp)
                </button>

                {selectedAp !== 'all' && (
                  <button
                    type="button"
                    onClick={() => onSelectAp('all')}
                    className="ml-auto px-2 py-0.5 rounded text-[11px] text-red-600 hover:text-red-700 font-semibold"
                  >
                    Xem tất cả ấp
                  </button>
                )}
              </div>

              {/* Hamlets pills grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                {displayedAps.map(ap => {
                  const count = apCountsMap.get(ap.id) || 0;
                  const isSelected = selectedAp === ap.id;

                  return (
                    <button
                      key={ap.id}
                      type="button"
                      onClick={() => onSelectAp(isSelected ? 'all' : ap.id)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between gap-1.5 transition ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block text-xs font-bold truncate">{ap.ten_ap}</span>
                        <span className="text-[10px] opacity-60 font-mono">{ap.ma_ap}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${
                        isSelected
                          ? 'bg-red-500 text-white'
                          : count > 0
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-slate-50 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: THEO TRÌNH ĐỘ */}
          {activeTab === 'trinh_do' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Học vấn */}
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  1. Trình độ học vấn phổ thông
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectHocVan('all')}
                    className={`p-2 rounded-xl border text-left transition ${
                      selectedHocVan === 'all'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-semibold block">Tất cả học vấn</span>
                    <span className="text-base font-black mt-0.5 block">{totalCount}</span>
                  </button>

                  {hocVanKeys.map(hv => {
                    const count = hocVanCounts[hv] || 0;
                    const isSelected = selectedHocVan === hv;

                    return (
                      <button
                        key={hv}
                        type="button"
                        onClick={() => onSelectHocVan(isSelected ? 'all' : hv)}
                        className={`p-2 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-300'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                      >
                        <span className="text-xs font-bold block">{hv}</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-black">{count}</span>
                          <span className="text-[10px] opacity-70">đ/c</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chuyên môn */}
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  2. Trình độ đào tạo chuyên môn
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectChuyenMon('all')}
                    className={`p-2 rounded-xl border text-left transition ${
                      selectedChuyenMon === 'all'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-semibold block">Tất cả</span>
                    <span className="text-base font-black mt-0.5 block">{totalCount}</span>
                  </button>

                  {chuyenMonKeys.map(cm => {
                    const count = chuyenMonCounts[cm] || 0;
                    const isSelected = selectedChuyenMon === cm;

                    return (
                      <button
                        key={cm}
                        type="button"
                        onClick={() => onSelectChuyenMon(isSelected ? 'all' : cm)}
                        className={`p-2 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-indigo-700 text-white border-indigo-700 ring-2 ring-indigo-300'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span className="text-xs font-bold block truncate" title={cm}>{cm}</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-black">{count}</span>
                          <span className="text-[10px] opacity-70">đ/c</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Active filter summary pill tags */}
          {hasActiveFilter && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="font-semibold text-slate-500">Đang lọc theo:</span>

                {selectedAp !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                    <span>Ấp: {selectedApName || selectedAp}</span>
                    <button type="button" onClick={() => onSelectAp('all')} className="hover:text-red-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedChucVu !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-800 font-bold flex items-center gap-1">
                    <span>Chức vụ: {selectedChucVu}</span>
                    <button type="button" onClick={() => onSelectChucVu('all')} className="hover:text-red-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedAgeGroup !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                    <span>Nhóm tuổi: {selectedAgeGroup}</span>
                    <button type="button" onClick={() => onSelectAgeGroup('all')} className="hover:text-red-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedHocVan !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                    <span>Học vấn: {selectedHocVan}</span>
                    <button type="button" onClick={() => onSelectHocVan('all')} className="hover:text-red-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedChuyenMon !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-bold flex items-center gap-1">
                    <span>Chuyên môn: {selectedChuyenMon}</span>
                    <button type="button" onClick={() => onSelectChuyenMon('all')} className="hover:text-red-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <div className="text-xs font-bold text-slate-700">
                Tìm thấy <span className="text-red-600">{filteredCount}</span> thành viên phù hợp
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
