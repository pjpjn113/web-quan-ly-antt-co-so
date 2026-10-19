export type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER';

export interface UserAccount {
  id: string;
  username: string;
  email?: string;
  passwordHash?: string; // DEPRECATED: Xác thực an toàn thực hiện qua Supabase Auth, không lưu mật khẩu trong bảng users
  fullName: string;
  role: UserRole;
  chucVu: string;
  donVi: string;
  soDienThoai?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export type AgeGroup = '18–30' | '31–45' | '46–60' | '61–70' | 'Trên 70';

export type Gender = 'Nam' | 'Nữ' | 'Khác';

export type PositionANTT = 'Tổ trưởng' | 'Tổ phó' | 'Tổ viên' | 'Thành viên';

export type ChucVuKiemNhiem = 
  | 'Không kiêm nhiệm'
  | 'Tổ trưởng dân phòng'
  | 'Tổ phó dân phòng'
  | 'Bí thư chi bộ ấp'
  | 'Phó Bí thư chi bộ ấp'
  | 'Phó Trưởng ấp'
  | 'Khác'
  | string;

export type EducationLevel = 
  | 'Tiểu học' 
  | 'THCS' 
  | 'THPT' 
  | '12/12' 
  | '11/12' 
  | '10/12' 
  | '9/12' 
  | '8/12' 
  | '7/12' 
  | 'Khác';

export type ProfessionalLevel = 
  | 'Chưa qua đào tạo' 
  | 'Sơ cấp' 
  | 'Trung cấp' 
  | 'Cao đẳng' 
  | 'Đại học' 
  | 'Sau đại học';

export type MemberStatus = 'dang_hoat_dong' | 'tam_nghi' | 'da_thoi_viec' | 'da_xoa';

export interface DiaBanAp {
  id: string;
  ma_ap: string;
  ten_ap: string;
  mo_ta?: string;
  ghi_chu?: string;
  trang_thai: 'hoat_dong' | 'tam_khoa';
  created_at: string;
  updated_at: string;
}

export interface ToANTT {
  id: string;
  ma_to: string;
  ten_to: string;
  ap_id: string; // liên kết tới ấp
  to_truong_id?: string;
  to_pho_id?: string;
  ngay_thanh_lap?: string;
  dia_ban_hoat_dong?: string;
  ghi_chu?: string;
  trang_thai: 'hoat_dong' | 'tam_dung';
  created_at: string;
  updated_at: string;
}

export interface NhanSu {
  id: string;
  ma_nhan_su: string;
  stt: number;
  ho_ten: string;
  ngay_sinh: string; // YYYY-MM-DD
  gioi_tinh: Gender;
  dan_toc: string; // "Kinh" | "Khmer" | "Hoa" | "Khác"
  dan_toc_khac?: string;
  biet_tieng_dan_toc: boolean;
  tieng_dan_toc?: string;
  que_quan: string;
  noi_o_hien_nay: string;
  ap_id: string; // Thuộc ấp nào
  dia_chi_chi_tiet: string;
  to_antt_id: string; // Thuộc tổ ANTT nào
  chuc_vu: PositionANTT;
  chuc_vu_kiem_nhiem?: string; // Tổ trưởng dân phòng | Tổ phó dân phòng | Bí thư chi bộ ấp | Phó Bí thư chi bộ ấp | Phó Trưởng ấp | Không kiêm nhiệm | Khác
  anh_chan_dung?: string; // Base64 Data URL ảnh chân dung 4x6
  trinh_do_hoc_van: EducationLevel;
  trinh_do_chuyen_mon: ProfessionalLevel;
  chuyen_nganh?: string;
  so_cccd: string;
  ngay_cap_cccd?: string;
  dang_vien: boolean;
  ngay_vao_dang_du_bi?: string;
  ngay_chinh_thuc?: string;
  ngay_tham_gia_antt: string;
  so_quyet_dinh?: string;
  co_tai_khoan: boolean;
  loai_ngan_hang?: string;
  so_tai_khoan?: string;
  vneid_muc_2: boolean;
  so_dien_thoai: string;
  ma_bhyt?: string;
  ghi_chu?: string;
  trang_thai: MemberStatus;
  
