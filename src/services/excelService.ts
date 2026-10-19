import * as XLSX from 'xlsx';
import { NhanSu, DiaBanAp, ToANTT } from '../types';
import { formatDateVN, getMemberServiceDuration } from '../utils/helpers';

export interface ColumnMapping {
  fileColumn: string;
  systemField: keyof NhanSu | 'bo_qua';
}

export interface ImportValidationResult {
  validRows: Partial<NhanSu>[];
  invalidRows: {
    rowIndex: number;
    data: any;
    errors: string[];
  }[];
  totalRows: number;
}

export const EXCEL_EXPORT_COLUMNS: { key: keyof NhanSu; label: string; defaultSelected: boolean }[] = [
  { key: 'stt', label: 'STT', defaultSelected: true },
  { key: 'ma_nhan_su', label: 'Mã Nhân Sự', defaultSelected: true },
  { key: 'ho_ten', label: 'Họ Và Tên', defaultSelected: true },
  { key: 'gioi_tinh', label: 'Giới Tính', defaultSelected: true },
  { key: 'ngay_sinh', label: 'Ngày Sinh', defaultSelected: true },
  { key: 'so_cccd', label: 'Số CCCD', defaultSelected: true },
  { key: 'ngay_cap_cccd', label: 'Ngày Cấp CCCD', defaultSelected: false },
  { key: 'so_dien_thoai', label: 'Số Điện Thoại', defaultSelected: true },
  { key: 'chuc_vu', label: 'Chức Vụ ANTT', defaultSelected: true },
  { key: 'chuc_vu_kiem_nhiem', label: 'Chức Vụ Kiêm Nhiệm', defaultSelected: true },
  { key: 'ap_id', label: 'Địa Bàn (Ấp)', defaultSelected: true },
  { key: 'to_antt_id', label: 'Tổ ANTT', defaultSelected: true },
  { key: 'dia_chi_chi_tiet', label: 'Địa Chỉ Chi Tiết', defaultSelected: true },
  { key: 'dan_toc', label: 'Dân Tộc', defaultSelected: true },
  { key: 'biet_tieng_dan_toc', label: 'Biết Tiếng Dân Tộc', defaultSelected: false },
  { key: 'tieng_dan_toc', label: 'Tiếng Dân Tộc', defaultSelected: false },
  { key: 'que_quan', label: 'Quê Quán', defaultSelected: false },
  { key: 'trinh_do_hoc_van', label: 'Trình Độ Học Vấn', defaultSelected: true },
  { key: 'trinh_do_chuyen_mon', label: 'Trình Độ Chuyên Môn', defaultSelected: true },
  { key: 'chuyen_nganh', label: 'Chuyên Ngành', defaultSelected: false },
  { key: 'dang_vien', label: 'Đảng Viên', defaultSelected: true },
  { key: 'ngay_vao_dang_du_bi', label: 'Ngày Vào Đảng Dự Bị', defaultSelected: false },
  { key: 'ngay_chinh_thuc', label: 'Ngày Chính Thức', defaultSelected: false },
  { key: 'vneid_muc_2', label: 'VNeID Mức 2', defaultSelected: true },
  { key: 'ngay_tham_gia_antt', label: 'Ngày Tham Gia ANTT', defaultSelected: true },
  { key: 'so_quyet_dinh', label: 'Số Quyết Định', defaultSelected: false },
  { key: 'co_tai_khoan', label: 'Có TK Ngân Hàng', defaultSelected: true },
  { key: 'loai_ngan_hang', label: 'Ngân Hàng', defaultSelected: true },
  { key: 'so_tai_khoan', label: 'Số Tài Khoản', defaultSelected: true },
  { key: 'ma_bhyt', label: 'Mã Thẻ BHYT', defaultSelected: true },
  { key: 'ghi_chu', label: 'Ghi Chú', defaultSelected: false },
];

