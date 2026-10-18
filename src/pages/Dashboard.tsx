import React from 'react';
import {
  Users,
  ShieldAlert,
  Award,
  CreditCard,
  Smartphone,
  UserCheck,
  Building2,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  Siren
} from 'lucide-react';
import { NhanSu, DiaBanAp, ToANTT, FilterParams } from '../types';
import { calculateAge, getAgeGroup } from '../utils/helpers';
import { NavTab } from '../components/layout/Sidebar';
import { storageService } from '../services/storage';

interface DashboardProps {
  members: NhanSu[];
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  onNavigateWithFilter: (tab: NavTab, filters?: Partial<FilterParams>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  members,
  diaBanList,
  toANTTList,
  onNavigateWithFilter,
}) => {
  // Chỉ tính các thành viên đang hoạt động công tác (loại trừ đã xóa mềm và đã thôi việc)
  const activeMembers = members.filter(m => m.trang_thai === 'dang_hoat_dong');
  const dismissedMembers = members.filter(m => m.trang_thai === 'da_thoi_viec');
  const totalCount = activeMembers.length;

  // Giới tính
  const maleCount = activeMembers.filter(m => m.gioi_tinh === 'Nam').length;
  const femaleCount = activeMembers.filter(m => m.gioi_tinh === 'Nữ').length;

  // Chức vụ
  const toTruongCount = activeMembers.filter(m => m.chuc_vu === 'Tổ trưởng').length;
  const toPhoCount = activeMembers.filter(m => m.chuc_vu === 'Tổ phó').length;
  const thanhVienCount = activeMembers.filter(m => m.chuc_vu === 'Thành viên').length;

  // Tiêu chí chính trị & chuyển đổi số
  const dangVienCount = activeMembers.filter(m => m.dang_vien).length;
  const vneidCount = activeMembers.filter(m => m.vneid_muc_2).length;
  const bankCount = activeMembers.filter(m => m.co_tai_khoan).length;

  // Phân bổ độ tuổi
  const ageGroupsCount: Record<string, number> = {
    '18–30': 0,
    '31–45': 0,
    '46–60': 0,
    '61–70': 0,
    'Trên 70': 0,
  };

  activeMembers.forEach(m => {
    const age = calculateAge(m.ngay_sinh);
    const grp = getAgeGroup(age);
    if (grp !== 'Chưa xác định' && ageGroupsCount[grp] !== undefined) {
      ageGroupsCount[grp]++;
    }
  });

  // Phân bổ theo địa bàn
  const diaBanStats = diaBanList.map(ap => {
    const count = activeMembers.filter(m => m.ap_id === ap.id).length;
    return {
      ap,
      count,
      percent: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    };
  });

  // Phân bổ theo Tổ ANTT
  const toANTTStats = toANTTList.map(to => {
    const count = activeMembers.filter(m => m.to_antt_id === to.id).length;
    return {
      to,
      count,
      percent: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    };
  });

  // Phân bổ trình độ chuyên môn
  const chuyenMonGroups: Record<string, number> = {};
  activeMembers.forEach(m => {
    const cm = m.trinh_do_chuyen_mon || 'Chưa qua đào tạo';
    chuyenMonGroups[cm] = (chuyenMonGroups[cm] || 0) + 1;
  });

  // Phân bổ trình độ học vấn
  const hocVanGroups: Record<string, number> = {};
  activeMembers.forEach(m => {
    const hv = m.trinh_do_hoc_van || 'Khác';
    hocVanGroups[hv] = (hocVanGroups[hv] || 0) + 1;
  });

  // Dữ liệu nghiệp vụ mới: Tuần tra, Tập huấn, Khen thưởng
  const patrolList = storageService.getNhatKyTuanTraList();
  const trainingList = storageService.getDotTapHuanList();
  const awardList = storageService.getHoSoKhenThuongList();

  const totalPatrolCount = patrolList.reduce((acc, p) => acc + (Number(p.tong_so_cuoc) || 0), 0);
  const totalMemberPatrolTurns = patrolList.reduce((acc, p) => acc + (Number(p.so_luot_thanh_vien) || 0), 0);
  const totalTrainingClasses = trainingList.reduce((acc, t) => acc + (Number(t.so_lop) || 0), 0);
  const totalTrainingMembers = trainingList.reduce((acc, t) => acc + (Number(t.so_thanh_vien_tham_gia) || 0), 0);
  const totalAwardsCount = awardList.length;
  const totalMembersAwarded = awardList.reduce((acc, a) => acc + (Number(a.so_luong_thanh_vien_khen_thuong) || 1), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            CÔNG AN TỈNH ĐỒNG THÁP – CÔNG AN XÃ LAI VUNG
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
            BÀN LÀM VIỆC & THỐNG KÊ QUÂN SỐ ANTT CƠ SỞ
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Theo dõi quân số, cơ cấu chức vụ, độ tuổi, định danh VNeID mức 2 và tài khoản nhận phụ cấp của lực lượng ANTT cơ sở trên toàn địa bàn xã.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="dash-quick-add"
            onClick={() => onNavigateWithFilter('members')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Xem Danh Sách Nhân Sự</span>
          </button>
        </div>
      </div>

      {/* Empty Database Notification Banner */}
      {totalCount === 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Dữ liệu hệ thống đã được làm sạch – Sẵn sàng cập nhật hồ sơ mới
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-3xl">
                Toàn bộ dữ liệu mẫu đã được xóa sạch theo yêu cầu quản lý. Đồng chí có thể thêm mới từng hồ sơ hoặc nạp danh sách hàng loạt bằng file Excel (.xlsx).
              </p>
              <div className="mt-2 text-xs text-amber-900 font-medium flex items-center gap-2 flex-wrap">
                <span>Cán bộ quản lý hệ thống: <strong className="text-slate-900 font-bold">Trung tá Trần Thanh Tuấn</strong> (Phó Trưởng Công an xã)</span>
                <span>•</span>
                <span>Hotline: <a href="tel:0913344189" className="font-mono font-bold text-red-700 hover:underline">0913344189</a></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => onNavigateWithFilter('import')}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>Nhập Từ File Excel</span>
            </button>
            <button
              onClick={() => onNavigateWithFilter('members')}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>Thêm Thành Viên</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Key Metric Cards (Clickable to open corresponding list) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Chỉ số quân số trọng tâm (Nhấn để lọc chi tiết)
          </h3>
          <span className="text-[11px] text-slate-400">Dữ liệu cập nhật theo thời gian thực</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Total Members */}
          <div
            id="metric-total-members"
            onClick={() => onNavigateWithFilter('members', {})}
            className="bg-white border border-slate-200 hover:border-red-400 p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tổng Quân Số</span>
              <div className="p-2 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</span>
              <span className="text-xs text-slate-400">đồng chí</span>
            </div>
            <div className="mt-2 text-[11px] text-red-600 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition">
              <span>Xem toàn bộ</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Gender: Nam / Nữ */}
          <div
            id="metric-gender"
            onClick={() => onNavigateWithFilter('members', { gioi_tinh: 'Nam' })}
            className="bg-white border border-slate-200 hover:border-blue-400 p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Giới Tính (Nam / Nữ)</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-blue-600">{maleCount}</span>
              <span className="text-xs text-slate-500">Nam</span>
              <span className="text-slate-300">/</span>
              <span className="text-xl font-bold text-rose-500">{femaleCount}</span>
              <span className="text-xs text-slate-500">Nữ</span>
            </div>
            <div className="mt-2 text-[11px] text-blue-600 font-medium flex items-center gap-1">
              <span>Tỷ lệ nam {totalCount > 0 ? Math.round((maleCount / totalCount) * 100) : 0}%</span>
            </div>
          </div>

          {/* Teams count */}
          <div
            id="metric-teams"
            onClick={() => onNavigateWithFilter('teams')}
            className="bg-white border border-slate-200 hover:border-indigo-400 p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tổ ANTT Cơ Sở</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-indigo-700">{toANTTList.length}</span>
              <span className="text-xs text-slate-400">tổ hoạt động</span>
            </div>
            <div className="mt-2 text-[11px] text-indigo-600 font-medium flex items-center gap-1">
              <span>Bố trí trên {diaBanList.length} ấp</span>
            </div>
          </div>

          {/* Party Members (Đảng viên) */}
          <div
            id="metric-dang-vien"
            onClick={() => onNavigateWithFilter('members', { dang_vien: 'yes' })}
            className="bg-white border border-slate-200 hover:border-amber-500 p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Đảng Viên</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-600">{dangVienCount}</span>
              <span className="text-xs text-slate-400">
                ({totalCount > 0 ? Math.round((dangVienCount / totalCount) * 100) : 0}%)
              </span>
            </div>
            <div className="mt-2 text-[11px] text-amber-600 font-medium flex items-center gap-1">
              <span>Xem danh sách Đảng viên</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* VNeID Mức 2 */}
          <div
            id="metric-vneid"
            onClick={() => onNavigateWithFilter('members', { vneid_muc_2: 'yes' })}
            className="bg-white border border-slate-200 hover:border-emerald-500 p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">VNeID Mức 2</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">{vneidCount}</span>
              <span className="text-xs text-slate-400">
                ({totalCount > 0 ? Math.round((vneidCount / totalCount) * 100) : 0}%)
              </span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span>Đạt chuẩn Đề án 06</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Modules: Patrols, Training, Awards */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Siren className="w-4 h-4 text-red-600" />
              CÔNG TÁC THỰC HIỆN NHIỆM VỤ ANTT ĐỊA BÀN (QUẢN TRỊ NHẬP LIỆU)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhật ký tuần tra hàng ngày, công tác tổ chức tập huấn bồi dưỡng nghiệp vụ và thi đua khen thưởng lực lượng ANTT cơ sở xã Lai Vung.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Patrol Card */}
          <div
            onClick={() => onNavigateWithFilter('patrols' as any)}
            className="p-4 rounded-xl border border-red-200/70 bg-gradient-to-br from-red-50/40 via-white to-red-50/20 hover:border-red-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-900 uppercase">Tuần tra & Phối hợp ANTT</span>
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
                <Siren className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalPatrolCount}</span>
              <span className="text-xs text-slate-500 font-semibold">cuộc tuần tra</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Huy động <strong className="text-red-700">{totalMemberPatrolTurns} lượt</strong> thành viên tham gia tuần tra công khai & mật phục cùng Công an xã.
            </p>
            <div className="mt-3 pt-2 border-t border-red-100 flex items-center justify-between text-xs font-bold text-red-700">
              <span>Ghi sổ / Xem chi tiết</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Training Card */}
          <div
            onClick={() => onNavigateWithFilter('training' as any)}
            className="p-4 rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-50/40 via-white to-blue-50/20 hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase">Tập huấn nghiệp vụ</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalTrainingClasses}</span>
              <span className="text-xs text-slate-500 font-semibold">lớp huấn luyện</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Đào tạo <strong className="text-blue-700">{totalTrainingMembers} lượt</strong> thành viên về pháp luật, PCCC & CNCH, võ thuật tự vệ.
            </p>
            <div className="mt-3 pt-2 border-t border-blue-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Quản lý các đợt tập huấn</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Awards Card */}
          <div
            onClick={() => onNavigateWithFilter('awards' as any)}
            className="p-4 rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase">Thi đua - Khen thưởng</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalAwardsCount}</span>
              <span className="text-xs text-slate-500 font-semibold">quyết định khen</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Đã khen thưởng <strong className="text-amber-800">{totalMembersAwarded} lượt</strong> cá nhân/tập thể cấp UBND tỉnh, Công an tỉnh, UBND xã.
            </p>
            <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-amber-800">
              <span>Hồ sơ khen thưởng</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Positions Breakdown & Bank Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Positions breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Cơ cấu chức vụ ANTT</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </h4>

          <div className="space-y-3">
            <div
              onClick={() => onNavigateWithFilter('members', { chuc_vu: 'Tổ trưởng' })}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-transparent transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="text-xs font-bold text-slate-800">Tổ trưởng</span>
              </div>
              <span className="text-xs font-extrabold text-red-600">{toTruongCount} đồng chí</span>
            </div>

            <div
              onClick={() => onNavigateWithFilter('members', { chuc_vu: 'Tổ phó' })}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-xs font-bold text-slate-800">Tổ phó</span>
              </div>
              <span className="text-xs font-extrabold text-blue-600">{toPhoCount} đồng chí</span>
            </div>

            <div
              onClick={() => onNavigateWithFilter('members', { chuc_vu: 'Thành viên' })}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-transparent transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span className="text-xs font-bold text-slate-800">Thành viên</span>
              </div>
              <span className="text-xs font-extrabold text-slate-700">{thanhVienCount} đồng chí</span>
            </div>
          </div>
        </div>

        {/* Bank Account for Monthly Allowance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Tài khoản chi trả phụ cấp</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </h4>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Đã có tài khoản ngân hàng:</span>
              <span 
                onClick={() => onNavigateWithFilter('members', { co_tai_khoan: 'yes' })}
                className="text-xs font-extrabold text-emerald-600 cursor-pointer hover:underline"
              >
                {bankCount} / {totalCount} ({totalCount > 0 ? Math.round((bankCount / totalCount) * 100) : 0}%)
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${totalCount > 0 ? (bankCount / totalCount) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Chưa có / Chưa cập nhật:</span>
              <span 
                onClick={() => onNavigateWithFilter('members', { co_tai_khoan: 'no' })}
                className="text-rose-600 font-bold cursor-pointer hover:underline"
              >
                {totalCount - bankCount} đồng chí
              </span>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
            Phục vụ chi trả chế độ bồi dưỡng, phụ cấp hằng tháng theo Nghị quyết HĐND tỉnh Đồng Tháp.
          </p>
        </div>

        {/* Age Groups Distribution (Độ tuổi) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Phân bổ theo độ tuổi</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </h4>

          <div className="space-y-2">
            {Object.entries(ageGroupsCount).map(([group, count]) => {
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div
                  key={group}
                  onClick={() => onNavigateWithFilter('members', { age_group: group })}
                  className="p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{group} tuổi</span>
                    <span className="font-bold text-slate-900">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-red-600 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Village (Ấp) & Teams (Tổ ANTT) Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Village distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Phân bổ quân số theo Địa bàn (Ấp)
              </h4>
              <p className="text-[11px] text-slate-400">Nhấn vào ấp để xem danh sách thành viên</p>
            </div>
            <button
              onClick={() => onNavigateWithFilter('territories')}
              className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Quản lý ấp</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {diaBanStats.map(({ ap, count, percent }) => (
              <div
                key={ap.id}
                onClick={() => onNavigateWithFilter('members', { ap_id: ap.id })}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800">{ap.ten_ap}</span>
                  <span className="ml-2 text-[10px] text-slate-400">({ap.ma_ap})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-900 w-12 text-right">
                    {count} đ/c
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education & Professional level */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Trình độ học vấn & chuyên môn
              </h4>
              <p className="text-[11px] text-slate-400">Cơ cấu năng lực cán bộ ANTT cơ sở</p>
            </div>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Trình độ học vấn
              </h5>
              <div className="space-y-2">
                {Object.entries(hocVanGroups).map(([hv, cnt]) => (
                  <div 
                    key={hv} 
                    onClick={() => onNavigateWithFilter('members', { trinh_do_hoc_van: hv })}
                    className="p-2 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-700 font-medium">{hv}</span>
                    <span className="font-bold text-slate-900">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Trình độ chuyên môn
              </h5>
              <div className="space-y-2">
                {Object.entries(chuyenMonGroups).map(([cm, cnt]) => (
                  <div 
                    key={cm} 
                    onClick={() => onNavigateWithFilter('members', { trinh_do_chuyen_mon: cm })}
                    className="p-2 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-700 font-medium truncate max-w-[100px]">{cm}</span>
                    <span className="font-bold text-slate-900">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
