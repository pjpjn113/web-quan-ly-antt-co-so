import React, { useState, useMemo } from 'react';
import { 
  Siren, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  X,
  MapPin,
  Shield,
  FileText,
  UserCheck
} from 'lucide-react';
import { NhatKyTuanTra, CaTuanTra, NhanSu, DiaBanAp, UserAccount } from '../types';
import { storageService } from '../services/storage';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface PatrolManagementProps {
  currentUser: UserAccount;
  members: NhanSu[];
  diaBanList: DiaBanAp[];
  onShowToast?: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }) => void;
}

export const PatrolManagement: React.FC<PatrolManagementProps> = ({
  currentUser,
  members,
  diaBanList,
  onShowToast,
}) => {
  const [patrolList, setPatrolList] = useState<NhatKyTuanTra[]>(() => storageService.getNhatKyTuanTraList());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterAp, setFilterAp] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | '7days' | 'month'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NhatKyTuanTra | null>(null);
  const [viewingItem, setViewingItem] = useState<NhatKyTuanTra | null>(null);
  const [deletingItem, setDeletingItem] = useState<NhatKyTuanTra | null>(null);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<Partial<NhatKyTuanTra>>({
    ngay_tuan_tra: todayStr,
    ca_tuan_tra: 'Ca đêm (22h00 - 05h00)',
    so_cuoc_cong_khai: 1,
    so_cuoc_mat_phuc: 1,
    so_luot_thanh_vien: 4,
    danh_sach_thanh_vien_ids: [],
    can_bo_cong_an_phu_trach: 'Trung tá Trần Thanh Tuấn - Phó Trưởng Công an xã',
    ap_ids: [],
    tuyen_duong_dia_ban: '',
    so_vu_viec_giai_quyet: 1,
    noi_dung_phoi_hop: '',
    ket_qua_noi_bat: '',
    ghi_chu: '',
  });

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  const reloadData = () => {
    setPatrolList(storageService.getNhatKyTuanTraList());
  };

  // Filtered list
  const filteredList = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return patrolList.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchContent = (item.noi_dung_phoi_hop || '').toLowerCase().includes(q);
        const matchOfficer = (item.can_bo_cong_an_phu_trach || '').toLowerCase().includes(q);
        const matchRoad = (item.tuyen_duong_dia_ban || '').toLowerCase().includes(q);
        const matchNotes = (item.ghi_chu || '').toLowerCase().includes(q);
        const matchResult = (item.ket_qua_noi_bat || '').toLowerCase().includes(q);
        if (!matchContent && !matchOfficer && !matchRoad && !matchNotes && !matchResult) {
          return false;
        }
      }

      // Shift
      if (filterShift !== 'all' && item.ca_tuan_tra !== filterShift) {
        return false;
      }

      // Ap
      if (filterAp !== 'all' && !item.ap_ids.includes(filterAp)) {
        return false;
      }

      // Date Range
      if (filterDateRange !== 'all') {
        const itemDate = new Date(item.ngay_tuan_tra);
        itemDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 3600 * 24));

        if (filterDateRange === 'today' && diffDays !== 0) return false;
        if (filterDateRange === '7days' && (diffDays < 0 || diffDays > 7)) return false;
        if (filterDateRange === 'month' && (diffDays < 0 || diffDays > 30)) return false;
      }

      return true;
    });
  }, [patrolList, searchQuery, filterShift, filterAp, filterDateRange]);

  // Statistics
  const stats = useMemo(() => {
    let totalPatrols = 0;
    let totalPublic = 0;
    let totalCovert = 0;
    let totalMemberTurns = 0;
    let totalIncidentsResolved = 0;

    patrolList.forEach(item => {
      const publicCount = Number(item.so_cuoc_cong_khai) || 0;
      const covertCount = Number(item.so_cuoc_mat_phuc) || 0;
      totalPublic += publicCount;
      totalCovert += covertCount;
      totalPatrols += (publicCount + covertCount);
      totalMemberTurns += (Number(item.so_luot_thanh_vien) || 0);
      totalIncidentsResolved += (Number(item.so_vu_viec_giai_quyet) || 0);
    });

    return {
      totalPatrols,
      totalPublic,
      totalCovert,
      totalMemberTurns,
      totalIncidentsResolved,
    };
  }, [patrolList]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ngay_tuan_tra: todayStr,
      ca_tuan_tra: 'Ca đêm (22h00 - 05h00)',
      so_cuoc_cong_khai: 1,
      so_cuoc_mat_phuc: 1,
      so_luot_thanh_vien: 4,
      danh_sach_thanh_vien_ids: [],
      can_bo_cong_an_phu_trach: 'Trung tá Trần Thanh Tuấn - Phó Trưởng Công an xã',
      ap_ids: diaBanList.length > 0 ? [diaBanList[0].id] : [],
      tuyen_duong_dia_ban: 'Tuyến ĐT 851, đường đan liên ấp và khu vực chợ xã',
      so_vu_viec_giai_quyet: 1,
      noi_dung_phoi_hop: 'Phối hợp Công an xã tuần tra khép kín địa bàn, kiểm tra trật tự đô thị, nhắc nhở các hộ dân bảo quản tài sản và giải tán thanh thiếu niên tụ tập quá giờ quy định.',
      ket_qua_noi_bat: 'Đảm bảo tình hình an ninh, trật tự ổn định, không để xảy ra vụ việc phức tạp.',
      ghi_chu: 'Quân số chấp hành nghiêm túc mệnh lệnh công tác.',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NhatKyTuanTra) => {
    setEditingItem(item);
    setFormData({
      ...item,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (item: NhatKyTuanTra) => {
    setDeletingItem(item);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    const dateStr = deletingItem.ngay_tuan_tra;
    storageService.deleteNhatKyTuanTra(deletingItem.id, currentUser);
    setDeletingItem(null);
    reloadData();
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Đã xóa nhật ký tuần tra',
        message: `Đã xóa nhật ký ngày ${dateStr} khỏi hệ thống và Supabase.`,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ngay_tuan_tra) {
      if (onShowToast) {
        onShowToast({
          type: 'warning',
          title: 'Thiếu thông tin bắt buộc',
          message: 'Vui lòng chọn ngày tuần tra!',
        });
      }
      return;
    }

    const publicCount = Math.max(0, Number(formData.so_cuoc_cong_khai) || 0);
    const covertCount = Math.max(0, Number(formData.so_cuoc_mat_phuc) || 0);

    if (publicCount === 0 && covertCount === 0) {
      if (onShowToast) {
        onShowToast({
          type: 'warning',
          title: 'Thiếu thông tin cuộc tuần tra',
          message: 'Vui lòng nhập ít nhất 1 cuộc tuần tra (công khai hoặc mật phục)!',
        });
      }
      return;
    }

    const payload: NhatKyTuanTra = {
      id: editingItem ? editingItem.id : 'tt_' + Date.now(),
      ngay_tuan_tra: formData.ngay_tuan_tra!,
      ca_tuan_tra: (formData.ca_tuan_tra as CaTuanTra) || 'Ca đêm (22h00 - 05h00)',
      so_cuoc_cong_khai: publicCount,
      so_cuoc_mat_phuc: covertCount,
      tong_so_cuoc: publicCount + covertCount,
      so_luot_thanh_vien: Math.max(1, Number(formData.so_luot_thanh_vien) || 1),
      danh_sach_thanh_vien_ids: formData.danh_sach_thanh_vien_ids || [],
      can_bo_cong_an_phu_trach: formData.can_bo_cong_an_phu_trach?.trim() || 'Công an xã Lai Vung',
      ap_ids: formData.ap_ids || [],
      tuyen_duong_dia_ban: formData.tuyen_duong_dia_ban?.trim() || 'Địa bàn xã Lai Vung',
      so_vu_viec_giai_quyet: Math.max(0, Number(formData.so_vu_viec_giai_quyet) || 0),
      noi_dung_phoi_hop: formData.noi_dung_phoi_hop?.trim() || 'Phối hợp tuần tra bảo đảm ANTT cùng Công an xã.',
      ket_qua_noi_bat: formData.ket_qua_noi_bat?.trim() || '',
      ghi_chu: formData.ghi_chu?.trim() || '',
      nguoi_ghi_so: editingItem ? editingItem.nguoi_ghi_so : currentUser.fullName,
      created_at: editingItem ? editingItem.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    storageService.saveNhatKyTuanTra(payload, currentUser);
    reloadData();
    setIsModalOpen(false);

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: editingItem ? 'Cập nhật thành công' : 'Ghi sổ tuần tra thành công',
        message: `Đã lưu ca tuần tra ngày ${payload.ngay_tuan_tra} với tổng cộng ${payload.tong_so_cuoc} cuộc tuần tra.`,
      });
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    const current = formData.danh_sach_thanh_vien_ids || [];
    let updated: string[];
    if (current.includes(memberId)) {
      updated = current.filter(id => id !== memberId);
    } else {
      updated = [...current, memberId];
    }
    setFormData({
      ...formData,
      danh_sach_thanh_vien_ids: updated,
      // Update turn count to match selected count if greater
      so_luot_thanh_vien: updated.length > 0 ? updated.length : formData.so_luot_thanh_vien,
    });
  };

  const toggleApSelection = (apId: string) => {
    const current = formData.ap_ids || [];
    let updated: string[];
    if (current.includes(apId)) {
      updated = current.filter(id => id !== apId);
    } else {
      updated = [...current, apId];
    }
    setFormData({
      ...formData,
      ap_ids: updated,
    });
  };

  // Helper to format date
  const formatDateVN = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Siren className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              CÔNG AN XÃ LAI VUNG – BỘ PHẬN TRỰC BAN TÁC CHIẾN
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              NHẬT KÝ TUẦN TRA & PHỐI HỢP ANTT HÀNG NGÀY
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
              Quản lý chi tiết số cuộc tuần tra công khai và tuần tra mật phục, số lượt thành viên ANTT cơ sở tham gia, cùng công tác phối hợp giải quyết tình hình an ninh, trật tự địa bàn cùng lực lượng Công an xã Lai Vung.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canManage && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/30 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Ghi sổ tuần tra mới
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Statistics Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patrols */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số cuộc tuần tra</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Siren className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalPatrols}</span>
            <span className="text-xs text-slate-500 font-semibold">cuộc</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              Công khai: {stats.totalPublic}
            </span>
            <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
              Mật phục: {stats.totalCovert}
            </span>
          </div>
        </div>

        {/* Member Turns */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lượt TV ANTT tham gia</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalMemberTurns}</span>
            <span className="text-xs text-slate-500 font-semibold">lượt thành viên</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phối hợp cùng Công an xã trực 24/7</span>
          </div>
        </div>

        {/* Incidents Resolved */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vụ việc phối hợp xử lý</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalIncidentsResolved}</span>
            <span className="text-xs text-slate-500 font-semibold">vụ việc ANTT</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Giải tán tụ tập, trộm cắp, trật tự ATGT</span>
          </div>
        </div>

        {/* Night / Covert Ratio */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chủ động phòng ngừa</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {stats.totalPatrols > 0 ? Math.round((stats.totalCovert / stats.totalPatrols) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-500 font-semibold">tỷ lệ tuần tra mật phục</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            <span>Khép kín 19 ấp xã Lai Vung</span>
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
              placeholder="Tìm nội dung, cán bộ, tuyến đường..."
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

          {/* Filter Shift */}
          <div>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="all">-- Tất cả ca trực --</option>
              <option value="Ca ngày (07h00 - 17h00)">Ca ngày (07h00 - 17h00)</option>
              <option value="Ca tối (17h00 - 22h00)">Ca tối (17h00 - 22h00)</option>
              <option value="Ca đêm (22h00 - 05h00)">Ca đêm (22h00 - 05h00)</option>
              <option value="Đột xuất">Tuần tra đột xuất</option>
            </select>
          </div>

          {/* Filter Ap */}
          <div>
            <select
              value={filterAp}
              onChange={(e) => setFilterAp(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="all">-- Tất cả địa bàn (Ấp) --</option>
              {diaBanList.map(ap => (
                <option key={ap.id} value={ap.id}>{ap.ten_ap}</option>
              ))}
            </select>
          </div>

          {/* Filter Date Range */}
          <div>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="all">-- Mọi thời gian --</option>
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="month">Trong tháng này (30 ngày)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Tìm thấy <strong className="text-slate-900 font-bold">{filteredList.length}</strong> ca tuần tra</span>
          {(searchQuery || filterShift !== 'all' || filterAp !== 'all' || filterDateRange !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterShift('all');
                setFilterAp('all');
                setFilterDateRange('all');
              }}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">
              BẢNG NHẬT KÝ TUẦN TRA ĐỊNH KỲ VÀ ĐỘT XUẤT
            </h2>
          </div>
          <span className="text-xs bg-slate-200/80 text-slate-700 px-2.5 py-1 rounded-full font-bold">
            {filteredList.length} bản ghi
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Siren className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-base font-bold text-slate-600">Không tìm thấy ca tuần tra nào phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Hãy điều chỉnh bộ lọc hoặc ghi sổ ca tuần tra mới.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ngày & Ca trực</th>
                  <th className="py-3.5 px-4 text-center">Số cuộc tuần tra</th>
                  <th className="py-3.5 px-4">Lực lượng tham gia</th>
                  <th className="py-3.5 px-4">Địa bàn & Lộ trình</th>
                  <th className="py-3.5 px-4">Công tác phối hợp giải quyết ANTT</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredList.map((item) => {
                  const shiftBadgeColor = 
                    item.ca_tuan_tra.includes('đêm') ? 'bg-slate-900 text-amber-300 border-slate-800' :
                    item.ca_tuan_tra.includes('tối') ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    item.ca_tuan_tra.includes('ngày') ? 'bg-sky-50 text-sky-700 border-sky-200' :
                    'bg-red-50 text-red-700 border-red-200';

                  const apNames = item.ap_ids
                    .map(id => diaBanList.find(a => a.id === id)?.ten_ap)
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                      {/* Date & Shift */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateVN(item.ngay_tuan_tra)}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${shiftBadgeColor}`}>
                            {item.ca_tuan_tra}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Ghi sổ: {item.nguoi_ghi_so}
                        </div>
                      </td>

                      {/* Patrol Counts (Public & Covert) */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full font-black text-slate-800 text-sm mb-1.5">
                          {item.tong_so_cuoc} <span className="text-[10px] font-normal text-slate-500">cuộc</span>
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                            Công khai: {item.so_cuoc_cong_khai}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200/60">
                            Mật phục: {item.so_cuoc_mat_phuc}
                          </span>
                        </div>
                      </td>

                      {/* Force Composition */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="flex items-center gap-1 text-slate-900 font-bold">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.so_luot_thanh_vien} lượt thành viên ANTT</span>
                        </div>
                        <div className="mt-1 text-slate-600">
                          <strong className="text-slate-700">Công an phụ trách:</strong> {item.can_bo_cong_an_phu_trach}
                        </div>
                        {item.danh_sach_thanh_vien_ids && item.danh_sach_thanh_vien_ids.length > 0 && (
                          <div className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                            Thành viên: {item.danh_sach_thanh_vien_ids.map(id => members.find(m => m.id === id)?.ho_ten).filter(Boolean).join(', ')}
                          </div>
                        )}
                      </td>

                      {/* Territory & Road */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="flex items-start gap-1 text-slate-900 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span className="font-bold">{apNames || 'Toàn xã Lai Vung'}</span>
                        </div>
                        {item.tuyen_duong_dia_ban && (
                          <div className="text-[11px] text-slate-500 mt-1">
                            Lộ trình: {item.tuyen_duong_dia_ban}
                          </div>
                        )}
                      </td>

                      {/* Joint Operation & Results */}
                      <td className="py-3.5 px-4 align-top max-w-md">
                        <div className="flex items-center gap-1 text-slate-900 font-bold mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black">
                            {item.so_vu_viec_giai_quyet} vụ việc
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed line-clamp-3">
                          {item.noi_dung_phoi_hop}
                        </p>
                        {item.ket_qua_noi_bat && (
                          <div className="mt-1.5 p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/50 text-[11px]">
                            <strong>Kết quả:</strong> {item.ket_qua_noi_bat}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingItem(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Xem chi tiết ca trực"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                title="Chỉnh sửa sổ tuần tra"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Xóa nhật ký"
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
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Siren className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base uppercase">CHI TIẾT CA TUẦN TRA & PHỐI HỢP ANTT</h3>
                  <p className="text-xs text-slate-500">Ngày {formatDateVN(viewingItem.ngay_tuan_tra)} – {viewingItem.ca_tuan_tra}</p>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-xs">Tổng số cuộc:</span>
                  <span className="text-base font-black text-slate-900">{viewingItem.tong_so_cuoc} cuộc</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Tuần tra công khai:</span>
                  <span className="font-bold text-emerald-700">{viewingItem.so_cuoc_cong_khai} cuộc</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Tuần tra mật phục:</span>
                  <span className="font-bold text-purple-700">{viewingItem.so_cuoc_mat_phuc} cuộc</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Số lượt thành viên:</span>
                  <span className="font-bold text-slate-900">{viewingItem.so_luot_thanh_vien} lượt</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Vụ việc giải quyết:</span>
                  <span className="font-bold text-amber-700">{viewingItem.so_vu_viec_giai_quyet} vụ việc</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Người ghi sổ:</span>
                  <span className="font-bold text-slate-800">{viewingItem.nguoi_ghi_so}</span>
                </div>
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">Cán bộ Công an phụ trách ca trực:</strong>
                <p className="text-slate-600">{viewingItem.can_bo_cong_an_phu_trach}</p>
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">Địa bàn và tuyến đường tuần tra:</strong>
                <p className="text-slate-600">
                  <strong>Ấp:</strong> {viewingItem.ap_ids.map(id => diaBanList.find(a => a.id === id)?.ten_ap).filter(Boolean).join(', ') || 'Địa bàn toàn xã'}
                </p>
                {viewingItem.tuyen_duong_dia_ban && (
                  <p className="text-slate-600 mt-0.5"><strong>Lộ trình:</strong> {viewingItem.tuyen_duong_dia_ban}</p>
                )}
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">Công tác phối hợp giải quyết tình hình ANTT cùng Công an:</strong>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 whitespace-pre-wrap leading-relaxed">
                  {viewingItem.noi_dung_phoi_hop}
                </p>
              </div>

              {viewingItem.ket_qua_noi_bat && (
                <div>
                  <strong className="text-slate-800 block mb-1">Kết quả nổi bật:</strong>
                  <p className="text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60 leading-relaxed">
                    {viewingItem.ket_qua_noi_bat}
                  </p>
                </div>
              )}

              {viewingItem.ghi_chu && (
                <div>
                  <strong className="text-slate-800 block mb-1">Ghi chú nhận xét ca trực:</strong>
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
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg">
                  <Siren className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base uppercase">
                    {editingItem ? 'CHỈNH SỬA SỔ NHẬT KÝ TUẦN TRA' : 'GHI SỔ NHẬT KÝ TUẦN TRA HÀNG NGÀY'}
                  </h3>
                  <p className="text-xs text-slate-300">Công an xã Lai Vung – Lực lượng tham gia bảo vệ ANTT cơ sở</p>
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
              {/* Row 1: Ngày & Ca tuần tra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngày tuần tra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.ngay_tuan_tra}
                    onChange={(e) => setFormData({ ...formData, ngay_tuan_tra: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ca tuần tra <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.ca_tuan_tra}
                    onChange={(e) => setFormData({ ...formData, ca_tuan_tra: e.target.value as CaTuanTra })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  >
                    <option value="Ca ngày (07h00 - 17h00)">Ca ngày (07h00 - 17h00)</option>
                    <option value="Ca tối (17h00 - 22h00)">Ca tối (17h00 - 22h00)</option>
                    <option value="Ca đêm (22h00 - 05h00)">Ca đêm (22h00 - 05h00)</option>
                    <option value="Đột xuất">Tuần tra đột xuất</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Số cuộc tuần tra (Công khai & Mật phục) */}
              <div className="p-4 bg-blue-50/60 border border-blue-200/70 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                    <Siren className="w-4 h-4 text-red-600" />
                    Số cuộc tuần tra trong ca trực
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    Tổng số cuộc: <strong className="text-red-600 font-black text-sm">{(Number(formData.so_cuoc_cong_khai) || 0) + (Number(formData.so_cuoc_mat_phuc) || 0)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-emerald-800 mb-1">
                      Số cuộc tuần tra công khai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.so_cuoc_cong_khai}
                      onChange={(e) => setFormData({ ...formData, so_cuoc_cong_khai: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-900"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">Tuần tra phương tiện môtô, đi bộ công khai răn đe</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-purple-800 mb-1">
                      Số cuộc tuần tra mật phục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.so_cuoc_mat_phuc}
                      onChange={(e) => setFormData({ ...formData, so_cuoc_mat_phuc: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold text-purple-900"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">Hóa trang, mật phục tại các điểm nóng phức tạp</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Lực lượng tham gia & Cán bộ phụ trách */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số lượt thành viên ANTT cơ sở tham gia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.so_luot_thanh_vien}
                    onChange={(e) => setFormData({ ...formData, so_luot_thanh_vien: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Tổng số lượt thành viên được huy động trong ca</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cán bộ Công an chính quy phụ trách ca trực <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.can_bo_cong_an_phu_trach}
                    onChange={(e) => setFormData({ ...formData, can_bo_cong_an_phu_trach: e.target.value })}
                    placeholder="VD: Trung tá Trần Thanh Tuấn - Phó Trưởng CAX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Fast member selection */}
              {members.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chọn nhanh thành viên ANTT cơ sở tham gia ca trực:
                  </label>
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50/80 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {members.map(m => {
                      const isSelected = (formData.danh_sach_thanh_vien_ids || []).includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleMemberSelection(m.id)}
                          className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left text-xs transition ${
                            isSelected 
                              ? 'bg-blue-600 text-white font-bold shadow-sm' 
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                            isSelected ? 'bg-white text-blue-600 font-black' : 'border border-slate-300'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </span>
                          <span className="truncate">{m.ho_ten}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Đã chọn: <strong className="text-blue-600">{(formData.danh_sach_thanh_vien_ids || []).length}</strong> thành viên
                  </div>
                </div>
              )}

              {/* Row 4: Địa bàn các ấp và Lộ trình */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Địa bàn tuần tra (chọn các Ấp):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {diaBanList.map(ap => {
                    const isSelected = (formData.ap_ids || []).includes(ap.id);
                    return (
                      <button
                        key={ap.id}
                        type="button"
                        onClick={() => toggleApSelection(ap.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          isSelected 
                            ? 'bg-red-700 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {ap.ten_ap}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 mt-2">
                    Tuyến đường / Khu vực trọng điểm:
                  </label>
                  <input
                    type="text"
                    value={formData.tuyen_duong_dia_ban}
                    onChange={(e) => setFormData({ ...formData, tuyen_duong_dia_ban: e.target.value })}
                    placeholder="VD: Tuyến ĐT 851, Quốc lộ 54, khu vực chợ Lai Vung, bến đò..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Công tác phối hợp giải quyết tình hình ANTT */}
              <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    Công tác phối hợp giải quyết tình hình ANTT cùng lực lượng Công an <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">Số vụ việc giải quyết:</span>
                    <input
                      type="number"
                      min={0}
                      value={formData.so_vu_viec_giai_quyet}
                      onChange={(e) => setFormData({ ...formData, so_vu_viec_giai_quyet: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-16 px-2 py-1 bg-white border border-amber-300 rounded-lg text-center font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                    />
                  </div>
                </div>

                <textarea
                  rows={3}
                  required
                  value={formData.noi_dung_phoi_hop}
                  onChange={(e) => setFormData({ ...formData, noi_dung_phoi_hop: e.target.value })}
                  placeholder="Mô tả cụ thể: Giải tán tụ tập đêm khuya, kiểm tra cư trú, hòa giải tranh chấp, xử lý trật tự giao thông lấn chiếm lòng lề đường, phát hiện vây bắt trộm cắp tệ nạn..."
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed text-slate-800"
                />

                {/* Quick Fill Templates */}
                <div className="flex flex-wrap gap-1.5 items-center text-[11px]">
                  <span className="text-slate-500 font-semibold">Gợi ý nhanh:</span>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      noi_dung_phoi_hop: (formData.noi_dung_phoi_hop ? formData.noi_dung_phoi_hop + '; ' : '') + 'Phối hợp Công an xã giải tán 01 nhóm thanh thiếu niên tụ tập đêm khuya trên tuyến ĐT 851.',
                    })}
                    className="px-2 py-0.5 bg-white border border-amber-300/80 rounded-md text-slate-700 hover:bg-amber-100/50"
                  >
                    + Giải tán tụ tập đêm
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      noi_dung_phoi_hop: (formData.noi_dung_phoi_hop ? formData.noi_dung_phoi_hop + '; ' : '') + 'Nhắc nhở 04 hộ kinh doanh không buôn bán lấn chiếm lòng lề đường khu vực chợ.',
                    })}
                    className="px-2 py-0.5 bg-white border border-amber-300/80 rounded-md text-slate-700 hover:bg-amber-100/50"
                  >
                    + Trật tự lề đường
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      noi_dung_phoi_hop: (formData.noi_dung_phoi_hop ? formData.noi_dung_phoi_hop + '; ' : '') + 'Hòa giải thành 01 mâu thuẫn tranh chấp lối đi giữa các hộ dân, ổn định trật tự.',
                    })}
                    className="px-2 py-0.5 bg-white border border-amber-300/80 rounded-md text-slate-700 hover:bg-amber-100/50"
                  >
                    + Hòa giải cơ sở
                  </button>
                </div>
              </div>

              {/* Row 6: Kết quả nổi bật & Ghi chú */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kết quả nổi bật ca tuần tra:
                  </label>
                  <input
                    type="text"
                    value={formData.ket_qua_noi_bat}
                    onChange={(e) => setFormData({ ...formData, ket_qua_noi_bat: e.target.value })}
                    placeholder="VD: Không để xảy ra trộm cắp, địa bàn bình yên tuyệt đối"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ghi chú / Nhận xét:
                  </label>
                  <input
                    type="text"
                    value={formData.ghi_chu}
                    onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
                    placeholder="VD: Tinh thần trực ban nghiêm túc, đúng quy định"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
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
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95"
                >
                  {editingItem ? 'Lưu thay đổi' : 'Ghi sổ tuần tra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa nhật ký tuần tra */}
      <ConfirmModal
        isOpen={!!deletingItem}
        title="Xác nhận xóa nhật ký tuần tra"
        message={`Đồng chí có chắc chắn muốn xóa nhật ký ca tuần tra ngày "${deletingItem?.ngay_tuan_tra}" (${deletingItem?.ca_tuan_tra}) khỏi hệ thống và Supabase không?`}
        confirmLabel="Xác nhận xóa"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};
