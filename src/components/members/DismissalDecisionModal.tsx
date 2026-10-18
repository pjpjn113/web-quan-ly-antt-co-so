import React from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Download, 
  Building2, 
  ShieldCheck, 
  Calendar,
  CheckCircle2,
  Edit
} from 'lucide-react';
import { NhanSu, DiaBanAp, ToANTT } from '../../types';
import { formatDateVN, calculateServiceDuration } from '../../utils/helpers';

interface DismissalDecisionModalProps {
  isOpen: boolean;
  member: NhanSu | null;
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  onClose: () => void;
  onEditDecision?: (member: NhanSu) => void;
}

export const DismissalDecisionModal: React.FC<DismissalDecisionModalProps> = ({
  isOpen,
  member,
  diaBanList,
  toANTTList,
  onClose,
  onEditDecision,
}) => {
  if (!isOpen || !member) return null;

  const ap = diaBanList.find(a => a.id === member.ap_id);
  const to = toANTTList.find(t => t.id === member.to_antt_id);

  // Tính số ngày, tháng, năm tham gia lực lượng ANTT cơ sở
  const serviceDuration = calculateServiceDuration(
    member.ngay_tham_gia_antt,
    member.ngay_thoi_viec || member.ngay_quyet_dinh_thoi_viec,
    true
  );

  const handlePrint = () => {
    window.print();
  };

  const qdDate = member.ngay_quyet_dinh_thoi_viec 
    ? new Date(member.ngay_quyet_dinh_thoi_viec)
    : new Date();

  const day = qdDate.getDate();
  const month = qdDate.getMonth() + 1;
  const year = qdDate.getFullYear();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        id="dismissal-decision-modal"
        className="w-full max-w-3xl max-h-[94vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto"
      >
        {/* Top Control Bar (Ẩn khi in ấn) */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/30 border border-red-500/40 text-amber-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                TRÍCH LỤC QUYẾT ĐỊNH CHO THÔI THAM GIA LỰC LƯỢNG ANTT CƠ SỞ
              </h3>
              <p className="text-xs text-slate-300">
                Ủy ban nhân dân cấp xã ban hành – Mẫu văn bản hành chính quy chuẩn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditDecision && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditDecision(member);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
              >
                <Edit className="w-3.5 h-3.5 text-amber-300" />
                <span>Sửa QĐ</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In quyết định</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Body - Printable */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white font-serif text-slate-900 leading-relaxed text-sm print:p-0 print:overflow-visible">
          {/* Header 2 cột: Cơ quan & Quốc hiệu */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-300 text-center font-sans">
            <div>
              <div className="text-xs uppercase font-medium tracking-tight text-slate-600">
                ỦY BAN NHÂN DÂN HUYỆN LAI VUNG
              </div>
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 mt-0.5">
                {member.co_quan_ban_hanh_thoi_viec || 'ỦY BAN NHÂN DÂN XÃ LAI VUNG'}
              </div>
              <div className="text-[11px] font-mono font-bold text-red-700 mt-1">
                Số: {member.so_quyet_dinh_thoi_viec || '.../QĐ-UBND'}
              </div>
            </div>

            <div>
              <div className="text-xs sm:text-sm font-black uppercase text-slate-900">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-xs font-bold text-slate-800 underline underline-offset-4 mt-0.5">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="text-[11px] italic text-slate-600 mt-1 font-serif">
                Lai Vung, ngày {day} tháng {month < 10 ? `0${month}` : month} năm {year}
              </div>
            </div>
          </div>

          {/* Title Document */}
          <div className="text-center my-6 space-y-1 font-sans">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900">
              QUYẾT ĐỊNH
            </h2>
            <p className="text-xs sm:text-sm font-bold uppercase text-slate-700 tracking-wide">
              Về việc cho thôi tham gia lực lượng tham gia bảo vệ an ninh, trật tự ở cơ sở
            </p>
            <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-2"></div>
          </div>

          {/* Căn cứ pháp lý */}
          <div className="text-xs italic space-y-1.5 text-slate-700 pl-4 border-l-2 border-slate-200 mb-6 font-serif">
            <p>
              - Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015; Luật sửa đổi, bổ sung một số điều của Luật Tổ chức Chính phủ và Luật Tổ chức chính quyền địa phương ngày 22 tháng 11 năm 2019;
            </p>
            <p>
              - Căn cứ Luật Lực lượng tham gia bảo vệ an ninh, trật tự ở cơ sở số 30/2023/QH15 ngày 28 tháng 11 năm 2023;
            </p>
            <p>
              - Căn cứ Nghị quyết của Hội đồng nhân dân tỉnh Đồng Tháp quy định tiêu chí thành lập và mức hỗ trợ cho lực lượng tham gia bảo vệ an ninh, trật tự ở cơ sở trên địa bàn tỉnh Đồng Tháp;
            </p>
            <p>
              - Xét Đề nghị của Trưởng Công an xã Lai Vung về việc kiện toàn, tinh gọn và cho thôi tham gia lực lượng đối với cá nhân có nguyện vọng hoặc điều kiện theo quy định.
            </p>
          </div>

          {/* Phần Quyết định */}
          <div className="text-center font-sans font-black text-sm uppercase my-4">
            CHỦ TỊCH ỦY BAN NHÂN DÂN XÃ LAI VUNG QUYẾT ĐỊNH:
          </div>

          <div className="space-y-4 text-justify font-serif text-xs sm:text-sm leading-relaxed">
            <div>
              <p>
                <strong>Điều 1.</strong> Nay cho thôi tham gia lực lượng tham gia bảo vệ an ninh, trật tự ở cơ sở đối với đồng chí:
              </p>
              <div className="my-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 font-sans text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">Họ và tên: </span>
                    <strong className="text-slate-900 uppercase font-bold text-sm">{member.ho_ten}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Mã nhân sự: </span>
                    <span className="font-mono font-bold text-red-700">{member.ma_nhan_su}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500">Ngày sinh: </span>
                    <span>{formatDateVN(member.ngay_sinh)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Số CCCD: </span>
                    <span className="font-mono">{member.so_cccd}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Chức vụ ANTT: </span>
                    <strong>{member.chuc_vu}</strong> {member.chuc_vu_kiem_nhiem ? `(Kiêm: ${member.chuc_vu_kiem_nhiem})` : ''}
                  </div>
                  <div>
                    <span className="text-slate-500">Đơn vị: </span>
                    <span>{to?.ten_to || 'Tổ ANTT'} – {ap?.ten_ap || 'Ấp'}</span>
                  </div>
                </div>
              </div>

              <p className="mt-2">
                - <strong>Kể từ ngày:</strong> <span className="font-sans font-bold text-slate-900">{formatDateVN(member.ngay_thoi_viec || member.ngay_quyet_dinh_thoi_viec)}</span>.
              </p>
              {serviceDuration && serviceDuration.isValid && (
                <p className="mt-1">
                  - <strong>Thời gian tham gia lực lượng ANTT ở cơ sở:</strong> từ ngày <span className="font-sans font-semibold">{serviceDuration.startDateFormatted}</span> đến ngày <span className="font-sans font-semibold">{serviceDuration.endDateFormatted}</span> (Tổng thời gian cống hiến: <strong className="font-sans text-slate-950">{serviceDuration.formattedText}</strong>, tổng cộng <strong>{serviceDuration.totalDays.toLocaleString('vi-VN')} ngày</strong>).
                </p>
              )}
              <p className="mt-1">
                - <strong>Lý do cho thôi tham gia:</strong> {member.ly_do_thoi_viec || 'Theo nguyện vọng cá nhân và sự thống nhất của cấp có thẩm quyền'}.
              </p>
            </div>

            <div>
              <p>
                <strong>Điều 2.</strong> Đồng chí <strong>{member.ho_ten}</strong> có trách nhiệm bàn giao toàn bộ Giấy chứng nhận tham gia lực lượng, trang phục, phù hiệu, biển hiệu và các trang thiết bị, công cụ hỗ trợ (nếu có) lại cho Ban Chỉ huy Công an xã Lai Vung theo đúng quy định của Bộ Công an.
              </p>
              <p className="mt-1 text-slate-600 italic text-xs">
                {member.da_thu_hoi_the_trang_thiet_bi !== false 
                  ? '(Ghi chú: Đã hoàn tất thủ tục thu hồi thẻ và trang thiết bị theo biên bản bàn giao)'
                  : '(Ghi chú: Đang tiến hành thủ tục thu hồi thẻ và trang phục)'}
              </p>
            </div>

            <div>
              <p>
                <strong>Điều 3.</strong> Văn phòng Hội đồng nhân dân và Ủy ban nhân dân xã, Trưởng Công an xã Lai Vung, các bộ phận chuyên môn liên quan, Ban Nhân dân {ap?.ten_ap || 'Ấp'} và đồng chí có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này./.
              </p>
            </div>
          </div>

          {/* Nơi nhận & Ký tên */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-4 font-sans text-xs">
            <div className="text-[11px] space-y-1">
              <div className="font-bold italic">Nơi nhận:</div>
              <div>- Như Điều 3;</div>
              <div>- Công an tỉnh Đồng Tháp (để b/c);</div>
              <div>- Công an huyện Lai Vung (để b/c);</div>
              <div>- Đảng ủy, HĐND xã Lai Vung;</div>
              <div>- Lưu: VT, CAX, Hồ sơ nhân sự.</div>
            </div>

            <div className="text-center space-y-12">
              <div>
                <div className="uppercase font-bold text-slate-700 text-xs">
                  {member.nguoi_ky_thoi_viec || 'CHỦ TỊCH'}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  (Ký tên, đóng dấu)
                </div>
              </div>
              <div className="font-bold text-slate-900 pt-8 uppercase">
                {member.co_quan_ban_hanh_thoi_viec || 'UBND XÃ LAI VUNG'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Hồ sơ lưu trữ chính thức tại Công an xã Lai Vung</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>In quyết định</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
