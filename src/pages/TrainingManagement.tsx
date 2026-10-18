import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Calendar, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Award,
  X,
  FileText,
  UserCheck,
  Flame,
  Shield,
  BadgePercent
} from 'lucide-react';
import { DotTapHuan, NhanSu, UserAccount } from '../types';
import { storageService } from '../services/storage';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface TrainingManagementProps {
  currentUser: UserAccount;
  members: NhanSu[];
  onShowToast?: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }) => void;
}

export const TrainingManagement: React.FC<TrainingManagementProps> = ({
  currentUser,
  members,
  onShowToast,
}) => {
  const [trainingList, setTrainingList] = useState<DotTapHuan[]>(() => storageService.getDotTapHuanList());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrganizer, setFilterOrganizer] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DotTapHuan | null>(null);
  const [viewingItem, setViewingItem] = useState<DotTapHuan | null>(null);
  const [deletingItem, setDeletingItem] = useState<DotTapHuan | null>(null);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<Partial<DotTapHuan>>({
    ten_dot: '',
    chuyen_de: '',
    thoi_gian_bat_dau: todayStr,
    thoi_gian_ket_thuc: todayStr,
    dia_diem: 'Hội trường Trung tâm Văn hóa - Học tập cộng đồng xã Lai Vung',
    don_vi_to_chuc: 'Công an xã Lai Vung',
    so_lop: 1,
    so_thanh_vien_tham_gia: 25,
    danh_sach_thanh_vien_ids: [],
    noi_dung_tap_huan: '',
    ket_qua_danh_gia: {
      so_dat: 25,
      so_gioi_xuat_sac: 8,
      so_chua_dat: 0,
      ty_le_hoan_thanh: 100,
    },
    kinh_phi_ho_tro: 0,
    trang_thai: 'da_hoan_thanh',
    ghi_chu: '',
  });

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  const reloadData = () => {
    setTrainingList(storageService.getDotTapHuanList());
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return trainingList.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.ten_dot || '').toLowerCase().includes(q);
        const matchTopic = (item.chuyen_de || '').toLowerCase().includes(q);
        const matchPlace = (item.dia_diem || '').toLowerCase().includes(q);
        const matchContent = (item.noi_dung_tap_huan || '').toLowerCase().includes(q);
        if (!matchTitle && !matchTopic && !matchPlace && !matchContent) {
          return false;
        }
      }

      // Organizer
      if (filterOrganizer !== 'all' && item.don_vi_to_chuc !== filterOrganizer) {
        return false;
      }

      // Status
      if (filterStatus !== 'all' && item.trang_thai !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [trainingList, searchQuery, filterOrganizer, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    let totalSessions = trainingList.length;
    let totalClasses = 0;
    let totalParticipants = 0;
    let totalCompleted = 0;

    trainingList.forEach(item => {
      totalClasses += (Number(item.so_lop) || 0);
      totalParticipants += (Number(item.so_thanh_vien_tham_gia) || 0);
      if (item.trang_thai === 'da_hoan_thanh') {
        totalCompleted += 1;
      }
    });

    return {
      totalSessions,
      totalClasses,
      totalParticipants,
      totalCompleted,
    };
  }, [trainingList]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ten_dot: 'Tập huấn bồi dưỡng kỹ năng nghiệp vụ ANTT cơ sở Đợt mới năm 2026',
      chuyen_de: 'Kỹ năng giải quyết mâu thuẫn tranh chấp và nắm tình hình an ninh trật tự cơ sở',
      thoi_gian_bat_dau: todayStr,
      thoi_gian_ket_thuc: todayStr,
      dia_diem: 'Hội trường Trung tâm Văn hóa - Học tập cộng đồng xã Lai Vung',
      don_vi_to_chuc: 'Công an xã Lai Vung',
      so_lop: 1,
      so_thanh_vien_tham_gia: 25,
      danh_sach_thanh_vien_ids: [],
      noi_dung_tap_huan: 'Huấn luyện kỹ năng tiếp nhận tin báo tố giác tội phạm từ nhân dân; phương pháp hòa giải tranh chấp cơ sở; phối hợp tuần tra và bảo vệ an toàn địa bàn.',
      ket_qua_danh_gia: {
        so_dat: 25,
        so_gioi_xuat_sac: 8,
        so_chua_dat: 0,
        ty_le_hoan_thanh: 100,
      },
      kinh_phi_ho_tro: 2500000,
      trang_thai: 'da_hoan_thanh',
      ghi_chu: 'Quân số tham gia nghiêm túc, đạt chỉ tiêu kế hoạch đề ra.',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DotTapHuan) => {
    setEditingItem(item);
    setFormData({
      ...item,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (item: DotTapHuan) => {
    setDeletingItem(item);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    const dotName = deletingItem.ten_dot;
    storageService.deleteDotTapHuan(deletingItem.id, currentUser);
    setDeletingItem(null);
    reloadData();
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Đã xóa đợt tập huấn',
        message: `Đã xóa hồ sơ đợt tập huấn "${dotName}" khỏi hệ thống và Supabase.`,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ten_dot?.trim()) {
      if (onShowToast) {
        onShowToast({
          type: 'warning',
          title: 'Thiếu thông tin bắt buộc',
          message: 'Vui lòng nhập tên đợt tập huấn!',
        });
      }
      return;
    }

    const payload: DotTapHuan = {
      id: editingItem ? editingItem.id : 'th_' + Date.now(),
      ten_dot: formData.ten_dot.trim(),
      chuyen_de: formData.chuyen_de?.trim() || 'Nghiệp vụ an ninh, trật tự cơ sở',
      thoi_gian_bat_dau: formData.thoi_gian_bat_dau || todayStr,
      thoi_gian_ket_thuc: formData.thoi_gian_ket_thuc || todayStr,
      dia_diem: formData.dia_diem?.trim() || 'UBND xã Lai Vung',
      don_vi_to_chuc: (formData.don_vi_to_chuc as any) || 'Công an xã Lai Vung',
      so_lop: Math.max(1, Number(formData.so_lop) || 1),
      so_thanh_vien_tham_gia: Math.max(1, Number(formData.so_thanh_vien_tham_gia) || 1),
      danh_sach_thanh_vien_ids: formData.danh_sach_thanh_vien_ids || [],
      noi_dung_tap_huan: formData.noi_dung_tap_huan?.trim() || '',
      ket_qua_danh_gia: {
        so_dat: Number(formData.ket_qua_danh_gia?.so_dat) || 0,
        so_gioi_xuat_sac: Number(formData.ket_qua_danh_gia?.so_gioi_xuat_sac) || 0,
        so_chua_dat: Number(formData.ket_qua_danh_gia?.so_chua_dat) || 0,
        ty_le_hoan_thanh: Number(formData.ket_qua_danh_gia?.ty_le_hoan_thanh) || 100,
      },
      kinh_phi_ho_tro: Number(formData.kinh_phi_ho_tro) || 0,
      trang_thai: (formData.trang_thai as any) || 'da_hoan_thanh',
      ghi_chu: formData.ghi_chu?.trim() || '',
      nguoi_nhap: editingItem ? editingItem.nguoi_nhap : currentUser.fullName,
      created_at: editingItem ? editingItem.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    storageService.saveDotTapHuan(payload, currentUser);
    reloadData();
    setIsModalOpen(false);

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: editingItem ? 'Cập nhật thành công' : 'Thêm đợt tập huấn thành công',
        message: `Đã lưu đợt tập huấn: ${payload.ten_dot} (${payload.so_lop} lớp, ${payload.so_thanh_vien_tham_gia} thành viên).`,
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
      so_thanh_vien_tham_gia: updated.length > 0 ? updated.length : formData.so_thanh_vien_tham_gia,
    });
  };

  // Helper date format
  const formatDateVN = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              CÔNG AN XÃ LAI VUNG – HUẤN LUYỆN & BỒI DƯỠNG NGHIỆP VỤ
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              QUẢN LÝ TẬP HUẤN NGHIỆP VỤ ANTT CƠ SỞ
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
              Quản lý công tác tổ chức tập huấn theo từng đợt, theo dõi số lớp đào tạo, số lượng thành viên tham gia, chuyên đề bồi dưỡng pháp luật, PCCC & CNCH, võ thuật tự vệ và kết quả kiểm tra đánh giá chất lượng.
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
                Thêm đợt tập huấn mới
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Statistics Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số đợt tập huấn</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalSessions}</span>
            <span className="text-xs text-slate-500 font-semibold">đợt tổ chức</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã hoàn thành: {stats.totalCompleted} đợt</span>
          </div>
        </div>

        {/* Total Classes */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số lớp mở</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalClasses}</span>
            <span className="text-xs text-slate-500 font-semibold">lớp huấn luyện</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Phân bổ theo cụm ấp xã Lai Vung</span>
          </div>
        </div>

        {/* Total Participants */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thành viên tham gia</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalParticipants}</span>
            <span className="text-xs text-slate-500 font-semibold">lượt thành viên</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đạt 100% quân số theo kế hoạch</span>
          </div>
        </div>

        {/* Quality Rating */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chất lượng đào tạo</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">100%</span>
            <span className="text-xs text-slate-500 font-semibold">đạt yêu cầu</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cấp giấy chứng nhận bồi dưỡng</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên đợt, chuyên đề, địa điểm..."
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

          {/* Organizer Filter */}
          <div>
            <select
              value={filterOrganizer}
              onChange={(e) => setFilterOrganizer(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="all">-- Tất cả đơn vị tổ chức --</option>
              <option value="Công an tỉnh Đồng Tháp">Công an tỉnh Đồng Tháp</option>
              <option value="Công an xã Lai Vung">Công an xã Lai Vung</option>
              <option value="UBND xã Lai Vung">UBND xã Lai Vung</option>
              <option value="Liên ngành">Liên ngành</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="all">-- Tất cả trạng thái --</option>
              <option value="da_hoan_thanh">Đã hoàn thành</option>
              <option value="dang_dien_ra">Đang diễn ra</option>
              <option value="ke_hoach">Kế hoạch sắp tới</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Tìm thấy <strong className="text-slate-900 font-bold">{filteredList.length}</strong> đợt tập huấn</span>
          {(searchQuery || filterOrganizer !== 'all' || filterStatus !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterOrganizer('all');
                setFilterStatus('all');
              }}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main List of Training Sessions */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-base font-bold text-slate-600">Không tìm thấy đợt tập huấn nào</p>
            <p className="text-xs text-slate-400 mt-1">Hãy điều chỉnh bộ lọc hoặc thêm đợt tập huấn mới.</p>
          </div>
        ) : (
          filteredList.map((item) => {
            const statusBadge = 
              item.trang_thai === 'da_hoan_thanh' ? { text: 'Đã hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' } :
              item.trang_thai === 'dang_dien_ra' ? { text: 'Đang diễn ra', color: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' } :
              { text: 'Kế hoạch sắp tới', color: 'bg-amber-50 text-amber-700 border-amber-200' };

            return (
              <div 
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge.color}`}>
                        {statusBadge.text}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.don_vi_to_chuc}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {item.ten_dot}
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-700 font-semibold mt-0.5 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 shrink-0 text-blue-600" />
                      Chuyên đề: {item.chuyen_de}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => setViewingItem(item)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
                          title="Chỉnh sửa đợt tập huấn"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Xóa đợt tập huấn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Số lớp tổ chức:</span>
                    <strong className="text-sm font-black text-slate-900">{item.so_lop} lớp</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Số thành viên tham gia:</span>
                    <strong className="text-sm font-black text-blue-700">{item.so_thanh_vien_tham_gia} thành viên</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Thời gian:</span>
                    <strong className="text-slate-800 font-bold">{formatDateVN(item.thoi_gian_bat_dau)} – {formatDateVN(item.thoi_gian_ket_thuc)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Địa điểm:</span>
                    <span className="text-slate-700 font-medium truncate block">{item.dia_diem}</span>
                  </div>
                </div>

                {/* Training Content */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nội dung huấn luyện & Bồi dưỡng:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                    {item.noi_dung_tap_huan}
                  </p>
                </div>

                {/* Evaluation Results */}
                {item.ket_qua_danh_gia && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500">
                        Đạt yêu cầu: <strong className="text-slate-900 font-bold">{item.ket_qua_danh_gia.so_dat}/{item.so_thanh_vien_tham_gia}</strong>
                      </span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        Giỏi & Xuất sắc: {item.ket_qua_danh_gia.so_gioi_xuat_sac} đồng chí
                      </span>
                      <span className="text-blue-700 font-bold">
                        Tỷ lệ: {item.ket_qua_danh_gia.ty_le_hoan_thanh}%
                      </span>
                    </div>

                    {item.kinh_phi_ho_tro && item.kinh_phi_ho_tro > 0 ? (
                      <span className="text-slate-600 font-medium">
                        Kinh phí hỗ trợ: <strong className="text-slate-900">{item.kinh_phi_ho_tro.toLocaleString('vi-VN')} VNĐ</strong>
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal View Detail */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base uppercase">HỒ SƠ ĐỢT TẬP HUẤN NGHIỆP VỤ</h3>
                  <p className="text-xs text-slate-500">{viewingItem.don_vi_to_chuc}</p>
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
              <div>
                <h4 className="font-bold text-base text-slate-900">{viewingItem.ten_dot}</h4>
                <p className="text-blue-700 font-semibold mt-1">Chuyên đề: {viewingItem.chuyen_de}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-xs">Số lớp tổ chức:</span>
                  <span className="text-base font-black text-slate-900">{viewingItem.so_lop} lớp</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Số TV tham gia:</span>
                  <span className="text-base font-black text-blue-700">{viewingItem.so_thanh_vien_tham_gia} thành viên</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Thời gian:</span>
                  <span className="font-bold text-slate-800">{formatDateVN(viewingItem.thoi_gian_bat_dau)} – {formatDateVN(viewingItem.thoi_gian_ket_thuc)}</span>
                </div>
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">Địa điểm tổ chức:</strong>
                <p className="text-slate-600">{viewingItem.dia_diem}</p>
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">Nội dung chương trình huấn luyện:</strong>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 whitespace-pre-wrap leading-relaxed">
                  {viewingItem.noi_dung_tap_huan}
                </p>
              </div>

              {viewingItem.danh_sach_thanh_vien_ids && viewingItem.danh_sach_thanh_vien_ids.length > 0 && (
                <div>
                  <strong className="text-slate-800 block mb-1">Danh sách thành viên tham gia:</strong>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap gap-1.5">
                    {viewingItem.danh_sach_thanh_vien_ids.map(id => {
                      const mem = members.find(m => m.id === id);
                      return mem ? (
                        <span key={id} className="px-2 py-1 rounded bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                          {mem.ho_ten} ({mem.chuc_vu})
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

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
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base uppercase">
                    {editingItem ? 'CHỈNH SỬA ĐỢT TẬP HUẤN NGHIỆP VỤ' : 'THÊM ĐỢT TẬP HUẤN NGHIỆP VỤ MỚI'}
                  </h3>
                  <p className="text-xs text-slate-300">Công an xã Lai Vung – Bồi dưỡng lực lượng bảo vệ ANTT cơ sở</p>
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
              {/* Row 1: Tên đợt tập huấn */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên đợt tập huấn / Lớp bồi dưỡng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.ten_dot}
                  onChange={(e) => setFormData({ ...formData, ten_dot: e.target.value })}
                  placeholder="VD: Tập huấn bồi dưỡng pháp luật và nghiệp vụ lực lượng ANTT cơ sở năm 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900"
                />
              </div>

              {/* Row 2: Chuyên đề & Đơn vị tổ chức */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chuyên đề huấn luyện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.chuyen_de}
                    onChange={(e) => setFormData({ ...formData, chuyen_de: e.target.value })}
                    placeholder="VD: Triển khai Luật số 30/2023/QH15; Nghiệp vụ PCCC..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Đơn vị tổ chức <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.don_vi_to_chuc}
                    onChange={(e) => setFormData({ ...formData, don_vi_to_chuc: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  >
                    <option value="Công an tỉnh Đồng Tháp">Công an tỉnh Đồng Tháp</option>
                    <option value="Công an xã Lai Vung">Công an xã Lai Vung</option>
                    <option value="UBND xã Lai Vung">UBND xã Lai Vung</option>
                    <option value="Liên ngành">Liên ngành</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Thời gian (Từ ngày - Đến ngày) & Địa điểm */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Thời gian bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.thoi_gian_bat_dau}
                    onChange={(e) => setFormData({ ...formData, thoi_gian_bat_dau: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Thời gian kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.thoi_gian_ket_thuc}
                    onChange={(e) => setFormData({ ...formData, thoi_gian_ket_thuc: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Trạng thái đợt tập huấn
                  </label>
                  <select
                    value={formData.trang_thai}
                    onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  >
                    <option value="da_hoan_thanh">Đã hoàn thành</option>
                    <option value="dang_dien_ra">Đang diễn ra</option>
                    <option value="ke_hoach">Kế hoạch sắp tới</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Địa điểm tổ chức <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.dia_diem}
                  onChange={(e) => setFormData({ ...formData, dia_diem: e.target.value })}
                  placeholder="VD: Hội trường Trung tâm Văn hóa - Học tập cộng đồng xã Lai Vung"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              {/* Row 4: Số lớp & Số thành viên tham gia */}
              <div className="p-4 bg-blue-50/60 border border-blue-200/70 rounded-2xl space-y-3">
                <span className="font-bold text-blue-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  Quy mô lớp học & Thành viên tham gia
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Số lớp tổ chức <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.so_lop}
                      onChange={(e) => setFormData({ ...formData, so_lop: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Số thành viên tham gia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.so_thanh_vien_tham_gia}
                      onChange={(e) => setFormData({ ...formData, so_thanh_vien_tham_gia: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Kinh phí hỗ trợ (VNĐ):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.kinh_phi_ho_tro}
                      onChange={(e) => setFormData({ ...formData, kinh_phi_ho_tro: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Fast Member Picker */}
              {members.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chọn thành viên cử đi tập huấn:
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

              {/* Row 5: Nội dung chương trình tập huấn */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung chương trình huấn luyện & Bồi dưỡng <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.noi_dung_tap_huan}
                  onChange={(e) => setFormData({ ...formData, noi_dung_tap_huan: e.target.value })}
                  placeholder="Ghi rõ nội dung bài giảng, chuyên đề: Phổ biến Luật số 30/2023/QH15, kỹ năng nắm tình hình địa bàn, thực hành dập lửa PCCC bằng bình bột, sơ cứu nạn nhân, võ thuật CAND..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>

              {/* Row 6: Đánh giá kết quả */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl space-y-2">
                <span className="font-bold text-emerald-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-700" />
                  Kết quả kiểm tra & Đánh giá cuối khóa
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 text-xs mb-1">Số đạt yêu cầu:</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.ket_qua_danh_gia?.so_dat || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        ket_qua_danh_gia: {
                          ...formData.ket_qua_danh_gia!,
                          so_dat: parseInt(e.target.value) || 0,
                        },
                      })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs mb-1">Giỏi / Xuất sắc:</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.ket_qua_danh_gia?.so_gioi_xuat_sac || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        ket_qua_danh_gia: {
                          ...formData.ket_qua_danh_gia!,
                          so_gioi_xuat_sac: parseInt(e.target.value) || 0,
                        },
                      })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs mb-1">Số chưa đạt:</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.ket_qua_danh_gia?.so_chua_dat || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        ket_qua_danh_gia: {
                          ...formData.ket_qua_danh_gia!,
                          so_chua_dat: parseInt(e.target.value) || 0,
                        },
                      })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs mb-1">Tỷ lệ hoàn thành (%):</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.ket_qua_danh_gia?.ty_le_hoan_thanh || 100}
                      onChange={(e) => setFormData({
                        ...formData,
                        ket_qua_danh_gia: {
                          ...formData.ket_qua_danh_gia!,
                          ty_le_hoan_thanh: parseInt(e.target.value) || 100,
                        },
                      })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-blue-800"
                    />
                  </div>
                </div>
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
                  placeholder="VD: Đã cấp giấy chứng nhận bồi dưỡng ngày..."
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
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95"
                >
                  {editingItem ? 'Lưu thay đổi' : 'Tạo đợt tập huấn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa đợt tập huấn */}
      <ConfirmModal
        isOpen={!!deletingItem}
        title="Xác nhận xóa đợt tập huấn"
        message={`Đồng chí có chắc chắn muốn xóa hồ sơ đợt tập huấn "${deletingItem?.ten_dot}" khỏi hệ thống và Supabase không?`}
        confirmLabel="Xác nhận xóa"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};