  // Thông tin Quyết định cho thôi tham gia lực lượng ANTT cơ sở của UBND cấp xã
  so_quyet_dinh_thoi_viec?: string; // Số quyết định nghỉ dạng ".../QĐ-UBND"
  ngay_quyet_dinh_thoi_viec?: string; // Ngày ký ban hành QĐ (YYYY-MM-DD)
  ngay_thoi_viec?: string; // Ngày chính thức thôi tham gia (YYYY-MM-DD)
  co_quan_ban_hanh_thoi_viec?: string; // Cơ quan ban hành (VD: UBND xã Lai Vung)
  nguoi_ky_thoi_viec?: string; // Chức vụ / Người ký (Chủ tịch / Phó Chủ tịch UBND xã)
  ly_do_thoi_viec?: string; // Lý do cho thôi tham gia theo quy định
  da_thu_hoi_the_trang_thiet_bi?: boolean; // Đã thu hồi thẻ, trang phục, CCHT
  ghi_chu_thoi_viec?: string; // Ghi chú thêm về quyết định

  created_at: string;
  updated_at: string;
  deleted_at?: string; // Soft delete timestamp
  is_demo?: boolean; // Đánh dấu dữ liệu mẫu
}

export interface DismissMemberData {
  so_quyet_dinh_thoi_viec: string;
  ngay_quyet_dinh_thoi_viec: string;
  ngay_thoi_viec: string;
  co_quan_ban_hanh_thoi_viec: string;
  nguoi_ky_thoi_viec?: string;
  ly_do_thoi_viec: string;
  da_thu_hoi_the_trang_thiet_bi?: boolean;
  ghi_chu_thoi_viec?: string;
}

export type AuditActionType = 
  | 'DANG_NHAP' 
  | 'DANG_XUAT' 
  | 'THEM_MOI' 
  | 'CAP_NHAT' 
  | 'CHINH_SUA'
  | 'XOA_MEM' 
  | 'KHOI_PHUC' 
  | 'XOA_VINH_VIEN' 
  | 'CHO_THOI_THAM_GIA'
  | 'KHOI_PHUC_THAM_GIA'
  | 'CAP_NHAT_QD_THOI_VIEC'
  | 'IMPORT_EXCEL' 
  | 'NHAP_EXCEL'
  | 'EXPORT_DATA' 
  | 'XUAT_EXCEL'
  | 'SAO_LUU' 
  | 'PHUC_HOI';

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  userName?: string;
  user_role: UserRole;
  userRole?: UserRole;
  thoi_gian: string;
  timestamp?: string;
  hanh_dong: AuditActionType;
  action?: AuditActionType;
  doi_tuong: string; // ví dụ: "Hồ sơ: Nguyễn Văn A (NS001)"
  target?: string;
  noi_dung_thay_doi: string;
  details?: string;
}

export interface ExcelImportResult {
  totalRows: number;
  validMembers: NhanSu[];
  errors: { row: number; ho_ten: string; reason: string }[];
}

export interface FilterParams {
  searchQuery?: string;
  ap_id?: string;
  to_antt_id?: string;
  chuc_vu?: string;
  chuc_vu_kiem_nhiem?: string;
  gioi_tinh?: string;
  age_group?: string;
  dan_toc?: string;
  trinh_do_hoc_van?: string;
  trinh_do_chuyen_mon?: string;
  dang_vien?: string; // 'all' | 'yes' | 'no'
  vneid_muc_2?: string; // 'all' | 'yes' | 'no'
  co_tai_khoan?: string; // 'all' | 'yes' | 'no'
  trang_thai?: string; // 'dang_hoat_dong' | 'all' | 'da_xoa'
}