/**
 * Đọc file Excel (XLSX / XLS / CSV) và trả về mảng object
 */
export async function readExcelFile(file: File): Promise<{ columns: string[]; rows: any[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        if (!jsonData || jsonData.length === 0) {
          resolve({ columns: [], rows: [] });
          return;
        }

        const headerRow = jsonData[0] as string[];
        const columns = headerRow.map((c, i) => (c ? String(c).trim() : `Cột_${i + 1}`));

        const rows = jsonData.slice(1).map((rowArr: any[]) => {
          const rowObj: Record<string, any> = {};
          columns.forEach((col, idx) => {
            rowObj[col] = rowArr[idx] !== undefined ? String(rowArr[idx]).trim() : '';
          });
          return rowObj;
        }).filter(r => Object.values(r).some(val => val !== ''));

        resolve({ columns, rows });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Kiểm tra và chuẩn hóa dữ liệu nhập từ Excel
 */
export function validateImportData(
  rawRows: any[],
  columnMappings: ColumnMapping[],
  existingNhanSu: NhanSu[],
  diaBanList: DiaBanAp[],
  toANTTList: ToANTT[]
): ImportValidationResult {
  const validRows: Partial<NhanSu>[] = [];
  const invalidRows: ImportValidationResult['invalidRows'] = [];
  const seenCCCDsInBatch = new Set<string>();

  // Map ấp theo tên hoặc mã (hỗ trợ cả có và không có tiền tố "Ấp")
  const apMap = new Map<string, string>();
  diaBanList.forEach(ap => {
    const rawName = ap.ten_ap.toLowerCase().trim();
    const shortName = rawName.replace(/^ấp\s+/i, '').trim();
    apMap.set(rawName, ap.id);
    apMap.set(shortName, ap.id);
    apMap.set(ap.ma_ap.toLowerCase().trim(), ap.id);
  });

  // Map tổ ANTT theo tên hoặc mã (hỗ trợ linh hoạt)
  const toMap = new Map<string, string>();
  toANTTList.forEach(to => {
    const rawName = to.ten_to.toLowerCase().trim();
    const shortName = rawName.replace(/^tổ\s+antt\s+/i, '').replace(/^ấp\s+/i, '').trim();
    toMap.set(rawName, to.id);
    toMap.set(shortName, to.id);
    toMap.set(to.ma_to.toLowerCase().trim(), to.id);
  });

  // CCCD đã tồn tại trong hệ thống (chưa bị xóa)
  const existingCCCDSet = new Set(
    existingNhanSu
      .filter(ns => ns.trang_thai !== 'da_xoa' && ns.so_cccd)
      .map(ns => ns.so_cccd.trim())
  );

  rawRows.forEach((row, index) => {
    const rowIndex = index + 2; // Dòng 1 là tiêu đề
    const errors: string[] = [];
    const memberObj: any = {
      trang_thai: 'dang_hoat_dong',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Áp dụng mapping
    columnMappings.forEach(m => {
      if (m.systemField !== 'bo_qua' && row[m.fileColumn] !== undefined) {
        memberObj[m.systemField] = row[m.fileColumn];
      }
    });

    // 1. Kiểm tra họ tên
    if (!memberObj.ho_ten || String(memberObj.ho_ten).trim() === '') {
      errors.push('Thiếu họ và tên (bắt buộc)');
    } else {
      memberObj.ho_ten = String(memberObj.ho_ten).trim();
    }

    // 2. Kiểm tra số CCCD
    const cccd = memberObj.so_cccd ? String(memberObj.so_cccd).replace(/\D/g, '') : '';
    if (!cccd || cccd.length < 9) {
      errors.push('Số CCCD không hợp lệ hoặc bị thiếu (yêu cầu từ 9-12 số)');
    } else {
      // Kiểm tra trùng trong cùng tệp Excel
      if (seenCCCDsInBatch.has(cccd)) {
        errors.push(`Số CCCD "${cccd}" bị trùng lặp ngay trong tệp tải lên`);
      } else {
        seenCCCDsInBatch.add(cccd);
      }

      // Kiểm tra trùng với cơ sở dữ liệu đã có
      if (existingCCCDSet.has(cccd)) {
        errors.push(`Số CCCD "${cccd}" đã tồn tại trong cơ sở dữ liệu hệ thống`);
      }

      memberObj.so_cccd = cccd;
    }

    // 3. Kiểm tra ngày sinh
    if (!memberObj.ngay_sinh || String(memberObj.ngay_sinh).trim() === '') {
      errors.push('Thiếu ngày tháng năm sinh');
    }

    // 4. Giới tính
    const gt = String(memberObj.gioi_tinh || '').toLowerCase();
    if (gt.includes('nữ') || gt.includes('nu') || gt === 'f') {
      memberObj.gioi_tinh = 'Nữ';
    } else {
      memberObj.gioi_tinh = 'Nam';
    }

    // 5. Chức vụ
    const cv = String(memberObj.chuc_vu || '').toLowerCase();
    if (cv.includes('trưởng') || cv.includes('truong')) {
      memberObj.chuc_vu = 'Tổ trưởng';
    } else if (cv.includes('phó') || cv.includes('pho')) {
      memberObj.chuc_vu = 'Tổ phó';
    } else {
      memberObj.chuc_vu = 'Thành viên';
    }

    // 6. Ánh xạ Ấp
    if (memberObj.ap_id) {
      const apInput = String(memberObj.ap_id).toLowerCase().trim();
      const matchedApId = apMap.get(apInput);
      if (matchedApId) {
        memberObj.ap_id = matchedApId;
      } else {
        // Gán ấp đầu tiên nếu không khớp
        memberObj.ap_id = diaBanList[0]?.id || '';
      }
    } else {
      memberObj.ap_id = diaBanList[0]?.id || '';
    }

    // 7. Ánh xạ Tổ ANTT
    if (memberObj.to_antt_id) {
      const toInput = String(memberObj.to_antt_id).toLowerCase().trim();
      const matchedToId = toMap.get(toInput);
      if (matchedToId) {
        memberObj.to_antt_id = matchedToId;
      } else {
        memberObj.to_antt_id = toANTTList[0]?.id || '';
      }
    } else {
      memberObj.to_antt_id = toANTTList[0]?.id || '';
    }

    // 8. Boolean fields
    const dangVienStr = String(memberObj.dang_vien || '').toLowerCase();
    memberObj.dang_vien = dangVienStr === 'có' || dangVienStr === 'true' || dangVienStr === '1' || dangVienStr === 'yes';

    const vneidStr = String(memberObj.vneid_muc_2 || '').toLowerCase();
    memberObj.vneid_muc_2 = vneidStr === 'có' || vneidStr === 'true' || vneidStr === '1' || vneidStr === 'yes' || vneidStr.includes('mức 2');

    const bankStr = String(memberObj.co_tai_khoan || '').toLowerCase();
    memberObj.co_tai_khoan = bankStr === 'có' || bankStr === 'true' || bankStr === '1' || !!memberObj.so_tai_khoan;

    // Dân tộc
    if (!memberObj.dan_toc) memberObj.dan_toc = 'Kinh';
    if (!memberObj.trinh_do_hoc_van) memberObj.trinh_do_hoc_van = 'THPT';
    if (!memberObj.trinh_do_chuyen_mon) memberObj.trinh_do_chuyen_mon = 'Chưa qua đào tạo';
    if (!memberObj.ngay_tham_gia_antt) memberObj.ngay_tham_gia_antt = '2024-07-01';

    if (errors.length > 0) {
      invalidRows.push({ rowIndex, data: row, errors });
    } else {
      validRows.push(memberObj);
    }
  });

  return {
    validRows,
    invalidRows,
    totalRows: rawRows.length,
  };
}

/**
 * Xuất dữ liệu ra file Excel (.xlsx) với các cột được chọn
 */
export function exportMembersToExcel(
  members: NhanSu[],
  selectedColumns: (keyof NhanSu)[],
  diaBanList: DiaBanAp[],
  toANTTList: ToANTT[],
  fileName = 'Danh_sach_ANTT_Xa_Lai_Vung.xlsx'
): void {
  const apMap = new Map(diaBanList.map(a => [a.id, a.ten_ap]));
  const toMap = new Map(toANTTList.map(t => [t.id, t.ten_to]));

  const colDefinitions = EXCEL_EXPORT_COLUMNS.filter(col => selectedColumns.includes(col.key));

  const exportData = members.map((member, idx) => {
    const row: Record<string, any> = {};
    colDefinitions.forEach(col => {
      let val: any = member[col.key];

      if (col.key === 'stt') {
        val = idx + 1;
      } else if (col.key === 'ap_id') {
        val = apMap.get(member.ap_id) || member.ap_id;
      } else if (col.key === 'to_antt_id') {
        val = toMap.get(member.to_antt_id) || member.to_antt_id;
      } else if (col.key === 'dang_vien' || col.key === 'vneid_muc_2' || col.key === 'co_tai_khoan' || col.key === 'biet_tieng_dan_toc') {
        val = val ? 'Có' : 'Không';
      } else if (col.key === 'ngay_sinh' || col.key === 'ngay_cap_cccd' || col.key === 'ngay_vao_dang_du_bi' || col.key === 'ngay_chinh_thuc' || col.key === 'ngay_tham_gia_antt') {
        val = formatDateVN(val);
      }

      row[col.label] = val || '';
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Thanh_Vien_ANTT');

  // Auto-fit column widths
  const colWidths = colDefinitions.map(col => ({
    wch: Math.max(col.label.length + 4, 14),
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, fileName);
}

/**
 * Tải file Excel mẫu chuẩn phục vụ nhập liệu
 */
export function downloadExcelTemplate(): void {
  const templateData = [
    {
      'STT': 1,
      'Mã Nhân Sự': 'ANTT-LV-099',
      'Họ Và Tên': 'Nguyễn Văn Mẫu',
      'Giới Tính': 'Nam',
      'Ngày Sinh (YYYY-MM-DD)': '1988-05-15',
      'Số CCCD (12 số)': '087088009999',
      'Ngày Cấp CCCD': '2022-06-10',
      'Số Điện Thoại': '0918112233',
      'Chức Vụ (Tổ trưởng/Tổ phó/Thành viên)': 'Thành viên',
      'Chức Vụ Kiêm Nhiệm': 'Tổ trưởng dân phòng',
      'Tên Ấp': 'Ấp An Bình',
      'Tên Tổ ANTT': 'Tổ ANTT Ấp An Bình',
      'Địa Chỉ Chi Tiết': 'Tổ 3, Ấp An Bình',
      'Quê Quán': 'Xã Lai Vung, Đồng Tháp',
      'Dân Tộc': 'Kinh',
      'Trình Độ Học Vấn': 'THPT',
      'Trình Độ Chuyên Môn': 'Trung cấp',
      'Chuyên Ngành': 'Quân sự cơ sở',
      'Đảng Viên (Có/Không)': 'Có',
      'Ngày Vào Đảng Dự Bị': '2015-02-03',
      'Ngày Chính Thức': '2016-02-03',
      'VNeID Mức 2 (Có/Không)': 'Có',
      'Ngày Tham Gia ANTT': '2024-07-01',
      'Số Quyết Định': '124/QĐ-UBND',
      'Có TK Ngân Hàng (Có/Không)': 'Có',
      'Ngân Hàng': 'Agribank Lai Vung',
      'Số Tài Khoản': '6508205192841',
      'Ghi Chú': 'Mẫu dữ liệu chuẩn',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Nhap_ANTT');
  XLSX.writeFile(workbook, 'Bieu_Mau_Nhap_Thanh_Vien_ANTT_Lai_Vung.xlsx');
}

/**
 * Service đối tượng gom các phương thức Excel phục vụ Import và Export
 */
export const excelService = {
  downloadTemplate: () => {
    downloadExcelTemplate();
  },

  exportToExcel: (
    members: NhanSu[],
    diaBanList: DiaBanAp[],
    toANTTList: ToANTT[],
    options?: { maskCCCD?: boolean; sheetName?: string }
  ) => {
    const apMap = new Map(diaBanList.map(a => [a.id, a.ten_ap]));
    const toMap = new Map(toANTTList.map(t => [t.id, t.ten_to]));

    const exportRows = members.map((m, idx) => {
      const duration = getMemberServiceDuration(m);
      return {
        'STT': idx + 1,
        'Mã Nhân Sự': m.ma_nhan_su,
        'Họ Và Tên': m.ho_ten,
        'Giới Tính': m.gioi_tinh,
        'Ngày Sinh': formatDateVN(m.ngay_sinh),
        'Số CCCD': options?.maskCCCD && m.so_cccd.length >= 12
          ? m.so_cccd.slice(0, 3) + '******' + m.so_cccd.slice(-3)
          : m.so_cccd,
        'Số Điện Thoại': m.so_dien_thoai || '',
        'Chức Vụ': m.chuc_vu,
        'Chức Vụ Kiêm Nhiệm': m.chuc_vu_kiem_nhiem || 'Không kiêm nhiệm',
        'Ấp Phụ Trách': apMap.get(m.ap_id) || m.ap_id,
        'Tổ ANTT': toMap.get(m.to_antt_id) || m.to_antt_id,
        'Số QĐ Tham Gia (UBND)': m.so_quyet_dinh || '124/QĐ-UBND',
        'Ngày QĐ Tham Gia': formatDateVN(m.ngay_tham_gia_antt),
        'Thâm Niên Tham Gia': duration && duration.isValid ? duration.formattedText : 'Chưa cập nhật',
        'Tổng Số Ngày Tham Gia': duration && duration.isValid ? duration.totalDays : 0,
        'Địa Chỉ': m.dia_chi_chi_tiet || m.noi_o_hien_nay || '',
        'Dân Tộc': m.dan_toc,
        'Trình Độ Học Vấn': m.trinh_do_hoc_van,
        'Trình Độ Chuyên Môn': m.trinh_do_chuyen_mon,
        'Đảng Viên': m.dang_vien ? 'Đảng viên' : 'Chưa',
        'VNeID Mức 2': m.vneid_muc_2 ? 'Đã kích hoạt' : 'Chưa',
        'TK Ngân Hàng': m.co_tai_khoan ? `${m.loai_ngan_hang} - ${options?.maskCCCD && m.so_tai_khoan ? '***' + m.so_tai_khoan.slice(-4) : m.so_tai_khoan}` : 'Chưa có',
        'Trạng Thái': m.trang_thai === 'dang_hoat_dong' ? 'Đang hoạt động' : 'Đã nghỉ/chuyển công tác'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, options?.sheetName || 'ANTT_Lai_Vung');

    const colWidths = [
      { wch: 6 },
      { wch: 14 },
      { wch: 24 },
      { wch: 10 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 22 },
      { wch: 28 },
      { wch: 22 }, // Số QĐ
      { wch: 16 }, // Ngày QĐ
      { wch: 24 }, // Thâm niên
      { wch: 20 }, // Tổng số ngày
      { wch: 28 },
      { wch: 10 },
      { wch: 14 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 28 },
      { wch: 18 }
    ];
    worksheet['!cols'] = colWidths;

    const timeStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Danh_Sach_ANTT_Xa_Lai_Vung_${timeStr}.xlsx`);
  },

  exportDismissedMembersToExcel: (
    members: NhanSu[],
    diaBanList: DiaBanAp[],
    toANTTList: ToANTT[],
    fileName?: string
  ) => {
    const dismissed = members.filter(m => m.trang_thai === 'da_thoi_viec');
    const apMap = new Map(diaBanList.map(a => [a.id, a.ten_ap]));
    const toMap = new Map(toANTTList.map(t => [t.id, t.ten_to]));

    const rows = dismissed.map((m, idx) => {
      const duration = getMemberServiceDuration(m);
      return {
        'STT': idx + 1,
        'Mã Nhân Sự': m.ma_nhan_su,
        'Họ Và Tên': m.ho_ten,
        'Giới Tính': m.gioi_tinh,
        'Ngày Sinh': formatDateVN(m.ngay_sinh),
        'Số CCCD': m.so_cccd,
        'Số Điện Thoại': m.so_dien_thoai || '',
        'Chức Vụ ANTT': m.chuc_vu,
        'Chức Vụ Kiêm Nhiệm': m.chuc_vu_kiem_nhiem || 'Không kiêm nhiệm',
        'Địa Bàn (Ấp)': apMap.get(m.ap_id) || m.ap_id,
        'Tổ ANTT': toMap.get(m.to_antt_id) || m.to_antt_id,
        'Số Quyết Định Nghỉ (UBND)': m.so_quyet_dinh_thoi_viec || '',
        'Ngày Ký Quyết Định': formatDateVN(m.ngay_quyet_dinh_thoi_viec),
        'Ngày Thôi Việc': formatDateVN(m.ngay_thoi_viec),
        'Ngày Tham Gia Ban Đầu': formatDateVN(m.ngay_tham_gia_antt),
        'Thời Gian Đã Cống Hiến': duration && duration.isValid ? duration.formattedText : 'Chưa cập nhật',
        'Tổng Số Ngày Cống Hiến': duration && duration.isValid ? duration.totalDays : 0,
        'Cơ Quan Ban Hành': m.co_quan_ban_hanh_thoi_viec || 'UBND xã Lai Vung',
        'Người Ký': m.nguoi_ky_thoi_viec || 'Chủ tịch UBND xã',
        'Lý Do Cho Thôi Tham Gia': m.ly_do_thoi_viec || '',
        'Thu Hồi Thẻ & Trang Bị': m.da_thu_hoi_the_trang_thiet_bi !== false ? 'Đã thu hồi đầy đủ' : 'Chưa thu hồi',
        'Ghi Chú': m.ghi_chu_thoi_viec || m.ghi_chu || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DS_Thoi_Viec_ANTT');

    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 24 },
      { wch: 10 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 16 },
      { wch: 20 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 }, // Số QĐ nghỉ
      { wch: 16 }, // Ngày ký
      { wch: 16 }, // Ngày thôi việc
      { wch: 20 }, // Ngày tham gia
      { wch: 24 }, // Thời gian cống hiến
      { wch: 20 }, // Tổng số ngày
      { wch: 24 }, // Cơ quan ban hành
      { wch: 18 }, // Người ký
      { wch: 35 }, // Lý do
      { wch: 22 }, // Thu hồi thẻ
      { wch: 24 }
    ];

    const timeStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, fileName || `Danh_Sach_Thoi_Tham_Gia_ANTT_Xa_Lai_Vung_${timeStr}.xlsx`);
  },

  parseAndValidateExcel: async (
    file: File,
    diaBanList: DiaBanAp[],
    toANTTList: ToANTT[],
    existingMembers: NhanSu[]
  ): Promise<{
    totalRows: number;
    validMembers: NhanSu[];
    errors: { row: number; ho_ten: string; reason: string }[];
  }> => {
    const { rows } = await readExcelFile(file);
    const validMembers: NhanSu[] = [];
    const errors: { row: number; ho_ten: string; reason: string }[] = [];

    const existingCCCDs = new Set(existingMembers.map(m => m.so_cccd.trim()));
    const seenCCCDInFile = new Set<string>();

    const apMapByName = new Map<string, string>();
    diaBanList.forEach(a => {
      const rawName = a.ten_ap.toLowerCase().trim();
      const shortName = rawName.replace(/^ấp\s+/i, '').trim();
      apMapByName.set(rawName, a.id);
      apMapByName.set(shortName, a.id);
      apMapByName.set(a.ma_ap.toLowerCase().trim(), a.id);
    });

    const toMapByName = new Map<string, string>();
    toANTTList.forEach(t => {
      const rawName = t.ten_to.toLowerCase().trim();
      const shortName = rawName.replace(/^tổ\s+antt\s+/i, '').replace(/^ấp\s+/i, '').trim();
      toMapByName.set(rawName, t.id);
      toMapByName.set(shortName, t.id);
      toMapByName.set(t.ma_to.toLowerCase().trim(), t.id);
    });

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // header is row 1
      const hoTen = String(row['Họ Và Tên'] || row['Họ và tên'] || row['ho_ten'] || '').trim();
      const rawCCCD = String(row['Số CCCD (12 số)'] || row['Số CCCD'] || row['so_cccd'] || '').trim();
      const cccd = rawCCCD.replace(/\D/g, '');
      const ngaySinhRaw = String(row['Ngày Sinh (YYYY-MM-DD)'] || row['Ngày Sinh'] || row['ngay_sinh'] || '').trim();
      const chucVuRaw = String(row['Chức Vụ (Tổ trưởng/Tổ phó/Thành viên)'] || row['Chức Vụ'] || row['chuc_vu'] || 'Thành viên').trim();
      const tenAp = String(row['Tên Ấp'] || row['Ấp'] || '').trim().toLowerCase();
      const tenTo = String(row['Tên Tổ ANTT'] || row['Tổ ANTT'] || '').trim().toLowerCase();

      // Validate required fields
      if (!hoTen) {
        errors.push({ row: rowNum, ho_ten: hoTen || 'Trống', reason: 'Thiếu Họ và Tên' });
        return;
      }

      if (!cccd || cccd.length < 9) {
        errors.push({ row: rowNum, ho_ten: hoTen, reason: `Số CCCD không hợp lệ: "${rawCCCD}"` });
        return;
      }

      if (existingCCCDs.has(cccd)) {
        errors.push({ row: rowNum, ho_ten: hoTen, reason: `Số CCCD "${cccd}" đã tồn tại trên hệ thống` });
        return;
      }

      if (seenCCCDInFile.has(cccd)) {
        errors.push({ row: rowNum, ho_ten: hoTen, reason: `Số CCCD "${cccd}" bị trùng lặp nhiều lần trong file Excel` });
        return;
      }
      seenCCCDInFile.add(cccd);

      // Validate or resolve Ap & To
      let apId = apMapByName.get(tenAp);
      if (!apId && diaBanList.length > 0) {
        apId = diaBanList[0].id;
      }

      let toId = toMapByName.get(tenTo);
      if (!toId) {
        const teamInAp = toANTTList.find(t => t.ap_id === apId);
        toId = teamInAp ? teamInAp.id : (toANTTList[0]?.id || 'to_default');
      }

      // Format date if needed
      let formattedNgaySinh = ngaySinhRaw;
      if (ngaySinhRaw.includes('/')) {
        const parts = ngaySinhRaw.split('/');
        if (parts.length === 3) {
          formattedNgaySinh = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

      // Format Ngày tham gia ANTT
      const rawNgayThamGia = String(
        row['Ngày QĐ Tham Gia'] ||
        row['Ngày Tham Gia ANTT (YYYY-MM-DD)'] || 
        row['Ngày Tham Gia ANTT'] || 
        row['Ngày Tham Gia'] || 
        row['ngay_tham_gia_antt'] || 
        '2024-07-01'
      ).trim();
      let formattedNgayThamGia = rawNgayThamGia;
      if (rawNgayThamGia.includes('/')) {
        const parts = rawNgayThamGia.split('/');
        if (parts.length === 3) {
          formattedNgayThamGia = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

      const rawSoQD = String(
        row['Số QĐ Tham Gia (UBND)'] ||
        row['Số Quyết Định'] ||
        row['Số QĐ'] ||
        row['so_quyet_dinh'] ||
        '124/QĐ-UBND'
      ).trim();

      const randomCode = 'LV-' + Math.floor(100 + Math.random() * 900);
      const isDangVien = String(row['Đảng Viên (Có/Không)'] || row['Đảng Viên'] || '').toLowerCase().includes('có');
      const isVneid = String(row['VNeID Mức 2 (Có/Không)'] || row['VNeID'] || '').toLowerCase().includes('có');
      const isBank = String(row['Có TK Ngân Hàng (Có/Không)'] || row['Có TK'] || '').toLowerCase().includes('có');

      const chucVuKiemNhiemRaw = String(row['Chức Vụ Kiêm Nhiệm'] || row['Kiêm Nhiệm'] || '').trim();

      const newMember: NhanSu = {
        id: 'member_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        ma_nhan_su: String(row['Mã Nhân Sự'] || randomCode).trim(),
        stt: idx + 1,
        ho_ten: hoTen,
        gioi_tinh: String(row['Giới Tính'] || 'Nam').trim() as any,
        ngay_sinh: formattedNgaySinh || '1990-01-01',
        so_cccd: cccd,
        ngay_cap_cccd: String(row['Ngày Cấp CCCD'] || '').trim(),
        so_dien_thoai: String(row['Số Điện Thoại'] || '').trim(),
        chuc_vu: (['Tổ trưởng', 'Tổ phó', 'Thành viên'].includes(chucVuRaw) ? chucVuRaw : 'Thành viên') as any,
        chuc_vu_kiem_nhiem: chucVuKiemNhiemRaw || 'Không kiêm nhiệm',
        ap_id: apId || 'ap_1',
        to_antt_id: toId || 'to_1',
        que_quan: String(row['Quê Quán'] || 'Xã Lai Vung, Đồng Tháp').trim(),
        dia_chi_chi_tiet: String(row['Địa Chỉ Chi Tiết'] || row['Địa Chỉ'] || '').trim(),
        noi_o_hien_nay: String(row['Địa Chỉ Chi Tiết'] || row['Địa Chỉ'] || '').trim(),
        dan_toc: String(row['Dân Tộc'] || 'Kinh').trim() as any,
        biet_tieng_dan_toc: false,
        trinh_do_hoc_van: (String(row['Trình Độ Học Vấn'] || 'THPT').trim()) as any,
        trinh_do_chuyen_mon: (String(row['Trình Độ Chuyên Môn'] || 'Chưa qua đào tạo').trim()) as any,
        chuyen_nganh: String(row['Chuyên Ngành'] || '').trim(),
        dang_vien: isDangVien,
        ngay_vao_dang_du_bi: String(row['Ngày Vào Đảng Dự Bị'] || '').trim(),
        ngay_chinh_thuc: String(row['Ngày Chính Thức'] || '').trim(),
        vneid_muc_2: isVneid,
        ngay_tham_gia_antt: formattedNgayThamGia || '2024-07-01',
        so_quyet_dinh: rawSoQD || '124/QĐ-UBND',
        co_tai_khoan: isBank,
        loai_ngan_hang: String(row['Ngân Hàng'] || '').trim(),
        so_tai_khoan: String(row['Số Tài Khoản'] || '').trim(),
        ghi_chu: String(row['Ghi Chú'] || '').trim(),
        trang_thai: 'dang_hoat_dong',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      validMembers.push(newMember);
    });

    return {
      totalRows: rows.length,
      validMembers,
      errors,
    };
  },
};
