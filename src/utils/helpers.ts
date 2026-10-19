import { NhanSu, AgeGroup, MissingFieldsScanResult } from '../types';

/**
 * Tính toán tuổi tự động từ ngày sinh (YYYY-MM-DD)
 * Không cho phép nhập tuổi thủ công!
 */
export function calculateAge(dobString?: string): number | null {
  if (!dobString || dobString.trim() === '') return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

/**
 * Phân nhóm tuổi tự động theo quy định:
 * 18–30, 31–45, 46–60, 61–70, Trên 70
 */
export function getAgeGroup(age: number | null): AgeGroup | 'Chưa xác định' {
  if (age === null || age < 18) return 'Chưa xác định';
  if (age <= 30) return '18–30';
  if (age <= 45) return '31–45';
  if (age <= 60) return '46–60';
  if (age <= 70) return '61–70';
  return 'Trên 70';
}

/**
 * Định dạng ngày YYYY-MM-DD sang DD/MM/YYYY
 */
export function formatDateVN(dateStr?: string): string {
  if (!dateStr || dateStr.trim() === '') return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

/**
 * Định dạng ngày tạo tài khoản (createdAt) sang DD/MM/YYYY.
 * Ngày thiếu hoặc không hợp lệ hiển thị "Chưa cập nhật"; không tự lấy ngày hiện tại.
 */
export function formatUserDateVN(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
    return 'Chưa cập nhật';
  }
  const d = new Date(dateStr.trim());
  if (Number.isNaN(d.getTime())) {
    return 'Chưa cập nhật';
  }
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Định dạng ngày giờ đầy đủ
 */
export function formatDateTimeVN(dateTimeStr?: string | null): string {
  if (!dateTimeStr || typeof dateTimeStr !== 'string' || dateTimeStr.trim() === '') {
    return 'Chưa cập nhật';
  }
  try {
    const d = new Date(dateTimeStr.trim());
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  } catch {
    // fallback
  }
  return 'Chưa cập nhật';
}

export interface ServiceDurationResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  formattedText: string;     // VD: "2 năm 3 tháng 17 ngày" hoặc "4 tháng 12 ngày"
  shortText: string;         // VD: "2 năm 3 tháng" hoặc "17 ngày"
  fullDetailText: string;    // VD: "2 năm 3 tháng 17 ngày (Tổng 839 ngày)"
  startDateFormatted: string; // VD: "01/07/2024"
  endDateFormatted: string;   // VD: "18/10/2026"
  isDismissed: boolean;
  isValid: boolean;
}

/**
 * Tính toán chính xác thời gian tham gia lực lượng ANTT cơ sở (số ngày, tháng, năm)
 * Căn cứ từ ngày Quyết định của UBND xã (ngay_tham_gia_antt)
 * Đến:
 * - Ngày hiện tại (nếu đang hoạt động)
 * - Ngày thôi việc / QĐ thôi việc của UBND xã (nếu đã cho thôi tham gia)
 */
export function calculateServiceDuration(
  startDateStr?: string,
  endDateStr?: string,
  isDismissed: boolean = false
): ServiceDurationResult | null {
  if (!startDateStr || startDateStr.trim() === '') return null;

  // Chuẩn hóa định dạng nếu là DD/MM/YYYY
  let normalizedStartStr = startDateStr.trim();
  if (normalizedStartStr.includes('/')) {
    const parts = normalizedStartStr.split('/');
    if (parts.length === 3) {
      normalizedStartStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  const start = new Date(normalizedStartStr);
  if (isNaN(start.getTime())) return null;

  let end: Date;
  let normalizedEndStr = endDateStr?.trim();
  if (normalizedEndStr && normalizedEndStr !== '') {
    if (normalizedEndStr.includes('/')) {
      const parts = normalizedEndStr.split('/');
      if (parts.length === 3) {
        normalizedEndStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    const parsedEnd = new Date(normalizedEndStr);
    end = isNaN(parsedEnd.getTime()) ? new Date() : parsedEnd;
  } else {
    end = new Date();
  }

  // Set to local date midnight
  const dStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const dEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  if (dEnd.getTime() < dStart.getTime()) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      formattedText: '0 ngày (Ngày quyết định ở tương lai)',
      shortText: '0 ngày',
      fullDetailText: '0 ngày (Ngày quyết định ở tương lai)',
      startDateFormatted: formatDateVN(normalizedStartStr),
      endDateFormatted: formatDateVN(normalizedEndStr || new Date().toISOString().split('T')[0]),
      isDismissed,
      isValid: false,
    };
  }

  const diffTime = dEnd.getTime() - dStart.getTime();
  const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let years = dEnd.getFullYear() - dStart.getFullYear();
  let months = dEnd.getMonth() - dStart.getMonth();
  let days = dEnd.getDate() - dStart.getDate();

  if (days < 0) {
    months -= 1;
    // Số ngày của tháng trước ngày kết thúc
    const prevMonthDays = new Date(dEnd.getFullYear(), dEnd.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} năm`);
  if (months > 0) parts.push(`${months} tháng`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ngày`);

  const formattedText = parts.join(' ');

  const shortParts: string[] = [];
  if (years > 0) shortParts.push(`${years} năm`);
  if (months > 0) shortParts.push(`${months} tháng`);
  if (shortParts.length === 0) shortParts.push(`${days} ngày`);
  const shortText = shortParts.join(' ');

  const fullDetailText = `${formattedText} (Tổng ${totalDays.toLocaleString('vi-VN')} ngày)`;

  return {
    years,
    months,
    days,
    totalDays,
    formattedText,
    shortText,
    fullDetailText,
    startDateFormatted: formatDateVN(normalizedStartStr),
    endDateFormatted: formatDateVN(normalizedEndStr || new Date().toISOString().split('T')[0]),
    isDismissed,
    isValid: true,
  };
}

/**
 * Lấy kết quả tính thời gian tham gia của 1 thành viên ANTT
 */
export function getMemberServiceDuration(member: NhanSu): ServiceDurationResult | null {
  const isDismissed = member.trang_thai === 'da_thoi_viec';
  const endDate = isDismissed ? (member.ngay_thoi_viec || member.ngay_quyet_dinh_thoi_viec) : undefined;
  return calculateServiceDuration(member.ngay_tham_gia_antt, endDate, isDismissed);
}

/**
 * Tự động phát hiện các mục cần cập nhật trong hồ sơ:
 * - Thiếu CCCD
 * - Thiếu ngày sinh
 * - Thiếu số điện thoại
 * - Thiếu trình độ
 * - Chưa cập nhật VNeID
 * - Thiếu thông tin Đảng viên
 * - Thiếu ngày tham gia
 * - Thiếu thông tin ngân hàng
 */
export function scanProfileIssues(
  member: NhanSu,
  toNameMap: Record<string, string>
): MissingFieldsScanResult | null {
  const missingItems: MissingFieldsScanResult['missingItems'] = [];

  // 1. Thiếu CCCD
  if (!member.so_cccd || member.so_cccd.trim().length < 9) {
    missingItems.push({
      field: 'so_cccd',
      label: 'Chưa có hoặc sai định dạng số CCCD (12 số)',
      level: 'nghiem_trong',
    });
  }

  // 2. Thiếu ngày sinh
  if (!member.ngay_sinh || member.ngay_sinh.trim() === '') {
    missingItems.push({
      field: 'ngay_sinh',
      label: 'Thiếu ngày tháng năm sinh (chưa tính được độ tuổi)',
      level: 'nghiem_trong',
    });
  }

  // 3. Thiếu số điện thoại
  if (!member.so_dien_thoai || member.so_dien_thoai.trim().length < 10) {
    missingItems.push({
      field: 'so_dien_thoai',
      label: 'Chưa có số điện thoại liên lạc chính thức',
      level: 'canh_bao',
    });
  }

  // 4. Thiếu trình độ
  if (
    !member.trinh_do_hoc_van ||
    !member.trinh_do_chuyen_mon ||
    member.trinh_do_chuyen_mon === 'Chưa qua đào tạo'
  ) {
    missingItems.push({
      field: 'trinh_do',
      label: 'Cần cập nhật hoặc bổ sung hồ sơ trình độ chuyên môn',
      level: 'canh_bao',
    });
  }

  // 5. Chưa cập nhật VNeID mức 2
  if (!member.vneid_muc_2) {
    missingItems.push({
      field: 'vneid_muc_2',
      label: 'Chưa kích hoạt/xác thực định danh điện tử VNeID Mức 2',
      level: 'canh_bao',
    });
  }

  // 6. Thiếu thông tin Đảng viên
  if (member.dang_vien) {
    if (!member.ngay_vao_dang_du_bi || !member.ngay_chinh_thuc) {
      missingItems.push({
        field: 'dang_vien_info',
        label: 'Đảng viên nhưng còn thiếu ngày dự bị hoặc ngày chính thức',
        level: 'nghiem_trong',
      });
    }
  }

  // 7. Thiếu ngày tham gia ANTT
  if (!member.ngay_tham_gia_antt || member.ngay_tham_gia_antt.trim() === '') {
    missingItems.push({
      field: 'ngay_tham_gia_antt',
      label: 'Chưa cập nhật ngày tham gia lực lượng ANTT cơ sở',
      level: 'canh_bao',
    });
  }

  // 8. Thiếu thông tin ngân hàng
  if (member.co_tai_khoan) {
    if (!member.so_tai_khoan || !member.loai_ngan_hang) {
      missingItems.push({
        field: 'ngan_hang_info',
        label: 'Đã báo có tài khoản nhưng chưa nhập tên ngân hàng / số tài khoản nhận phụ cấp',
        level: 'nghiem_trong',
      });
    }
  } else {
    missingItems.push({
      field: 'co_tai_khoan',
      label: 'Chưa có tài khoản ngân hàng để chi trả phụ cấp hằng tháng',
      level: 'canh_bao',
    });
  }

  if (missingItems.length === 0) return null;

  return {
    id: member.id,
    ma_nhan_su: member.ma_nhan_su,
    ho_ten: member.ho_ten,
    chuc_vu: member.chuc_vu,
    to_antt_name: toNameMap[member.to_antt_id] || 'Chưa phân tổ',
    so_dien_thoai: member.so_dien_thoai,
    missingItems,
  };
}

/**
 * Lấy danh sách tên các trường còn thiếu của một hồ sơ
 */
export function findMissingFields(member: NhanSu): string[] {
  const issues: string[] = [];
  if (!member.so_cccd || member.so_cccd.trim().length < 9) {
    issues.push('Thiếu số CCCD');
  }
  if (!member.ngay_sinh || member.ngay_sinh.trim() === '') {
    issues.push('Thiếu ngày sinh');
  }
  if (!member.so_dien_thoai || member.so_dien_thoai.trim().length < 10) {
    issues.push('Thiếu số điện thoại');
  }
  if (!member.vneid_muc_2) {
    issues.push('Chưa kích hoạt VNeID Mức 2');
  }
  if (member.dang_vien && (!member.ngay_vao_dang_du_bi || !member.ngay_chinh_thuc)) {
    issues.push('Thiếu ngày vào Đảng (dự bị / chính thức)');
  }
  if (member.co_tai_khoan && (!member.so_tai_khoan || !member.loai_ngan_hang)) {
    issues.push('Thiếu số tài khoản hoặc ngân hàng');
  } else if (!member.co_tai_khoan) {
    issues.push('Chưa mở tài khoản ngân hàng nhận phụ cấp');
  }
  if (member.dan_toc === 'Khác' && !member.dan_toc_khac) {
    issues.push('Thiếu tên dân tộc');
  }
  if (member.biet_tieng_dan_toc && !member.tieng_dan_toc) {
    issues.push('Thiếu tên tiếng dân tộc');
  }
  return issues;
}
