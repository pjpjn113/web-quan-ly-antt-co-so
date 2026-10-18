import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Medal, 
  Sparkles, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Building2, 
  FileBadge, 
  X,
  UserCheck,
  Users,
  Zap,
  TrendingUp,
  FileText
} from 'lucide-react';
import { HoSoKhenThuong, LoaiKhenThuong, CapKhenThuong, NhanSu, UserAccount } from '../types';
import { storageService } from '../services/storage';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface AwardsManagementProps {
  currentUser: UserAccount;
  members: NhanSu[];
  onShowToast?: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }) => void;
}

export const AwardsManagement: React.FC<AwardsManagementProps> = ({
  currentUser,
  members,
  onShowToast,
}) => {
  const [awardList, setAwardList] = useState<HoSoKhenThuong[]>(() => storageService.getHoSoKhenThuongList());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all'); // DotXuat vs DinhKy
  const [filterLevel, setFilterLevel] = useState<string>('all'); // UBND_TINH, CONG_AN_TINH, UBND_XA
  const [filterYear, setFilterYear] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HoSoKhenThuong | null>(null);
  const [viewingItem, setViewingItem] = useState<HoSoKhenThuong | null>(null);
  const [deletingItem, setDeletingItem] = useState<HoSoKhenThuong | null>(null);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<Partial<HoSoKhenThuong>>({
    loai_khen_thuong: 'DotXuat',
    cap_khen_thuong: 'UBND_XA',
    so_quyet_dinh: '',
    ngay_quyet_dinh: todayStr,
    co_quan_ban_hanh: 'UBND xã Lai Vung',
    hinh_thuc: 'Giấy khen của Chủ tịch UBND xã Lai Vung',
    thanh_tich: '',
    doi_tuong: 'CaNhan',
    nhan_su_id: '',
    ten_nguoi_khen_thuong: '',
    so_luong_thanh_vien_khen_thuong: 1,
    danh_sach_thanh_vien_ids: [],
    tien_thuong: 500000,
    ghi_chu: '',
  });

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  const reloadData = () => {
    setAwardList(storageService.getHoSoKhenThuongList());
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return awardList.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (item.ten_nguoi_khen_thuong || '').toLowerCase().includes(q);
        const matchDecision = (item.so_quyet_dinh || '').toLowerCase().includes(q);
        const matchForm = (item.hinh_thuc || '').toLowerCase().includes(q);
        const matchAchievement = (item.thanh_tich || '').toLowerCase().includes(q);
        const matchAgency = (item.co_quan_ban_hanh || '').toLowerCase().includes(q);
        if (!matchName && !matchDecision && !matchForm && !matchAchievement && !matchAgency) {
          return false;
        }
      }

      // Type (Đột xuất vs Định kỳ)
      if (filterType !== 'all' && item.loai_khen_thuong !== filterType) {
        return false;
      }

      // Level (UBND Tỉnh, Công an Tỉnh, UBND Xã)
      if (filterLevel !== 'all' && item.cap_khen_thuong !== filterLevel) {
        return false;
      }

      // Year
      if (filterYear !== 'all') {
        const year = item.ngay_quyet_dinh.split('-')[0];
        if (year !== filterYear) return false;
      }

      return true;
    });
  }, [awardList, searchQuery, filterType, filterLevel, filterYear]);

  // Statistics
  const stats = useMemo(() => {
    let totalAwards = awardList.length;
    let totalSpot = 0; // Đột xuất
    let totalPeriodic = 0; // Định kỳ
    let totalProvincial = 0; // Cấp tỉnh (UBND tỉnh)
    let totalPoliceProvincial = 0; // Cấp Công an tỉnh
    let totalCommune = 0; // Cấp UBND xã
    let totalMembersRewarded = 0;

    awardList.forEach(item => {
      if (item.loai_khen_thuong === 'DotXuat') totalSpot += 1;
      else totalPeriodic += 1;

      if (item.cap_khen_thuong === 'UBND_TINH') totalProvincial += 1;
      else if (item.cap_khen_thuong === 'CONG_AN_TINH') totalPoliceProvincial += 1;
      else totalCommune += 1;

      totalMembersRewarded += (Number(item.so_luong_thanh_vien_khen_thuong) || 1);
    });

    return {
      totalAwards,
      totalSpot,
      totalPeriodic,
      totalProvincial,
      totalPoliceProvincial,
      totalCommune,
      totalMembersRewarded,
    };
  }, [awardList]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      loai_khen_thuong: 'DotXuat',
      cap_khen_thuong: 'UBND_XA',
      so_quyet_dinh: `QĐ-${new Date().getFullYear()}/UBND`,
      ngay_quyet_dinh: todayStr,
      co_quan_ban_hanh: 'UBND xã Lai Vung',
      hinh_thuc: 'Giấy khen của Chủ tịch UBND xã Lai Vung',
      thanh_tich: 'Có thành tích xuất sắc, dũng cảm phối hợp cùng Công an xã vây bắt đối tượng trộm cắp tài sản trên địa bàn.',
      doi_tuong: 'CaNhan',
      nhan_su_id: members.length > 0 ? members[0].id : '',
      ten_nguoi_khen_thuong: members.length > 0 ? members[0].ho_ten : '',
      so_luong_thanh_vien_khen_thuong: 1,
      danh_sach_thanh_vien_ids: members.length > 0 ? [members[0].id] : [],
      tien_thuong: 500000,
      ghi_chu: 'Khen thưởng nóng động viên tinh thần cán bộ chiến sĩ cơ sở.',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: HoSoKhenThuong) => {
    setEditingItem(item);
    setFormData({
      ...item,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (item: HoSoKhenThuong) => {
    setDeletingItem(item);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    const soQD = deletingItem.so_quyet_dinh;
    storageService.deleteHoSoKhenThuong(deletingItem.id, currentUser);
    setDeletingItem(null);
    reloadData();
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Đã xóa hồ sơ khen thưởng',
        message: `Đã xóa quyết định ${soQD} khỏi hệ thống và Supabase.`,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.so_quyet_dinh?.trim()) {
      if (onShowToast) {
        onShowToast({
          type: 'warning',
          title: 'Thiếu thông tin bắt buộc',
          message: 'Vui lòng nhập số quyết định khen thưởng!',
        });
      }
      return;
    }

    // Auto calculate name if single member selected
    let targetName = formData.ten_nguoi_khen_thuong?.trim() || '';
    if (formData.doi_tuong === 'CaNhan' && formData.nhan_su_id) {
      const found = members.find(m => m.id === formData.nhan_su_id);
      if (found) targetName = found.ho_ten;
    }

    const payload: HoSoKhenThuong = {
      id: editingItem ? editingItem.id : 'kt_' + Date.now(),
      loai_khen_thuong: (formData.loai_khen_thuong as LoaiKhenThuong) || 'DotXuat',
      cap_khen_thuong: (formData.cap_khen_thuong as CapKhenThuong) || 'UBND_XA',
      so_quyet_dinh: formData.so_quyet_dinh.trim(),
      ngay_quyet_dinh: formData.ngay_quyet_dinh || todayStr,
      co_quan_ban_hanh: formData.co_quan_ban_hanh?.trim() || 'UBND xã Lai Vung',
      hinh_thuc: formData.hinh_thuc?.trim() || 'Giấy khen',
      thanh_tich: formData.thanh_tich?.trim() || 'Thành tích xuất sắc trong công tác bảo vệ ANTT cơ sở',
      ly_do_khen_thuong: formData.thanh_tich?.trim() || 'Thành tích xuất sắc trong công tác bảo vệ ANTT cơ sở',
      nam_khen_thuong: formData.ngay_quyet_dinh ? new Date(formData.ngay_quyet_dinh).getFullYear() : new Date().getFullYear(),
      nguoi_nhap: currentUser.fullName,
      doi_tuong: formData.doi_tuong || 'CaNhan',
      nhan_su_id: formData.doi_tuong === 'CaNhan' ? formData.nhan_su_id : undefined,
      ten_nguoi_khen_thuong: targetName,
      so_luong_thanh_vien_khen_thuong: Math.max(1, Number(formData.so_luong_thanh_vien_khen_thuong) || 1),
      danh_sach_thanh_vien_ids: formData.danh_sach_thanh_vien_ids || [],
      tien_thuong: Number(formData.tien_thuong) || 0,
      ghi_chu: formData.ghi_chu?.trim() || '',
      created_at: editingItem ? editingItem.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    storageService.saveHoSoKhenThuong(payload, currentUser);
    reloadData();
    setIsModalOpen(false);

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: editingItem ? 'Cập nhật thành công' : 'Thêm khen thưởng thành công',
        message: `Đã lưu hồ sơ khen thưởng QĐ số ${payload.so_quyet_dinh} cho ${payload.ten_nguoi_khen_thuong}.`,
      });
    }
  };

  // Helper date format
  const formatDateVN = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  // Preset level auto values
  const handleLevelChange = (level: CapKhenThuong) => {
    let agency = 'UBND xã Lai Vung';
    let form = 'Giấy khen của Chủ tịch UBND xã Lai Vung';
    if (level === 'UBND_TINH') {
      agency = 'UBND tỉnh Đồng Tháp';
      form = 'Bằng khen của Chủ tịch Ủy ban nhân dân tỉnh Đồng Tháp';
    } else if (level === 'CONG_AN_TINH') {
      agency = 'Công an tỉnh Đồng Tháp';
      form = 'Giấy khen của Giám đốc Công an tỉnh Đồng Tháp';
    }
    setFormData({
      ...formData,
      cap_khen_thuong: level,
      co_quan_ban_hanh: agency,
      hinh_thuc: form,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              CÔNG AN XÃ LAI VUNG – THI ĐUA KHEN THƯỞNG
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              QUẢN LÝ XÉT KHEN THƯỞNG LỰC LƯỢNG ANTT CƠ SỞ
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
              Theo dõi và quản lý các quyết định khen thưởng định kỳ và đột xuất cho cá nhân, tập thể thành viên bảo vệ ANTT cơ sở theo các hình thức cấp: UBND tỉnh Đồng Tháp, Công an tỉnh Đồng Tháp và UBND xã Lai Vung.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canManage && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-950/30 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Thêm quyết định khen thưởng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Statistics Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Decisions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số quyết định</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalAwards}</span>
            <span className="text-xs text-slate-500 font-semibold">quyết định</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">
              Đột xuất: {stats.totalSpot}
            </span>
            <span className="text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded">
              Định kỳ: {stats.totalPeriodic}
            </span>
          </div>
        </div>

        {/* Total Members Rewarded */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lượt thành viên khen thưởng</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalMembersRewarded}</span>
            <span className="text-xs text-slate-500 font-semibold">lượt đồng chí</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kịp thời tôn vinh gương sáng tiêu biểu</span>
          </div>
        </div>

        {/* Provincial & Police Awards */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khen thưởng Cấp Tỉnh</span>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalProvincial + stats.totalPoliceProvincial}</span>
            <span className="text-xs text-slate-500 font-semibold">Bằng khen / Giấy khen</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>UBND tỉnh: <strong className="text-red-700">{stats.totalProvincial}</strong></span>
            <span>Công an tỉnh: <strong className="text-blue-700">{stats.totalPoliceProvincial}</strong></span>
          </div>
        </div>

        {/* Commune Awards */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khen thưởng Cấp Xã</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Medal className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalCommune}</span>
            <span className="text-xs text-slate-500 font-semibold">Giấy khen UBND xã</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Chủ tịch UBND xã Lai Vung ban hành</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên, số QĐ, hình thức, thành tích..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Type (Đột xuất vs Định kỳ) */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="all">-- Tất cả loại khen thưởng --</option>
              <option value="DotXuat">⚡ Khen thưởng Đột xuất</option>
              <option value="DinhKy">📅 Khen thưởng Định kỳ (Tổng kết)</option>
            </select>
          </div>

          {/* Filter Level (UBND Tỉnh, Công an Tỉnh, UBND Xã) */}
          <div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="all">-- Tất cả hình thức / Cấp khen --</option>
              <option value="UBND_TINH">Cấp UBND tỉnh Đồng Tháp</option>
              <option value="CONG_AN_TINH">Cấp Công an tỉnh Đồng Tháp</option>
              <option value="UBND_XA">Cấp UBND xã Lai Vung</option>
            </select>
          </div>

          {/* Filter Year */}
          <div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="all">-- Mọi năm quyết định --</option>
              <option value="2026">Năm 2026</option>
              <option value="2025">Năm 2025</option>
              <option value="2024">Năm 2024</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Tìm thấy <strong className="text-slate-900 font-bold">{filteredList.length}</strong> hồ sơ khen thưởng</span>
          {(searchQuery || filterType !== 'all' || filterLevel !== 'all' || filterYear !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterLevel('all');
                setFilterYear('all');
              }}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main Awards Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">
              DANH SÁCH HỒ SƠ QUYẾT ĐỊNH KHEN THƯỞNG
            </h2>
          </div>
          <span className="text-xs bg-slate-200/80 text-slate-700 px-2.5 py-1 rounded-full font-bold">
            {filteredList.length} hồ sơ
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-base font-bold text-slate-600">Không tìm thấy quyết định khen thưởng nào</p>
            <p className="text-xs text-slate-400 mt-1">Hãy điều chỉnh bộ lọc hoặc thêm hồ sơ khen thưởng mới.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Quyết định & Ngày ban hành</th>
                  <th className="py-3.5 px-4">Loại & Cấp khen thưởng</th>
                  <th className="py-3.5 px-4">Đối tượng & Số thành viên</th>
                  <th className="py-3.5 px-4">Hình thức khen thưởng</th>
                  <th className="py-3.5 px-4">Thành tích xuất sắc</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredList.map((item) => {
                  const isDotXuat = item.loai_khen_thuong === 'DotXuat';
                  const capBadge = 
                    item.cap_khen_thuong === 'UBND_TINH' ? { text: 'Cấp UBND tỉnh', color: 'bg-red-50 text-red-700 border-red-200' } :
                    item.cap_khen_thuong === 'CONG_AN_TINH' ? { text: 'Cấp Công an tỉnh', color: 'bg-blue-50 text-blue-700 border-blue-200' } :
                    { text: 'Cấp UBND xã', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                      {/* Decision & Date */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <FileBadge className="w-4 h-4 text-amber-600" />
                          {item.so_quyet_dinh}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Ngày {formatDateVN(item.ngay_quyet_dinh)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Ban hành: {item.co_quan_ban_hanh}
                        </div>
                      </td>

                      {/* Type & Level */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isDotXuat 
                              ? 'bg-amber-50 text-amber-800 border-amber-300' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {isDotXuat ? <Zap className="w-3 h-3 text-amber-600" /> : <Calendar className="w-3 h-3 text-indigo-600" />}
                            {isDotXuat ? 'Đột xuất' : 'Định kỳ'}
                          </span>

                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${capBadge.color}`}>
                            {capBadge.text}
                          </span>
                        </div>
                      </td>

                      {/* Target & Member Count */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="font-bold text-slate-900 text-sm">
                          {item.ten_nguoi_khen_thuong || 'Tập thể'}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-slate-600 text-[11px]">
                          <Users className="w-3 h-3 text-blue-600" />
                          <span>{item.so_luong_thanh_vien_khen_thuong} thành viên được xét</span>
                        </div>
                        {item.doi_tuong === 'TapThe' && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                            Tập thể Tổ ANTT
                          </span>
                        )}
                      </td>

                      {/* Award Form */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="font-bold text-slate-800">
                          {item.hinh_thuc}
                        </div>
                        {item.tien_thuong && item.tien_thuong > 0 ? (
                          <div className="mt-1 text-emerald-700 font-bold text-[11px]">
                            Tiền thưởng: {item.tien_thuong.toLocaleString('vi-VN')} VNĐ
                          </div>
                        ) : null}
                      </td>

                      {/* Achievement */}
                      <td className="py-3.5 px-4 align-top max-w-md">
                        <p className="text-slate-700 leading-relaxed line-clamp-3">
                          {item.thanh_tich}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingItem(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Xem chi tiết quyết định"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                title="Chỉnh sửa hồ sơ"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Xóa quyết định"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal View Detail */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base uppercase">HỒ SƠ KHEN THƯỞNG CHI TIẾT</h3>
                  <p className="text-xs text-slate-500">Số QĐ: {viewingItem.so_quyet_dinh}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70">
                <span className="text-xs font-bold text-amber-800 uppercase block mb-1">Hình thức khen thưởng:</span>
                <h4 className="text-base font-black text-slate-900">{viewingItem.hinh_thuc}</h4>
                <p className="text-slate-600 mt-1">Cơ quan ban hành: <strong>{viewingItem.co_quan_ban_hanh}</strong></p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-xs">Loại khen thưởng:</span>
                  <span className="font-bold text-slate-900">
                    {viewingItem.loai_khen_thuong === 'DotXuat' ? '⚡ Đột xuất' : '📅 Định kỳ'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Cấp khen thưởng:</span>
                  <span className="font-bold text-slate-900">
                    {viewingItem.cap_khen_thuong === 'UBND_TINH' ? 'Cấp UBND tỉnh' : viewingItem.cap_khen_thuong === 'CONG_AN_TINH' ? 'Cấp Công an tỉnh' : 'Cấp UBND xã'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Ngày quyết định:</span>
                  <span className="font-bold text-slate-800">{formatDateVN(viewingItem.ngay_quyet_dinh)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Số thành viên xét:</span>
                  <span className="font-bold text-blue-700">{viewingItem.so_luong_thanh_vien_khen_thuong} thành viên</span>
                </div>
                {viewingItem.tien_thuong && viewingItem.tien_thuong > 0 ? (
                  <div>
                    <span className="text-slate-400 block text-xs">Tiền thưởng kèm theo:</span>
                    <span className="font-bold text-emerald-700">{viewingItem.tien_thuong.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                ) : null}
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">Đối tượng thụ hưởng:</strong>
                <p className="text-slate-900 font-bold text-base">{viewingItem.ten_nguoi_khen_thuong}</p>
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">Thành tích được ghi nhận khen thưởng:</strong>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 whitespace-pre-wrap leading-relaxed">
                  {viewingItem.thanh_tich}
                </p>
              </div>

              {viewingItem.ghi_chu && (
                <div>
                  <strong className="text-slate-800 block mb-1">Ghi chú:</strong>
                  <p className="text-slate-600 italic">{viewingItem.ghi_chu}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base uppercase">
                    {editingItem ? 'CHỈNH SỬA HỒ SƠ KHEN THƯỞNG' : 'THÊM HỒ SƠ QUYẾT ĐỊNH KHEN THƯỞNG'}
                  </h3>
                  <p className="text-xs text-slate-300">Công an xã Lai Vung – Thi đua khen thưởng lực lượng ANTT cơ sở</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
              {/* Row 1: Loại khen thưởng & Cấp khen thưởng */}
              <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-2xl space-y-3">
                <span className="font-bold text-amber-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-700" />
                  Phân loại & Cấp thẩm quyền khen thưởng
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Loại khen thưởng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.loai_khen_thuong}
                      onChange={(e) => setFormData({ ...formData, loai_khen_thuong: e.target.value as LoaiKhenThuong })}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-800"
                    >
                      <option value="DotXuat">⚡ Khen thưởng Đột xuất (lập công, vây bắt tội phạm...)</option>
                      <option value="DinhKy">📅 Khen thưởng Định kỳ (Sơ kết, Tổng kết năm...)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Cấp khen thưởng (Hình thức cấp) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.cap_khen_thuong}
                      onChange={(e) => handleLevelChange(e.target.value as CapKhenThuong)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-800"
                    >
                      <option value="UBND_TINH">Cấp UBND tỉnh Đồng Tháp (Bằng khen)</option>
                      <option value="CONG_AN_TINH">Cấp Công an tỉnh Đồng Tháp (Giấy khen)</option>
                      <option value="UBND_XA">Cấp UBND xã Lai Vung (Giấy khen)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2: Số QĐ, Ngày QĐ, Cơ quan ban hành */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số Quyết định <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.so_quyet_dinh}
                    onChange={(e) => setFormData({ ...formData, so_quyet_dinh: e.target.value })}
                    placeholder="VD: QĐ-124/QĐ-UBND"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngày quyết định <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.ngay_quyet_dinh}
                    onChange={(e) => setFormData({ ...formData, ngay_quyet_dinh: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cơ quan ban hành <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.co_quan_ban_hanh}
                    onChange={(e) => setFormData({ ...formData, co_quan_ban_hanh: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Hình thức khen thưởng */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hình thức khen thưởng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.hinh_thuc}
                  onChange={(e) => setFormData({ ...formData, hinh_thuc: e.target.value })}
                  placeholder="VD: Bằng khen của Chủ tịch UBND tỉnh / Giấy khen của Giám đốc Công an tỉnh / Giấy khen của UBND xã"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900"
                />
              </div>

              {/* Row 4: Đối tượng & Số lượng thành viên */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Đối tượng khen thưởng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.doi_tuong}
                    onChange={(e) => setFormData({ ...formData, doi_tuong: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  >
                    <option value="CaNhan">Cá nhân thành viên</option>
                    <option value="TapThe">Tập thể Tổ ANTT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số thành viên được xét <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.so_luong_thanh_vien_khen_thuong}
                    onChange={(e) => setFormData({ ...formData, so_luong_thanh_vien_khen_thuong: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tiền thưởng kèm theo (VNĐ):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.tien_thuong}
                    onChange={(e) => setFormData({ ...formData, tien_thuong: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Row 5: Chọn cá nhân thành viên hoặc tên tập thể */}
              {formData.doi_tuong === 'CaNhan' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chọn thành viên ANTT cơ sở được khen thưởng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.nhan_su_id}
                    onChange={(e) => {
                      const selectedMember = members.find(m => m.id === e.target.value);
                      setFormData({
                        ...formData,
                        nhan_su_id: e.target.value,
                        ten_nguoi_khen_thuong: selectedMember ? selectedMember.ho_ten : '',
                        danh_sach_thanh_vien_ids: [e.target.value],
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  >
                    <option value="">-- Chọn thành viên từ danh sách nhân sự --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.ho_ten} ({m.ma_nhan_su}) - {m.chuc_vu}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên tập thể được khen thưởng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ten_nguoi_khen_thuong}
                    onChange={(e) => setFormData({ ...formData, ten_nguoi_khen_thuong: e.target.value })}
                    placeholder="VD: Tập thể Tổ bảo vệ an ninh, trật tự ấp Tân Lộc B"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900"
                  />
                </div>
              )}

              {/* Row 6: Thành tích xuất sắc */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung thành tích xuất sắc được khen thưởng <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.thanh_tich}
                  onChange={(e) => setFormData({ ...formData, thanh_tich: e.target.value })}
                  placeholder="Ghi rõ hành động dũng cảm, thành tích cụ thể: Tham gia bắt đối tượng truy nã, dập tắt đám cháy cứu người, vây bắt đối tượng cướp giật, thành tích xuất sắc trong phong trào toàn dân bảo vệ ANTQ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed text-slate-800"
                />
              </div>

              {/* Row 7: Ghi chú */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi chú:
                </label>
                <input
                  type="text"
                  value={formData.ghi_chu}
                  onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
                  placeholder="VD: Đã trao tại hội nghị sơ kết công tác Công an..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95"
                >
                  {editingItem ? 'Lưu thay đổi' : 'Lưu hồ sơ khen thưởng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa hồ sơ khen thưởng */}
      <ConfirmModal
        isOpen={!!deletingItem}
        title="Xác nhận xóa hồ sơ khen thưởng"
        message={`Đồng chí có chắc chắn muốn xóa quyết định khen thưởng số "${deletingItem?.so_quyet_dinh}" (${deletingItem?.ten_nguoi_khen_thuong || 'Tập thể'}) khỏi hệ thống và Supabase không?`}
        confirmLabel="Xác nhận xóa"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};
