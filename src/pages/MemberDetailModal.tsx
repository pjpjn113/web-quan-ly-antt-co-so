import React from 'react';
import { 
  X, 
  Printer, 
  User, 
  Shield, 
  Calendar, 
  Phone, 
  MapPin, 
  Award, 
  CreditCard, 
  Smartphone, 
  FileText, 
  Eye, 
  EyeOff,
  UserMinus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  CalendarCheck2
} from 'lucide-react';
import { NhanSu, DiaBanAp, ToANTT } from '../types';
import { calculateAge, getAgeGroup, formatDateVN, getMemberServiceDuration } from '../utils/helpers';
import { maskCCCD, maskBankAccount } from '../utils/security';

interface MemberDetailModalProps {
  member: NhanSu | null;
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
  onEdit?: (m: NhanSu) => void;
  onDismiss?: (m: NhanSu) => void;
  onViewDecision?: (m: NhanSu) => void;
  onReactivate?: (m: NhanSu) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  diaBanList,
  toANTTList,
  isOpen,
  onClose,
  canEdit = false,
  onEdit,
  onDismiss,
  onViewDecision,
  onReactivate,
}) => {
  const [showSensitive, setShowSensitive] = React.useState(false);

  if (!isOpen || !member) return null;

  const ap = diaBanList.find(a => a.id === member.ap_id);
  const to = toANTTList.find(t => t.id === member.to_antt_id);
  const age = calculateAge(member.ngay_sinh);
  const ageGroup = getAgeGroup(age);
  const serviceDuration = getMemberServiceDuration(member);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="member-detail-modal"
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto print:max-h-none print:shadow-none print:border-none"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 print:bg-white print:text-black print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/40 text-amber-300 flex items-center justify-center font-black">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold uppercase tracking-wide">
                  HỒ SƠ NHÂN SỰ LỰC LƯỢNG ANTT CƠ SỞ
                </h3>
                {member.is_demo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    DEMO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 print:text-slate-600">
                Công an tỉnh Đồng Tháp – Công an xã Lai Vung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Ẩn/Hiện thông tin bảo mật CCCD và Số tài khoản"
            >
              {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
              <span>{showSensitive ? 'Ẩn thông tin' : 'Hiện đầy đủ'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="In trích lục hồ sơ"
            >
              <Printer className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:overflow-visible">
          {/* Top Profile Summary Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 gap-4">
            <div className="flex items-center gap-4">
              {/* Ảnh chân dung 4x6 tiêu chuẩn hồ sơ */}
              <div className="w-20 h-[120px] sm:w-24 sm:h-[144px] rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-300 shadow-sm shrink-0 flex items-center justify-center relative">
                {member.anh_chan_dung ? (
                  <>
                    <img
                      src={member.anh_chan_dung}
                      alt={member.ho_ten}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 backdrop-blur-xs text-[8px] font-black text-amber-300 border border-white/20">
                      4x6
                    </span>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 text-white flex flex-col items-center justify-center font-black text-2xl shadow-inner border-2 border-amber-400 p-2 text-center">
                    <span>{member.ho_ten.charAt(0)}</span>
                    <span className="text-[8px] font-normal text-amber-200 mt-1 uppercase tracking-tight">Chưa có ảnh 4x6</span>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-lg font-black text-slate-900 uppercase">
                    {member.ho_ten}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    member.chuc_vu === 'Tổ trưởng' 
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : member.chuc_vu === 'Tổ phó'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {member.chuc_vu}
                  </span>
                  {member.chuc_vu_kiem_nhiem && member.chuc_vu_kiem_nhiem !== 'Không kiêm nhiệm' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Kiêm: {member.chuc_vu_kiem_nhiem}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                  <span className="font-mono font-semibold text-red-700">{member.ma_nhan_su}</span>
                  <span>•</span>
                  <span>{to?.ten_to || 'Chưa gán tổ'}</span>
                  <span>•</span>
                  <span>{ap?.ten_ap || 'Chưa có ấp'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0 self-end sm:self-center">
              <div className="text-xs font-bold text-slate-700">
                Tuổi: <strong className="text-red-700">{age !== null ? `${age} tuổi` : '—'}</strong> ({ageGroup})
              </div>
              <div className="flex items-center gap-1.5">
                {member.dang_vien && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Đảng viên
                  </span>
                )}
                {member.vneid_muc_2 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    VNeID Mức 2
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Banner Thông Báo Thôi Việc Nếu Có Quyết Định Nghỉ */}
          {member.trang_thai === 'da_thoi_viec' && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-900 via-slate-900 to-red-950 text-white border border-red-700 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-600/40 border border-red-500/60 text-amber-300 shrink-0 mt-0.5">
                  <UserMinus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                      ĐÃ CHO THÔI THAM GIA LỰC LƯỢNG ANTT CƠ SỞ
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      Số QĐ: {member.so_quyet_dinh_thoi_viec || '.../QĐ-UBND'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1">
                    Cơ quan ban hành: <strong>{member.co_quan_ban_hanh_thoi_viec || 'UBND xã Lai Vung'}</strong> • Ngày ký: {formatDateVN(member.ngay_quyet_dinh_thoi_viec)} • Ngày thôi việc: {formatDateVN(member.ngay_thoi_viec)}
                  </p>
                  <p className="text-[11px] text-amber-200/90 mt-0.5 italic">
                    Lý do: {member.ly_do_thoi_viec || 'Theo quyết định của cấp có thẩm quyền'}
                  </p>
                </div>
              </div>

              {onViewDecision && (
                <button
                  type="button"
                  onClick={() => onViewDecision(member)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm transition shrink-0 whitespace-nowrap self-stretch sm:self-auto justify-center"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Trích lục Quyết định (UBND)</span>
                </button>
              )}
            </div>
          )}

          {/* Card: Căn Cứ Thời Gian Tham Gia Lực Lượng ANTT Cơ Sở (QĐ của UBND Xã) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-600/30 text-amber-300 border border-red-500/40">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Thời gian tham gia lực lượng ANTT cơ sở</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                      căn cứ QĐ UBND xã
                    </span>
                  </h5>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Quyết định số: <strong className="text-amber-300 font-mono">{member.so_quyet_dinh || '124/QĐ-UBND'}</strong> • Ngày QĐ: <strong className="text-white">{formatDateVN(member.ngay_tham_gia_antt)}</strong>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  member.trang_thai === 'da_thoi_viec' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {member.trang_thai === 'da_thoi_viec' ? 'Đã cho thôi tham gia' : 'Đang hoạt động liên tục'}
                </span>
              </div>
            </div>

            {/* 4 khối thông số: Năm, Tháng, Ngày, Tổng số ngày */}
            {serviceDuration ? (
              <div className="mt-3.5 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
                    <div className="text-2xl sm:text-3xl font-black text-amber-400">
                      {serviceDuration.years}
                    </div>
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mt-0.5">
                      Năm
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
                    <div className="text-2xl sm:text-3xl font-black text-amber-300">
                      {serviceDuration.months}
                    </div>
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mt-0.5">
                      Tháng
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
                    <div className="text-2xl sm:text-3xl font-black text-amber-200">
                      {serviceDuration.days}
                    </div>
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mt-0.5">
                      Ngày
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-700/50 hover:bg-red-900/50 transition">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                      {serviceDuration.totalDays.toLocaleString('vi-VN')}
                    </div>
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mt-0.5">
                      Tổng số ngày
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {member.trang_thai === 'da_thoi_viec' 
                        ? `Thời gian phục vụ trong lực lượng (từ ${serviceDuration.startDateFormatted} đến ${serviceDuration.endDateFormatted}):` 
                        : `Tổng thời gian cống hiến liên tục tính đến hiện tại (${serviceDuration.endDateFormatted}):`}
                    </span>
                    <strong className="text-amber-300 font-extrabold text-sm ml-1">
                      {serviceDuration.formattedText}
                    </strong>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    (≈ {(serviceDuration.totalDays / 365.25).toFixed(1)} năm công tác)
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-lg bg-white/5 text-xs text-amber-200/80 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Chưa cập nhật ngày Quyết định tham gia lực lượng ANTT cơ sở của đồng chí này.</span>
              </div>
            )}
          </div>

          {/* Grid Information Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Box 1: Thông tin nhân thân */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-red-600" />
                Thông tin nhân thân & Lý lịch
              </h5>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Giới tính:</span>
                <span className="col-span-2 font-semibold text-slate-800">{member.gioi_tinh}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Ngày sinh:</span>
                <span className="col-span-2 font-semibold text-slate-800">{formatDateVN(member.ngay_sinh)}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Số CCCD:</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">
                  {showSensitive ? member.so_cccd : maskCCCD(member.so_cccd)}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Ngày cấp CCCD:</span>
                <span className="col-span-2 text-slate-800">{formatDateVN(member.ngay_cap_cccd)}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Dân tộc:</span>
                <span className="col-span-2 font-semibold text-slate-800">
                  {member.dan_toc === 'Khác' ? `${member.dan_toc} (${member.dan_toc_khac})` : member.dan_toc}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Tiếng dân tộc:</span>
                <span className="col-span-2 text-slate-800">
                  {member.biet_tieng_dan_toc ? `Có (${member.tieng_dan_toc || 'Biết tiếng'})` : 'Không'}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="col-span-2 font-bold text-blue-700">{member.so_dien_thoai || 'Chưa cập nhật'}</span>
              </div>
            </div>

            {/* Box 2: Cư trú & Công tác ANTT */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Địa bàn & Nhiệm vụ ANTT
              </h5>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Ấp quản lý:</span>
                <span className="col-span-2 font-semibold text-slate-800">{ap?.ten_ap || '—'}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Tổ ANTT:</span>
                <span className="col-span-2 font-bold text-slate-900">{to?.ten_to || '—'}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Chức vụ:</span>
                <span className="col-span-2 font-black text-red-600">{member.chuc_vu}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Kiêm nhiệm:</span>
                <span className="col-span-2 font-bold text-indigo-700">
                  {member.chuc_vu_kiem_nhiem && member.chuc_vu_kiem_nhiem !== 'Không kiêm nhiệm'
                    ? member.chuc_vu_kiem_nhiem
                    : 'Không kiêm nhiệm'}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Ngày tham gia:</span>
                <span className="col-span-2 text-slate-800 font-semibold">{formatDateVN(member.ngay_tham_gia_antt)}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Số Quyết định:</span>
                <span className="col-span-2 text-slate-800 font-mono font-medium">{member.so_quyet_dinh || '124/QĐ-UBND'}</span>
              </div>
              <div className="grid grid-cols-3 py-1 bg-amber-50/60 p-1.5 rounded-lg border border-amber-200/60">
                <span className="text-amber-900 font-bold">Thâm niên tham gia:</span>
                <span className="col-span-2 font-extrabold text-red-700">
                  {serviceDuration ? serviceDuration.formattedText : 'Chưa cập nhật'}
                  {serviceDuration && (
                    <span className="block text-[11px] font-normal text-slate-600 mt-0.5">
                      (Đã phục vụ {serviceDuration.totalDays.toLocaleString('vi-VN')} ngày)
                    </span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Nơi ở hiện nay:</span>
                <span className="col-span-2 text-slate-800">{member.noi_o_hien_nay || 'Xã Lai Vung, Đồng Tháp'}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Quê quán:</span>
                <span className="col-span-2 text-slate-800">{member.que_quan || '—'}</span>
              </div>
            </div>

            {/* Box 3: Trình độ học vấn & Đảng viên */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                Trình độ & Chính trị
              </h5>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Học vấn:</span>
                <span className="col-span-2 font-semibold text-slate-800">{member.trinh_do_hoc_van}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Chuyên môn:</span>
                <span className="col-span-2 font-semibold text-slate-800">{member.trinh_do_chuyen_mon}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Chuyên ngành:</span>
                <span className="col-span-2 text-slate-800">{member.chuyen_nganh || 'Chưa ghi nhận'}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Đảng viên:</span>
                <span className="col-span-2 font-bold text-slate-800">
                  {member.dang_vien ? 'Đảng viên Đảng Cộng sản Việt Nam' : 'Chưa vào Đảng'}
                </span>
              </div>
              {member.dang_vien && (
                <>
                  <div className="grid grid-cols-3 py-1">
                    <span className="text-slate-500">Ngày vào dự bị:</span>
                    <span className="col-span-2 text-slate-800">{formatDateVN(member.ngay_vao_dang_du_bi)}</span>
                  </div>
                  <div className="grid grid-cols-3 py-1">
                    <span className="text-slate-500">Ngày chính thức:</span>
                    <span className="col-span-2 text-slate-800">{formatDateVN(member.ngay_chinh_thuc)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Box 4: Tài khoản ngân hàng & Phụ cấp */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-600" />
                Tài khoản chi trả phụ cấp
              </h5>
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Có tài khoản:</span>
                <span className="col-span-2 font-bold text-slate-800">
                  {member.co_tai_khoan ? 'Đã đăng ký tài khoản ngân hàng' : 'Chưa có tài khoản'}
                </span>
              </div>
              {member.co_tai_khoan && (
                <>
                  <div className="grid grid-cols-3 py-1">
                    <span className="text-slate-500">Ngân hàng:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{member.loai_ngan_hang}</span>
                  </div>
                  <div className="grid grid-cols-3 py-1">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <span className="col-span-2 font-mono font-bold text-slate-900">
                      {showSensitive ? member.so_tai_khoan : maskBankAccount(member.so_tai_khoan)}
                    </span>
                  </div>
                </>
              )}
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">VNeID Mức 2:</span>
                <span className="col-span-2 font-semibold text-emerald-700">
                  {member.vneid_muc_2 ? 'Đã kích hoạt định danh mức 2' : 'Chưa kích hoạt'}
                </span>
              </div>
              {member.ma_bhyt && (
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-500">Mã BHYT:</span>
                  <span className="col-span-2 font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block w-fit">
                    {member.ma_bhyt}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-3 py-1">
                <span className="text-slate-500">Trạng thái:</span>
                <span className="col-span-2 font-bold text-slate-800 capitalize">
                  {member.trang_thai.replace('_', ' ')}
                </span>
              </div>
              {member.ghi_chu && (
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-500">Ghi chú:</span>
                  <span className="col-span-2 italic text-slate-700">{member.ghi_chu}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-[11px] text-slate-400">
            Ngày lập hồ sơ: {formatDateVN(member.created_at)}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {member.trang_thai === 'da_thoi_viec' && onViewDecision && (
              <button
                type="button"
                onClick={() => onViewDecision(member)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-2xs transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Xem Quyết định ({member.so_quyet_dinh_thoi_viec || '.../QĐ-UBND'})</span>
              </button>
            )}

            {member.trang_thai === 'da_thoi_viec' && canEdit && onReactivate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReactivate(member);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục hoạt động</span>
              </button>
            )}

            {member.trang_thai === 'dang_hoat_dong' && canEdit && onDismiss && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDismiss(member);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>QĐ Cho thôi việc</span>
              </button>
            )}

            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(member);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Chỉnh sửa hồ sơ
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