export interface MissingFieldsScanResult {
  id: string;
  ma_nhan_su: string;
  ho_ten: string;
  chuc_vu: string;
  to_antt_name: string;
  so_dien_thoai: string;
  missingItems: {
    field: string;
    label: string;
    level: 'canh_bao' | 'nghiem_trong';
  }[];
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// --- NHẬT KÝ TUẦN TRA HÀNG NGÀY ---
export type CaTuanTra = 
  | 'Ca ngày (07h00 - 17h00)' 
  | 'Ca tối (17h00 - 22h00)' 
  | 'Ca đêm (22h00 - 05h00)' 
  | 'Đột xuất';

export interface NhatKyTuanTra {
  id: string;
  ngay_tuan_tra: string; // YYYY-MM-DD
  ca_tuan_tra: CaTuanTra;
  // Số cuộc tuần tra
  so_cuoc_cong_khai: number; // Tuần tra công khai
  so_cuoc_mat_phuc: number; // Tuần tra mật phục
  tong_so_cuoc: number;
  // Lực lượng tham gia
  so_luot_thanh_vien: number; // Số lượt thành viên ANTT cơ sở tham gia
  danh_sach_thanh_vien_ids: string[]; // Danh sách ID thành viên
  can_bo_cong_an_phu_trach: string; // Cán bộ Công an chính quy phụ trách ca trực
  // Địa bàn và lộ trình
  ap_ids: string[]; // Các ấp tuần tra
  tuyen_duong_dia_ban: string; // Tuyến lộ liên ấp, khu dân cư, chợ, bến đò...
  // Công tác phối hợp giải quyết tình hình ANTT cùng lực lượng Công an
  so_vu_viec_giai_quyet: number;
  noi_dung_phoi_hop: string; // Giải tán nhóm tụ tập, nhắc nhở trật tự, xử lý vi phạm, vây bắt, hoà giải...
  ket_qua_noi_bat?: string;
  ghi_chu?: string;
  nguoi_ghi_so: string;
  created_at: string;
  updated_at: string;
}

// --- QUẢN LÝ TẬP HUẤN NGHIỆP VỤ ---
export interface DotTapHuan {
  id: string;
  ten_dot: string; // Tên đợt tập huấn / bồi dưỡng
  chuyen_de: string; // Chuyên đề huấn luyện
  thoi_gian_bat_dau: string; // YYYY-MM-DD
  thoi_gian_ket_thuc: string; // YYYY-MM-DD
  dia_diem: string;
  don_vi_to_chuc: 'Công an tỉnh Đồng Tháp' | 'Công an xã Lai Vung' | 'UBND xã Lai Vung' | 'Liên ngành';
  so_lop: number; // Số lớp tổ chức
  so_thanh_vien_tham_gia: number; // Số thành viên tham gia
  danh_sach_thanh_vien_ids: string[]; // Danh sách ID thành viên tham gia
  noi_dung_tap_huan: string; // Nghiệp vụ PCCC, CNCH, võ thuật tự vệ, tuần tra giải quyết vụ việc, tuyên truyền pháp luật...
  ket_qua_danh_gia: {
    so_dat: number;
    so_gioi_xuat_sac: number;
    so_chua_dat: number;
    ty_le_hoan_thanh: number; // %
  };
  kinh_phi_ho_tro?: number;
  trang_thai: 'ke_hoach' | 'dang_dien_ra' | 'da_hoan_thanh';
  ghi_chu?: string;
  nguoi_nhap: string;
  created_at: string;
  updated_at: string;
}

// --- QUẢN LÝ KHEN THƯỞNG ---
export type LoaiKhenThuong = 'DinhKy' | 'DotXuat';
export type CapKhenThuong = 'UBND_TINH' | 'CONG_AN_TINH' | 'UBND_XA';

export interface HoSoKhenThuong {
  id: string;
  loai_khen_thuong: LoaiKhenThuong; // 'DinhKy' (Định kỳ) | 'DotXuat' (Đột xuất)
  cap_khen_thuong: CapKhenThuong; // Cấp UBND tỉnh | Cấp Công an tỉnh | Cấp UBND xã
  hinh_thuc: string; // Bằng khen của Chủ tịch UBND tỉnh, Giấy khen của Giám đốc Công an tỉnh, Giấy khen của Chủ tịch UBND xã
  doi_tuong?: 'CaNhan' | 'TapThe'; // Khen cá nhân hoặc tập thể tổ ANTT
  thanh_vien_id?: string; // Liên kết NhanSu
  nhan_su_id?: string; // Liên kết NhanSu
  ten_nguoi_khen_thuong?: string; // Tên thành viên hoặc tập thể
  to_antt_id?: string;
  so_luong_thanh_vien_khen_thuong?: number; // Số lượng thành viên được xét khen thưởng
  danh_sach_thanh_vien_ids?: string[]; // Danh sách ID thành viên
  so_quyet_dinh: string; // Số QĐ khen thưởng (VD: 145/QĐ-UBND, 28/QĐ-CAT)
  ngay_quyet_dinh: string; // YYYY-MM-DD
  co_quan_ban_hanh: string; // UBND tỉnh Đồng Tháp | Công an tỉnh Đồng Tháp | UBND xã Lai Vung
  nguoi_ky?: string;
  ly_do_khen_thuong: string; // Lý do / Thành tích cụ thể
  thanh_tich?: string; // Thành tích cụ thể
  tien_thuong?: number;
  nam_khen_thuong: number;
  ghi_chu?: string;
  nguoi_nhap: string;
  created_at: string;
  updated_at: string;
}
