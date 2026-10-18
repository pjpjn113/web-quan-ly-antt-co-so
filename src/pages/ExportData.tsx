import React, { useState } from 'react';
import { Download, FileSpreadsheet, Printer, Shield, CheckCircle, FileText } from 'lucide-react';
import { NhanSu, DiaBanAp, ToANTT } from '../types';
import { excelService } from '../services/excelService';

interface ExportDataProps {
  members: NhanSu[];
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
}

export const ExportData: React.FC<ExportDataProps> = ({
  members,
  diaBanList,
  toANTTList,
}) => {
  const [targetAp, setTargetAp] = useState('all');
  const [targetChucVu, setTargetChucVu] = useState('all');
  const [targetTrangThai, setTargetTrangThai] = useState<'dang_hoat_dong' | 'da_thoi_viec' | 'all'>('all');
  const [maskSensitive, setMaskSensitive] = useState(false);

  // Lọc tập dữ liệu cần xuất
  const exportableMembers = members
    .filter(m => m.trang_thai !== 'da_xoa')
    .filter(m => {
      if (targetTrangThai !== 'all' && m.trang_thai !== targetTrangThai) return false;
      if (targetAp !== 'all' && m.ap_id !== targetAp) return false;
      if (targetChucVu !== 'all' && m.chuc_vu !== targetChucVu) return false;
      return true;
    });

  const handleExportXLSX = () => {
    if (targetTrangThai === 'da_thoi_viec') {
      excelService.exportDismissedMembersToExcel(exportableMembers, diaBanList, toANTTList);
    } else {
      excelService.exportToExcel(exportableMembers, diaBanList, toANTTList, {
        maskCCCD: maskSensitive,
        sheetName: targetTrangThai === 'dang_hoat_dong' ? 'QuanSo_DangHoatDong' : 'DanhSach_ANTT_LaiVung',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
          XUẤT DỮ LIỆU & BÁO CÁO TRÍCH XUẤT EXCEL
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Trích xuất danh sách quân số lực lượng ANTT cơ sở theo chuẩn biểu mẫu phục vụ báo cáo Công an tỉnh Đồng Tháp và Công an xã Lai Vung
        </p>
      </div>

      {/* Configuration Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
          Tùy chọn phạm vi trích xuất dữ liệu
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Trạng thái quân số
            </label>
            <select
              value={targetTrangThai}
              onChange={e => setTargetTrangThai(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800"
            >
              <option value="all">Tất cả nhân sự (Bao gồm đã nghỉ)</option>
              <option value="dang_hoat_dong">Quân số đang hoạt động</option>
              <option value="da_thoi_viec">Đã cho thôi tham gia (Có QĐ UBND xã)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phạm vi địa bàn (Ấp)
            </label>
            <select
              value={targetAp}
              onChange={e => setTargetAp(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Toàn xã Lai Vung (Tất cả các ấp)</option>
              {diaBanList.map(a => (
                <option key={a.id} value={a.id}>{a.ten_ap}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chức vụ quân số
            </label>
            <select
              value={targetChucVu}
              onChange={e => setTargetChucVu(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả chức vụ (Tổ trưởng, Tổ phó, Tổ viên)</option>
              <option value="Tổ trưởng">Chỉ Tổ trưởng</option>
              <option value="Tổ phó">Chỉ Tổ phó</option>
              <option value="Thành viên">Chỉ Thành viên</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={maskSensitive}
                onChange={e => setMaskSensitive(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300"
              />
              <span className="text-xs font-bold text-slate-800">
                Ẩn CCCD & STK
              </span>
            </label>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-xs text-slate-700">
              Số lượng hồ sơ sẵn sàng xuất: <strong className="text-slate-900 font-extrabold">{exportableMembers.length} đồng chí</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Xem in văn bản</span>
            </button>

            <button
              type="button"
              id="btn-do-export-excel"
              onClick={handleExportXLSX}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>XUẤT RA EXCEL (.XLSX)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
