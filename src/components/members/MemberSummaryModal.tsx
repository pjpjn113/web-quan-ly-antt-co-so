import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  Users,
  Shield,
  Calendar,
  GraduationCap,
  MapPin,
  Check,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { NhanSu, DiaBanAp, ToANTT } from '../../types';
import { calculateAge, getAgeGroup } from '../../utils/helpers';

interface MemberSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: NhanSu[];
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  onSelectApAndClose?: (apId: string) => void;
  onSelectChucVuAndClose?: (chucVu: string) => void;
}

export const MemberSummaryModal: React.FC<MemberSummaryModalProps> = ({
  isOpen,
  onClose,
  members,
  diaBanList,
  toANTTList,
  onSelectApAndClose,
  onSelectChucVuAndClose,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dia_ban' | 'nhom_tuoi' | 'trinh_do'>('dia_ban');

  if (!isOpen) return null;

  const activeMembers = members.filter(m => m.trang_thai !== 'da_xoa');
  const totalCount = activeMembers.length;

  // Compute breakdown data for 19 hamlets
  const apBreakdowns = diaBanList.map((ap, index) => {
    const list = activeMembers.filter(m => m.ap_id === ap.id);
    const total = list.length;
    const toTruong = list.filter(m => m.chuc_vu === 'Tổ trưởng').length;
    const toPho = list.filter(m => m.chuc_vu === 'Tổ phó').length;
    const thanhVien = list.filter(m => m.chuc_vu === 'Thành viên').length;

    // Age groups
    let age18_30 = 0;
    let age31_45 = 0;
    let age46_60 = 0;
    let ageOver60 = 0;

    list.forEach(m => {
      const age = calculateAge(m.ngay_sinh);
      if (age !== null) {
        if (age <= 30) age18_30++;
        else if (age <= 45) age31_45++;
        else if (age <= 60) age46_60++;
        else ageOver60++;
      }
    });

    // Education
    const thpt = list.filter(m => m.trinh_do_hoc_van === 'THPT').length;
    const thcs = list.filter(m => m.trinh_do_hoc_van === 'THCS').length;
    const tieuHoc = list.filter(m => m.trinh_do_hoc_van === 'Tiểu học' || m.trinh_do_hoc_van === 'Khác').length;

    // Professional qualification
    const daiHocCaoDang = list.filter(m => m.trinh_do_chuyen_mon === 'Đại học' || m.trinh_do_chuyen_mon === 'Cao đẳng' || m.trinh_do_chuyen_mon === 'Sau đại học').length;
    const trungCapSoCap = list.filter(m => m.trinh_do_chuyen_mon === 'Trung cấp' || m.trinh_do_chuyen_mon === 'Sơ cấp').length;
    const chuaQuaDaoTao = list.filter(m => !m.trinh_do_chuyen_mon || m.trinh_do_chuyen_mon === 'Chưa qua đào tạo').length;

    const dangVien = list.filter(m => m.dang_vien).length;
    const vneid = list.filter(m => m.vneid_muc_2).length;

    return {
      stt: index + 1,
      apId: ap.id,
      maAp: ap.ma_ap,
      tenAp: ap.ten_ap,
      total,
      toTruong,
      toPho,
      thanhVien,
      age18_30,
      age31_45,
      age46_60,
      ageOver60,
      thpt,
      thcs,
      tieuHoc,
      daiHocCaoDang,
      trungCapSoCap,
      chuaQuaDaoTao,
      dangVien,
      vneid,
    };
  });

  // Calculate grand totals across all 19 hamlets
  const grandTotal = {
    total: apBreakdowns.reduce((acc, r) => acc + r.total, 0),
    toTruong: apBreakdowns.reduce((acc, r) => acc + r.toTruong, 0),
    toPho: apBreakdowns.reduce((acc, r) => acc + r.toPho, 0),
    thanhVien: apBreakdowns.reduce((acc, r) => acc + r.thanhVien, 0),
    age18_30: apBreakdowns.reduce((acc, r) => acc + r.age18_30, 0),
    age31_45: apBreakdowns.reduce((acc, r) => acc + r.age31_45, 0),
    age46_60: apBreakdowns.reduce((acc, r) => acc + r.age46_60, 0),
    ageOver60: apBreakdowns.reduce((acc, r) => acc + r.ageOver60, 0),
    thpt: apBreakdowns.reduce((acc, r) => acc + r.thpt, 0),
    thcs: apBreakdowns.reduce((acc, r) => acc + r.thcs, 0),
    tieuHoc: apBreakdowns.reduce((acc, r) => acc + r.tieuHoc, 0),
    daiHocCaoDang: apBreakdowns.reduce((acc, r) => acc + r.daiHocCaoDang, 0),
    trungCapSoCap: apBreakdowns.reduce((acc, r) => acc + r.trungCapSoCap, 0),
    chuaQuaDaoTao: apBreakdowns.reduce((acc, r) => acc + r.chuaQuaDaoTao, 0),
    dangVien: apBreakdowns.reduce((acc, r) => acc + r.dangVien, 0),
    vneid: apBreakdowns.reduce((acc, r) => acc + r.vneid, 0),
  };

  // Matrix: Age Groups x Position
  const ageGroupKeys = ['18–30', '31–45', '46–60', '61–70', 'Trên 70'] as const;
  const ageMatrix = ageGroupKeys.map(grp => {
    const list = activeMembers.filter(m => {
      const age = calculateAge(m.ngay_sinh);
      return getAgeGroup(age) === grp;
    });
    const tt = list.filter(m => m.chuc_vu === 'Tổ trưởng').length;
    const tp = list.filter(m => m.chuc_vu === 'Tổ phó').length;
    const tv = list.filter(m => m.chuc_vu === 'Thành viên').length;
    const total = list.length;
    const pct = totalCount > 0 ? Math.round((total / totalCount) * 100) : 0;
    return { grp, tt, tp, tv, total, pct };
  });

  // Matrix: Education & Qualifications x Position
  const educationList = [
    { label: 'THPT (Trung học phổ thông)', hv: 'THPT' },
    { label: 'THCS (Trung học cơ sở)', hv: 'THCS' },
    { label: 'Tiểu học', hv: 'Tiểu học' },
    { label: 'Khác', hv: 'Khác' },
  ];

  const educationMatrix = educationList.map(item => {
    const list = activeMembers.filter(m => (m.trinh_do_hoc_van || 'Khác') === item.hv);
    const tt = list.filter(m => m.chuc_vu === 'Tổ trưởng').length;
    const tp = list.filter(m => m.chuc_vu === 'Tổ phó').length;
    const tv = list.filter(m => m.chuc_vu === 'Thành viên').length;
    const total = list.length;
    const pct = totalCount > 0 ? Math.round((total / totalCount) * 100) : 0;
    return { label: item.label, tt, tp, tv, total, pct };
  });

  const profList = [
    { label: 'Đại học / Sau đại học', filter: (m: NhanSu) => m.trinh_do_chuyen_mon === 'Đại học' || m.trinh_do_chuyen_mon === 'Sau đại học' },
    { label: 'Cao đẳng', filter: (m: NhanSu) => m.trinh_do_chuyen_mon === 'Cao đẳng' },
    { label: 'Trung cấp', filter: (m: NhanSu) => m.trinh_do_chuyen_mon === 'Trung cấp' },
    { label: 'Sơ cấp', filter: (m: NhanSu) => m.trinh_do_chuyen_mon === 'Sơ cấp' },
    { label: 'Chưa qua đào tạo', filter: (m: NhanSu) => !m.trinh_do_chuyen_mon || m.trinh_do_chuyen_mon === 'Chưa qua đào tạo' },
  ];

  const profMatrix = profList.map(item => {
    const list = activeMembers.filter(item.filter);
    const tt = list.filter(m => m.chuc_vu === 'Tổ trưởng').length;
    const tp = list.filter(m => m.chuc_vu === 'Tổ phó').length;
    const tv = list.filter(m => m.chuc_vu === 'Thành viên').length;
    const total = list.length;
    const pct = totalCount > 0 ? Math.round((total / totalCount) * 100) : 0;
    return { label: item.label, tt, tp, tv, total, pct };
  });

  // Export to Excel handler
  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: 19 Hamlets
    const hamletRows = apBreakdowns.map(r => ({
      'STT': r.stt,
      'Mã Ấp': r.maAp,
      'Tên Ấp': r.tenAp,
      'Tổng Quân Số': r.total,
      'Tổ Trưởng': r.toTruong,
      'Tổ Phó': r.toPho,
      'Thành Viên': r.thanhVien,
      'Tuổi 18–30': r.age18_30,
      'Tuổi 31–45': r.age31_45,
      'Tuổi 46–60': r.age46_60,
      'Tuổi Trên 60': r.ageOver60,
      'Học Vấn THPT': r.thpt,
      'Học Vấn THCS': r.thcs,
      'Tiểu Học/Khác': r.tieuHoc,
      'ĐH / CĐ': r.daiHocCaoDang,
      'Trung Cấp / Sơ Cấp': r.trungCapSoCap,
      'Chưa Qua Đào Tạo': r.chuaQuaDaoTao,
      'Đảng Viên': r.dangVien,
      'VNeID Mức 2': r.vneid,
    }));

    hamletRows.push({
      'STT': 'TỔNG CỘNG' as any,
      'Mã Ấp': 'TOÀN XÃ LAI VUNG',
      'Tên Ấp': '19 Ấp',
      'Tổng Quân Số': grandTotal.total,
      'Tổ Trưởng': grandTotal.toTruong,
      'Tổ Phó': grandTotal.toPho,
      'Thành Viên': grandTotal.thanhVien,
      'Tuổi 18–30': grandTotal.age18_30,
      'Tuổi 31–45': grandTotal.age31_45,
      'Tuổi 46–60': grandTotal.age46_60,
      'Tuổi Trên 60': grandTotal.ageOver60,
      'Học Vấn THPT': grandTotal.thpt,
      'Học Vấn THCS': grandTotal.thcs,
      'Tiểu Học/Khác': grandTotal.tieuHoc,
      'ĐH / CĐ': grandTotal.daiHocCaoDang,
      'Trung Cấp / Sơ Cấp': grandTotal.trungCapSoCap,
      'Chưa Qua Đào Tạo': grandTotal.chuaQuaDaoTao,
      'Đảng Viên': grandTotal.dangVien,
      'VNeID Mức 2': grandTotal.vneid,
    });

    const ws1 = XLSX.utils.json_to_sheet(hamletRows);
    XLSX.utils.book_append_sheet(workbook, ws1, 'Thong_Ke_19_Ap');

    // Sheet 2: Age groups matrix
    const ageRows = ageMatrix.map(r => ({
      'Nhóm Tuổi': `${r.grp} tuổi`,
      'Tổ Trưởng': r.tt,
      'Tổ Phó': r.tp,
      'Thành Viên': r.tv,
      'Tổng Số': r.total,
      'Tỷ Lệ (%)': `${r.pct}%`,
    }));
    ageRows.push({
      'Nhóm Tuổi': 'TỔNG CỘNG',
      'Tổ Trưởng': grandTotal.toTruong,
      'Tổ Phó': grandTotal.toPho,
      'Thành Viên': grandTotal.thanhVien,
      'Tổng Số': grandTotal.total,
      'Tỷ Lệ (%)': '100%',
    });
    const ws2 = XLSX.utils.json_to_sheet(ageRows);
    XLSX.utils.book_append_sheet(workbook, ws2, 'Nhom_Tuoi_Va_Chuc_Vu');

    // Sheet 3: Qualifications
    const qualRows = [
      ...educationMatrix.map(r => ({
        'Phân Loại': 'Học vấn phổ thông',
        'Trình Độ': r.label,
        'Tổ Trưởng': r.tt,
        'Tổ Phó': r.tp,
        'Thành Viên': r.tv,
        'Tổng Số': r.total,
        'Tỷ Lệ (%)': `${r.pct}%`,
      })),
      ...profMatrix.map(r => ({
        'Phân Loại': 'Đào tạo chuyên môn',
        'Trình Độ': r.label,
        'Tổ Trưởng': r.tt,
        'Tổ Phó': r.tp,
        'Thành Viên': r.tv,
        'Tổng Số': r.total,
        'Tỷ Lệ (%)': `${r.pct}%`,
      })),
    ];
    const ws3 = XLSX.utils.json_to_sheet(qualRows);
    XLSX.utils.book_append_sheet(workbook, ws3, 'Trinh_Do_Va_Chuc_Vu');

    XLSX.writeFile(workbook, 'Thong_Ke_Quan_So_ANTT_Xa_Lai_Vung.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                THỐNG KÊ CHI TIẾT
              </span>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wide">
                BẢNG TỔNG HỢP SỐ LƯỢNG QUÂN SỐ ANTT XÃ LAI VUNG
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Thống kê số lượng thành viên theo từng nhóm tuổi, từng ấp (19 ấp), chức vụ và trình độ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Xuất bảng thống kê ra file Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              title="In báo cáo"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('dia_ban')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'dia_ban'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>1. Thống kê theo 19 Ấp</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('nhom_tuoi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'nhom_tuoi'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>2. Cơ cấu Độ tuổi x Chức vụ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('trinh_do')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'trinh_do'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>3. Cơ cấu Trình độ x Chức vụ</span>
            </button>
          </div>

          <span className="text-xs font-bold text-slate-600 hidden sm:inline">
            Tổng quân số: <strong className="text-red-700">{totalCount}</strong> đồng chí
          </span>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* TAB 1: 19 ẤP MATRIX */}
          {activeSubTab === 'dia_ban' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <p>Bảng phân bổ chi tiết quân số của toàn bộ 19 ấp thuộc xã Lai Vung (Đơn vị tính: Đồng chí)</p>
                <span className="text-[11px] text-slate-500 italic">Nhấp vào nút &quot;Lọc&quot; để xem danh sách nhân sự từng ấp</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                      <th className="py-2.5 px-3 text-center w-10">STT</th>
                      <th className="py-2.5 px-3">Tên Ấp</th>
                      <th className="py-2.5 px-2.5 text-center bg-red-950/80">Tổng số</th>
                      <th className="py-2.5 px-2.5 text-center">Tổ trưởng</th>
                      <th className="py-2.5 px-2.5 text-center">Tổ phó</th>
                      <th className="py-2.5 px-2.5 text-center">Thành viên</th>
                      <th className="py-2.5 px-2 text-center bg-slate-800">18–30t</th>
                      <th className="py-2.5 px-2 text-center bg-slate-800">31–45t</th>
                      <th className="py-2.5 px-2 text-center bg-slate-800">46–60t</th>
                      <th className="py-2.5 px-2 text-center bg-slate-800">&gt;60t</th>
                      <th className="py-2.5 px-2 text-center">THPT</th>
                      <th className="py-2.5 px-2 text-center">THCS</th>
                      <th className="py-2.5 px-2 text-center">ĐH/CĐ</th>
                      <th className="py-2.5 px-2.5 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {apBreakdowns.map((row) => (
                      <tr key={row.apId} className="hover:bg-slate-50 transition">
                        <td className="py-2 px-3 text-center font-bold text-slate-500">{row.stt}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          <div>{row.tenAp}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{row.maAp}</div>
                        </td>
                        <td className="py-2 px-2.5 text-center font-black text-red-700 bg-red-50/50">
                          {row.total}
                        </td>
                        <td className="py-2 px-2.5 text-center font-bold text-slate-800">
                          {row.toTruong > 0 ? (
                            <span className="text-red-600 font-black">{row.toTruong}</span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-center font-bold text-slate-800">
                          {row.toPho > 0 ? (
                            <span className="text-blue-600 font-black">{row.toPho}</span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-center font-medium text-slate-700">
                          {row.thanhVien}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-700 bg-slate-50/50">{row.age18_30}</td>
                        <td className="py-2 px-2 text-center text-slate-700 bg-slate-50/50">{row.age31_45}</td>
                        <td className="py-2 px-2 text-center text-slate-700 bg-slate-50/50">{row.age46_60}</td>
                        <td className="py-2 px-2 text-center text-slate-700 bg-slate-50/50">{row.ageOver60}</td>
                        <td className="py-2 px-2 text-center text-slate-700">{row.thpt}</td>
                        <td className="py-2 px-2 text-center text-slate-700">{row.thcs}</td>
                        <td className="py-2 px-2 text-center text-slate-700">{row.daiHocCaoDang}</td>
                        <td className="py-2 px-2.5 text-center">
                          {onSelectApAndClose && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectApAndClose(row.apId);
                                onClose();
                              }}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded text-[11px] font-bold transition"
                              title={`Lọc danh sách theo ${row.tenAp}`}
                            >
                              Lọc
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* GRAND TOTAL ROW */}
                    <tr className="bg-slate-900 text-white font-black text-xs">
                      <td colSpan={2} className="py-3 px-3 uppercase text-center tracking-wider">
                        TỔNG CỘNG TOÀN XÃ (19 ẤP)
                      </td>
                      <td className="py-3 px-2.5 text-center text-sm font-black text-red-400 bg-red-950">
                        {grandTotal.total}
                      </td>
                      <td className="py-3 px-2.5 text-center text-red-300">{grandTotal.toTruong}</td>
                      <td className="py-3 px-2.5 text-center text-blue-300">{grandTotal.toPho}</td>
                      <td className="py-3 px-2.5 text-center text-emerald-300">{grandTotal.thanhVien}</td>
                      <td className="py-3 px-2 text-center bg-slate-800">{grandTotal.age18_30}</td>
                      <td className="py-3 px-2 text-center bg-slate-800">{grandTotal.age31_45}</td>
                      <td className="py-3 px-2 text-center bg-slate-800">{grandTotal.age46_60}</td>
                      <td className="py-3 px-2 text-center bg-slate-800">{grandTotal.ageOver60}</td>
                      <td className="py-3 px-2 text-center">{grandTotal.thpt}</td>
                      <td className="py-3 px-2 text-center">{grandTotal.thcs}</td>
                      <td className="py-3 px-2 text-center">{grandTotal.daiHocCaoDang}</td>
                      <td className="py-3 px-2.5 text-center text-[10px] opacity-75">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: NHÓM TUỔI X CHỨC VỤ MATRIX */}
          {activeSubTab === 'nhom_tuoi' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Ma trận số lượng thành viên phân bổ theo từng Nhóm tuổi và Chức vụ đảm nhiệm
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                      <th className="py-3 px-4">Nhóm tuổi</th>
                      <th className="py-3 px-4 text-center">Tổ trưởng</th>
                      <th className="py-3 px-4 text-center">Tổ phó</th>
                      <th className="py-3 px-4 text-center">Thành viên</th>
                      <th className="py-3 px-4 text-center bg-slate-800">Tổng cộng</th>
                      <th className="py-3 px-4 text-center">Tỷ lệ cơ cấu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ageMatrix.map(row => (
                      <tr key={row.grp} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {row.grp} tuổi
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-red-700">
                          {row.tt}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-blue-700">
                          {row.tp}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-700">
                          {row.tv}
                        </td>
                        <td className="py-3 px-4 text-center font-black text-slate-900 bg-slate-50">
                          {row.total} đ/c
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-bold text-slate-700 w-10 text-right">{row.pct}%</span>
                            <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-red-600 h-full" style={{ width: `${row.pct}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}

                    <tr className="bg-slate-900 text-white font-black">
                      <td className="py-3 px-4 uppercase">TỔNG CỘNG</td>
                      <td className="py-3 px-4 text-center text-red-300">{grandTotal.toTruong}</td>
                      <td className="py-3 px-4 text-center text-blue-300">{grandTotal.toPho}</td>
                      <td className="py-3 px-4 text-center text-emerald-300">{grandTotal.thanhVien}</td>
                      <td className="py-3 px-4 text-center text-sm font-black text-amber-400 bg-slate-800">
                        {grandTotal.total} đ/c
                      </td>
                      <td className="py-3 px-4 text-center">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TRÌNH ĐỘ X CHỨC VỤ MATRIX */}
          {activeSubTab === 'trinh_do' && (
            <div className="space-y-6">
              {/* Học vấn phổ thông */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  1. Trình độ học vấn phổ thông theo chức vụ
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                        <th className="py-2.5 px-4">Trình độ học vấn</th>
                        <th className="py-2.5 px-4 text-center">Tổ trưởng</th>
                        <th className="py-2.5 px-4 text-center">Tổ phó</th>
                        <th className="py-2.5 px-4 text-center">Thành viên</th>
                        <th className="py-2.5 px-4 text-center bg-slate-800">Tổng cộng</th>
                        <th className="py-2.5 px-4 text-center">Tỷ lệ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {educationMatrix.map(row => (
                        <tr key={row.label} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{row.label}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-red-700">{row.tt}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-blue-700">{row.tp}</td>
                          <td className="py-2.5 px-4 text-center text-slate-700">{row.tv}</td>
                          <td className="py-2.5 px-4 text-center font-black text-slate-900 bg-slate-50">{row.total}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-slate-700">{row.pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Đào tạo chuyên môn */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  2. Trình độ đào tạo chuyên môn, nghiệp vụ theo chức vụ
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                        <th className="py-2.5 px-4">Trình độ chuyên môn</th>
                        <th className="py-2.5 px-4 text-center">Tổ trưởng</th>
                        <th className="py-2.5 px-4 text-center">Tổ phó</th>
                        <th className="py-2.5 px-4 text-center">Thành viên</th>
                        <th className="py-2.5 px-4 text-center bg-slate-800">Tổng cộng</th>
                        <th className="py-2.5 px-4 text-center">Tỷ lệ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profMatrix.map(row => (
                        <tr key={row.label} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{row.label}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-red-700">{row.tt}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-blue-700">{row.tp}</td>
                          <td className="py-2.5 px-4 text-center text-slate-700">{row.tv}</td>
                          <td className="py-2.5 px-4 text-center font-black text-slate-900 bg-slate-50">{row.total}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-slate-700">{row.pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            Số liệu thống kê tự động đồng bộ theo thời gian thực từ cơ sở dữ liệu nhân sự ANTT xã Lai Vung
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Đóng bảng
          </button>
        </div>
      </div>
    </div>
  );
};
