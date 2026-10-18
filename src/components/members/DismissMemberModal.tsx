import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert, 
  Building2, 
  UserMinus,
  FileCheck2,
  Info,
  Clock
} from 'lucide-react';
import { NhanSu, DiaBanAp, ToANTT, DismissMemberData } from '../../types';
import { formatDateVN, calculateServiceDuration } from '../../utils/helpers';

interface DismissMemberModalProps {
  isOpen: boolean;
  member: NhanSu | null;
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  onClose: () => void;
  onConfirm: (memberId: string, data: DismissMemberData) => void;
}

const LY_DO_PRESETS = [
  'Có đơn xin thôi tham gia lực lượng theo nguyện vọng cá nhân',
  'Không còn đủ sức khỏe để thực hiện nhiệm vụ theo kết luận của cơ sở y tế',
  'Chuyển nơi cư trú ra ngoài địa bàn xã Lai Vung',
  'Quá độ tuổi tham gia lực lượng ANTT cơ sở theo quy định',
  'Không chấp hành sự phân công hoặc vi phạm kỷ luật của lực lượng',
  'Bị truy cứu trách nhiệm hình sự hoặc xử lý hành chính theo quy định',
  'Khác (ghi rõ nội dung cụ thể bên dưới)',
];

export const DismissMemberModal: React.FC<DismissMemberModalProps> = ({
  isOpen,
  member,
  diaBanList,
  toANTTList,
  onClose,
  onConfirm,
}) => {
  const [soQDNumber, setSoQDNumber] = useState('');
  const [ngayQuyetDinh, setNgayQuyetDinh] = useState('');
  const [ngayThoiViec, setNgayThoiViec] = useState('');
  const [coQuanBanHanh, setCoQuanBanHanh] = useState('Ủy ban nhân dân xã Lai Vung');
  const [nguoiKy, setNguoiKy] = useState('Chủ tịch UBND xã');
  const [selectedLyDoPreset, setSelectedLyDoPreset] = useState(LY_DO_PRESETS[0]);
  const [lyDoChiTiet, setLyDoChiTiet] = useState('');
  const [daThuHoiThe, setDaThuHoiThe] = useState(true);
  const [daThuHoiTrangPhuc, setDaThuHoiTrangPhuc] = useState(true);
  const [ghiChu, setGhiChu] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && member) {
      const today = new Date().toISOString().split('T')[0];
      setNgayQuyetDinh(member.ngay_quyet_dinh_thoi_viec || today);
      setNgayThoiViec(member.ngay_thoi_viec || today);
      setCoQuanBanHanh(member.co_quan_ban_hanh_thoi_viec || 'Ủy ban nhân dân xã Lai Vung');
      setNguoiKy(member.nguoi_ky_thoi_viec || 'Chủ tịch UBND xã');
      
      // Extract number from existing format if present
      if (member.so_quyet_dinh_thoi_viec) {
        const raw = member.so_quyet_dinh_thoi_viec.replace(/\/QĐ-UBND$/i, '').trim();
        setSoQDNumber(raw);
      } else {
        setSoQDNumber('');
      }

      if (member.ly_do_thoi_viec) {
        if (LY_DO_PRESETS.includes(member.ly_do_thoi_viec)) {
          setSelectedLyDoPreset(member.ly_do_thoi_viec);
          setLyDoChiTiet('');
        } else {
          setSelectedLyDoPreset('Khác (ghi rõ nội dung cụ thể bên dưới)');
          setLyDoChiTiet(member.ly_do_thoi_viec);
        }
      } else {
        setSelectedLyDoPreset(LY_DO_PRESETS[0]);
        setLyDoChiTiet('');
      }

      setDaThuHoiThe(member.da_thu_hoi_the_trang_thiet_bi !== false);
      setDaThuHoiTrangPhuc(true);
      setGhiChu(member.ghi_chu_thoi_viec || '');
      setErrorMessage('');
    }
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  const ap = diaBanList.find(a => a.id === member.ap_id);
  const to = toANTTList.find(t => t.id === member.to_antt_id);

  // Tính số ngày, tháng, năm tham gia lực lượng ANTT đến ngày thôi việc
  const serviceDuration = calculateServiceDuration(
    member.ngay_tham_gia_antt,
    ngayThoiViec || new Date().toISOString().split('T')[0],
    true
  );

  // Compute final Decision Number format (.../QĐ-UBND)
  const cleanInput = soQDNumber.trim();
  const fullSoQuyetDinh = cleanInput 
    ? (cleanInput.toUpperCase().endsWith('/QĐ-UBND') ? cleanInput : `${cleanInput}/QĐ-UBND`)
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!cleanInput) {
      setErrorMessage('Vui lòng nhập số Quyết định của UBND cấp xã (ví dụ: 45 hoặc 45/2024 để thành 45/QĐ-UBND)');
      return;
    }

    if (!ngayQuyetDinh) {
      setErrorMessage('Vui lòng chọn Ngày ký ban hành Quyết định.');
      return;
    }

    if (!ngayThoiViec) {
      setErrorMessage('Vui lòng chọn Ngày chính thức cho thôi tham gia.');
      return;
    }

    const finalLyDo = selectedLyDoPreset === 'Khác (ghi rõ nội dung cụ thể bên dưới)'
      ? lyDoChiTiet.trim() || 'Thôi tham gia theo quyết định của cấp có thẩm quyền'
      : selectedLyDoPreset;

    const data: DismissMemberData = {
      so_quyet_dinh_thoi_viec: fullSoQuyetDinh,
      ngay_quyet_dinh_thoi_viec: ngayQuyetDinh,
      ngay_thoi_viec: ngayThoiViec,
      co_quan_ban_hanh_thoi_viec: coQuanBanHanh.trim() || 'Ủy ban nhân dân xã Lai Vung',
      nguoi_ky_thoi_viec: nguoiKy.trim(),
      ly_do_thoi_viec: finalLyDo,
      da_thu_hoi_the_trang_thiet_bi: daThuHoiThe && daThuHoiTrangPhuc,
      ghi_chu_thoi_viec: ghiChu.trim(),
    };

    onConfirm(member.id, data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        id="dismiss-member-modal"
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto"
      >
        {/* Header Quốc hiệu & Tiêu đề */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-slate-900 to-red-900 text-white flex items-center justify-between border-b border-red-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/30 border border-red-500/50 text-red-200 shadow-inner">
              <UserMinus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                  Cấp thẩm quyền: UBND cấp xã
                </span>
                <span className="text-[10px] text-slate-300">
                  Luật ANTT cơ sở 2023
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wide mt-1">
                QUYẾT ĐỊNH CHO THÔI THAM GIA LỰC LƯỢNG ANTT CƠ SỞ
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Member Card Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 flex items-center gap-3.5">
            {/* Ảnh đại diện 4x6 thu nhỏ */}
            <div className="w-14 h-20 rounded-lg overflow-hidden bg-white border border-slate-300 shadow-2xs shrink-0 flex items-center justify-center relative">
              {member.anh_chan_dung ? (
                <img
                  src={member.anh_chan_dung}
                  alt={member.ho_ten}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 text-white flex flex-col items-center justify-center font-bold text-base">
                  <span>{member.ho_ten.charAt(0)}</span>
                  <span className="text-[7px] font-normal text-amber-200">4x6</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-slate-900 uppercase">
                  {member.ho_ten}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  member.chuc_vu === 'Tổ trưởng'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : member.chuc_vu === 'Tổ phó'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {member.chuc_vu}
                </span>
                {member.chuc_vu_kiem_nhiem && member.chuc_vu_kiem_nhiem !== 'Không kiêm nhiệm' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {member.chuc_vu_kiem_nhiem}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 mt-1.5">
                <div>
                  <span className="text-slate-400">Mã nhân sự: </span>
                  <span className="font-mono font-bold text-red-700">{member.ma_nhan_su}</span>
                </div>
                <div>
                  <span className="text-slate-400">Số CCCD: </span>
                  <span className="font-mono font-medium">{member.so_cccd}</span>
                </div>
                <div>
                  <span className="text-slate-400">Đơn vị: </span>
                  <span>{to?.ten_to || 'Tổ ANTT'} – {ap?.ten_ap || 'Ấp'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Ngày tham gia: </span>
                  <span className="font-semibold text-slate-800">{formatDateVN(member.ngay_tham_gia_antt)}</span>
                </div>

                {serviceDuration && serviceDuration.isValid && (
                  <div className="sm:col-span-2 pt-1 border-t border-slate-200 mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-red-600" />
                      Thời gian tham gia đến ngày thôi:
                    </span>
                    <span className="font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {serviceDuration.formattedText} ({serviceDuration.totalDays.toLocaleString('vi-VN')} ngày)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Nhập Số Quyết Định và Thẩm Quyền */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">Quy định pháp lý: </span>
                Căn cứ Điều 17 Luật Lực lượng tham gia bảo vệ ANTT ở cơ sở số 30/2023/QH15, 
                việc cho thôi tham gia lực lượng do <strong className="text-red-700">Chủ tịch UBND cấp xã ra Quyết định</strong> 
                theo đề nghị của Trưởng Công an cấp xã.
              </div>
            </div>

            {/* Input Số Quyết Định chuẩn (.../QĐ-UBND) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                Số Quyết định cho thôi tham gia <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center shadow-xs rounded-xl overflow-hidden border border-slate-300 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-500/20 bg-white">
                <div className="px-3.5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold border-r border-slate-200 flex items-center gap-1.5 shrink-0">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>Số:</span>
                </div>
                <input
                  type="text"
                  required
                  value={soQDNumber}
                  onChange={(e) => setSoQDNumber(e.target.value)}
                  placeholder="Nhập số QĐ (ví dụ: 45 hoặc 45/2024)"
                  className="flex-1 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none"
                  autoFocus
                />
                <div className="px-3 py-2.5 bg-red-50 text-red-800 text-xs font-extrabold border-l border-red-200 tracking-wider shrink-0">
                  /QĐ-UBND
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
                <span>
                  Định dạng trích xuất: <strong className="text-red-700 font-mono">{fullSoQuyetDinh || '.../QĐ-UBND'}</strong>
                </span>
                <span className="text-slate-400">
                  (Hệ thống tự động chuẩn hoá đuôi <strong>/QĐ-UBND</strong>)
                </span>
              </div>
            </div>

            {/* Cơ quan ban hành & Người ký */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cơ quan ban hành Quyết định
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={coQuanBanHanh}
                    onChange={(e) => setCoQuanBanHanh(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-red-500"
                    placeholder="Ủy ban nhân dân xã Lai Vung"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Người ký Quyết định
                </label>
                <select
                  value={nguoiKy}
                  onChange={(e) => setNguoiKy(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-red-500"
                >
                  <option value="Chủ tịch UBND xã">Chủ tịch UBND xã</option>
                  <option value="Phó Chủ tịch UBND xã">Phó Chủ tịch UBND xã (Ký thay)</option>
                  <option value="Chủ tịch UBND cấp xã">Chủ tịch UBND cấp xã</option>
                </select>
              </div>
            </div>

            {/* Ngày ban hành & Ngày hiệu lực */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày ký ban hành Quyết định <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={ngayQuyetDinh}
                    onChange={(e) => setNgayQuyetDinh(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày chính thức thôi tham gia <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={ngayThoiViec}
                    onChange={(e) => setNgayThoiViec(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Lý do cho thôi tham gia */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Lý do cho thôi tham gia lực lượng <span className="text-red-600">*</span>
            </label>
            <select
              value={selectedLyDoPreset}
              onChange={(e) => setSelectedLyDoPreset(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-red-500 shadow-2xs"
            >
              {LY_DO_PRESETS.map((lydo, idx) => (
                <option key={idx} value={lydo}>
                  {lydo}
                </option>
              ))}
            </select>

            {selectedLyDoPreset === 'Khác (ghi rõ nội dung cụ thể bên dưới)' && (
              <textarea
                rows={2}
                value={lyDoChiTiet}
                onChange={(e) => setLyDoChiTiet(e.target.value)}
                placeholder="Nhập lý do cho thôi tham gia cụ thể theo biên bản họp hoặc quyết định..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-red-500"
              />
            )}
          </div>

          {/* Section: Thu hồi trang thiết bị & giấy tờ */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-slate-600" />
              Công tác bàn giao & Thu hồi trang thiết bị
            </h5>
            <div className="space-y-2 pt-1 text-xs">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={daThuHoiThe}
                  onChange={(e) => setDaThuHoiThe(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Đã thu hồi <strong>Giấy chứng nhận / Thẻ thành viên</strong> bảo vệ ANTT ở cơ sở</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={daThuHoiTrangPhuc}
                  onChange={(e) => setDaThuHoiTrangPhuc(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Đã thu hồi <strong>Trang phục, phù hiệu, biển hiệu và công cụ hỗ trợ</strong> (nếu có)</span>
              </label>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú thêm về quyết định / Hồ sơ lưu trữ
            </label>
            <input
              type="text"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="VD: Lưu hồ sơ tại Công an xã Lai Vung; bàn giao nhiệm vụ cho đồng chí..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-red-500"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold rounded-xl shadow-md transition transform active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Xác nhận ban hành & Cho thôi tham gia</span>
          </button>
        </div>
      </div>
    </div>
  );
};
