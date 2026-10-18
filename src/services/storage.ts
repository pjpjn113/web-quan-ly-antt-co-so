import { 
  NhanSu, 
  DiaBanAp, 
  ToANTT, 
  UserAccount, 
  AuditLog, 
  UserRole,
  NhatKyTuanTra,
  DotTapHuan,
  HoSoKhenThuong,
  DismissMemberData
} from '../types';

const STORAGE_KEYS = {
  NHAN_SU: 'ca_laivung_antt_nhansu_v1',
  DIA_BAN: 'ca_laivung_antt_diaban_v1',
  TO_ANTT: 'ca_laivung_antt_toantt_v1',
  USERS: 'ca_laivung_antt_users_v1',
  CURRENT_USER: 'ca_laivung_antt_current_user_v1',
  AUDIT_LOGS: 'ca_laivung_antt_audit_logs_v1',
  TUAN_TRA: 'ca_laivung_antt_tuantra_v1',
  TAP_HUAN: 'ca_laivung_antt_taphuan_v1',
  KHEN_THUONG: 'ca_laivung_antt_khenthuong_v1',
};

// Mật khẩu băm sẵn cho 3 tài khoản mặc định (mật khẩu mặc định: '123456')
// Cùng thuật toán với hashPassword trong security.ts
const DEFAULT_PW_HASH = '123456_hashed_secure';

export const SYSTEM_MANAGER_INFO = {
  fullName: 'Trần Thanh Tuấn',
  rank: 'Trung tá',
  title: 'Phó Trưởng Công an xã',
  phone: '0913344189',
  agency: 'Công an xã Lai Vung',
  parentAgency: 'Công an tỉnh Đồng Tháp',
  province: 'Tỉnh Đồng Tháp',
  adminUsername: 'Admin',
  adminPassword: 'Tuan@123',
};

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user_admin_01',
    username: 'Admin',
    passwordHash: 'Tuan@123',
    fullName: 'Trung tá Trần Thanh Tuấn',
    role: 'ADMIN',
    chucVu: 'Phó Trưởng Công an xã',
    donVi: 'Công an xã Lai Vung',
    soDienThoai: '0913344189',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'user_manager_02',
    username: 'canbo_quanly',
    passwordHash: DEFAULT_PW_HASH,
    fullName: 'Đại úy Lê Hoàng Minh',
    role: 'MANAGER',
    chucVu: 'Cán bộ quản lý',
    donVi: 'Công an xã Lai Vung',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'user_viewer_03',
    username: 'canbo_xem',
    passwordHash: DEFAULT_PW_HASH,
    fullName: 'Thượng úy Nguyễn Văn Hậu',
    role: 'VIEWER',
    chucVu: 'Cán bộ trực ban',
    donVi: 'Công an xã Lai Vung',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

const INITIAL_DIA_BAN: DiaBanAp[] = [
  {
    id: 'ap_01',
    ma_ap: 'AP-AB',
    ten_ap: 'Ấp An Bình',
    mo_ta: 'Địa bàn ANTT Ấp An Bình, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_02',
    ma_ap: 'AP-AH',
    ten_ap: 'Ấp An Hòa',
    mo_ta: 'Địa bàn ANTT Ấp An Hòa, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_03',
    ma_ap: 'AP-AK',
    ten_ap: 'Ấp An Khương',
    mo_ta: 'Địa bàn ANTT Ấp An Khương, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_04',
    ma_ap: 'AP-AL',
    ten_ap: 'Ấp An Lạc',
    mo_ta: 'Địa bàn ANTT Ấp An Lạc, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_05',
    ma_ap: 'AP-ALA',
    ten_ap: 'Ấp An Lợi A',
    mo_ta: 'Địa bàn ANTT Ấp An Lợi A, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_06',
    ma_ap: 'AP-ALB',
    ten_ap: 'Ấp An Lợi B',
    mo_ta: 'Địa bàn ANTT Ấp An Lợi B, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_07',
    ma_ap: 'AP-AN',
    ten_ap: 'Ấp An Ninh',
    mo_ta: 'Địa bàn ANTT Ấp An Ninh, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_08',
    ma_ap: 'AP-AP',
    ten_ap: 'Ấp An Phong',
    mo_ta: 'Địa bàn ANTT Ấp An Phong, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_09',
    ma_ap: 'AP-TA',
    ten_ap: 'Ấp Tân An',
    mo_ta: 'Địa bàn ANTT Ấp Tân An, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_10',
    ma_ap: 'AP-TB',
    ten_ap: 'Ấp Tân Bình',
    mo_ta: 'Địa bàn ANTT Ấp Tân Bình, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_11',
    ma_ap: 'AP-TD',
    ten_ap: 'Ấp Tân Định',
    mo_ta: 'Địa bàn ANTT Ấp Tân Định, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_12',
    ma_ap: 'AP-TH',
    ten_ap: 'Ấp Tân Hưng',
    mo_ta: 'Địa bàn ANTT Ấp Tân Hưng, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_13',
    ma_ap: 'AP-TK',
    ten_ap: 'Ấp Tân Khánh',
    mo_ta: 'Địa bàn ANTT Ấp Tân Khánh, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_14',
    ma_ap: 'AP-TL',
    ten_ap: 'Ấp Tân Lộc',
    mo_ta: 'Địa bàn ANTT Ấp Tân Lộc, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_15',
    ma_ap: 'AP-TM',
    ten_ap: 'Ấp Tân Mỹ',
    mo_ta: 'Địa bàn ANTT Ấp Tân Mỹ, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_16',
    ma_ap: 'AP-TP',
    ten_ap: 'Ấp Tân Phú',
    mo_ta: 'Địa bàn ANTT Ấp Tân Phú, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_17',
    ma_ap: 'AP-TQ',
    ten_ap: 'Ấp Tân Quí',
    mo_ta: 'Địa bàn ANTT Ấp Tân Quí, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_18',
    ma_ap: 'AP-TTH',
    ten_ap: 'Ấp Tân Thạnh',
    mo_ta: 'Địa bàn ANTT Ấp Tân Thạnh, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap_19',
    ma_ap: 'AP-TTHUAN',
    ten_ap: 'Ấp Tân Thuận',
    mo_ta: 'Địa bàn ANTT Ấp Tân Thuận, xã Lai Vung',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
];

const INITIAL_TO_ANTT: ToANTT[] = [
  {
    id: 'to_01',
    ma_to: 'TO-AB-01',
    ten_to: 'Tổ ANTT Ấp An Bình',
    ap_id: 'ap_01',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp An Bình',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_02',
    ma_to: 'TO-AH-02',
    ten_to: 'Tổ ANTT Ấp An Hòa',
    ap_id: 'ap_02',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp An Hòa',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_03',
    ma_to: 'TO-AK-03',
    ten_to: 'Tổ ANTT Ấp An Khương',
    ap_id: 'ap_03',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp An Khương',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_04',
    ma_to: 'TO-AL-04',
    ten_to: 'Tổ ANTT Ấp An Lạc',
    ap_id: 'ap_04',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp An Lạc',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_05',
    ma_to: 'TO-ALA-05',
    ten_to: 'Tổ ANTT Ấp An Lợi A',
    ap_id: 'ap_05',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp An Lợi A',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_06',
    ma_to: 'TO-ALB-06',
    ten_to: 'Tổ ANTT Ấp An Lợi B',
    ap_id: 'ap_06',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp An Lợi B',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_07',
    ma_to: 'TO-AN-07',
    ten_to: 'Tổ ANTT Ấp An Ninh',
    ap_id: 'ap_07',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp An Ninh',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_08',
    ma_to: 'TO-AP-08',
    ten_to: 'Tổ ANTT Ấp An Phong',
    ap_id: 'ap_08',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp An Phong',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_09',
    ma_to: 'TO-TA-09',
    ten_to: 'Tổ ANTT Ấp Tân An',
    ap_id: 'ap_09',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân An',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_10',
    ma_to: 'TO-TB-10',
    ten_to: 'Tổ ANTT Ấp Tân Bình',
    ap_id: 'ap_10',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân Bình',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_11',
    ma_to: 'TO-TD-11',
    ten_to: 'Tổ ANTT Ấp Tân Định',
    ap_id: 'ap_11',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân Định',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_12',
    ma_to: 'TO-TH-12',
    ten_to: 'Tổ ANTT Ấp Tân Hưng',
    ap_id: 'ap_12',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân Hưng',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_13',
    ma_to: 'TO-TK-13',
    ten_to: 'Tổ ANTT Ấp Tân Khánh',
    ap_id: 'ap_13',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân Khánh',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_14',
    ma_to: 'TO-TL-14',
    ten_to: 'Tổ ANTT Ấp Tân Lộc',
    ap_id: 'ap_14',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân Lộc',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_15',
    ma_to: 'TO-TM-15',
    ten_to: 'Tổ ANTT Ấp Tân Mỹ',
    ap_id: 'ap_15',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân Mỹ',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_16',
    ma_to: 'TO-TP-16',
    ten_to: 'Tổ ANTT Ấp Tân Phú',
    ap_id: 'ap_16',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân Phú',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_17',
    ma_to: 'TO-TQ-17',
    ten_to: 'Tổ ANTT Ấp Tân Quí',
    ap_id: 'ap_17',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân Quí',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_18',
    ma_to: 'TO-TTH-18',
    ten_to: 'Tổ ANTT Ấp Tân Thạnh',
    ap_id: 'ap_18',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân Thạnh',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'to_19',
    ma_to: 'TO-TTHUAN-19',
    ten_to: 'Tổ ANTT Ấp Tân Thuận',
    ap_id: 'ap_19',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân Thuận',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
];

// Cơ sở dữ liệu mặc định ban đầu: Rỗng (Đã xóa toàn bộ dữ liệu hiện có theo chỉ đạo)
const INITIAL_NHAN_SU: NhanSu[] = [];

// Dữ liệu mẫu chuẩn lực lượng ANTT cơ sở xã Lai Vung (chỉ nạp khi cán bộ yêu cầu chạy demo)
export const DEMO_SAMPLE_MEMBERS: NhanSu[] = [
  {
    id: 'ns_001',
    ma_nhan_su: 'ANTT-LV-001',
    stt: 1,
    ho_ten: 'Nguyễn Văn Hùng',
    ngay_sinh: '1975-04-15',
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Xã Lai Vung, Tỉnh Đồng Tháp',
    noi_o_hien_nay: 'Tổ 2, Ấp An Bình, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_01',
    dia_chi_chi_tiet: 'Số 145 Đường Hùng Vương nối dài',
    to_antt_id: 'to_01',
    chuc_vu: 'Tổ trưởng',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Trung cấp',
    chuyen_nganh: 'Quân sự cơ sở',
    so_cccd: '087075001234',
    ngay_cap_cccd: '2021-08-10',
    dang_vien: true,
    ngay_vao_dang_du_bi: '2005-02-03',
    ngay_chinh_thuc: '2006-02-03',
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND ngày 28/06/2024',
    co_tai_khoan: true,
    loai_ngan_hang: 'Agribank - Chi nhánh Lai Vung',
    so_tai_khoan: '6508205128392',
    vneid_muc_2: true,
    so_dien_thoai: '0918234567',
    ghi_chu: 'Cựu chiến binh, uy tín cao trong cộng đồng',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_002',
    ma_nhan_su: 'ANTT-LV-002',
    stt: 2,
    ho_ten: 'Trần Thanh Phong',
    ngay_sinh: '1982-11-20',
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Xã Lai Vung, Tỉnh Đồng Tháp',
    noi_o_hien_nay: 'Tổ 5, Ấp An Bình, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_01',
    dia_chi_chi_tiet: 'Gần cầu Ba Răng, Ấp An Bình',
    to_antt_id: 'to_01',
    chuc_vu: 'Tổ phó',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Sơ cấp',
    chuyen_nganh: 'Bảo vệ dân phố',
    so_cccd: '087082004567',
    ngay_cap_cccd: '2022-03-15',
    dang_vien: true,
    ngay_vao_dang_du_bi: '2015-09-02',
    ngay_chinh_thuc: '2016-09-02',
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND ngày 28/06/2024',
    co_tai_khoan: true,
    loai_ngan_hang: 'VietinBank - PGD Lai Vung',
    so_tai_khoan: '108820492812',
    vneid_muc_2: true,
    so_dien_thoai: '0979456789',
    ghi_chu: 'Nhiệt tình, có nghiệp vụ PCCC tốt',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_003',
    ma_nhan_su: 'ANTT-LV-003',
    stt: 3,
    ho_ten: 'Lê Thị Thu Thảo',
    ngay_sinh: '1995-08-12',
    gioi_tinh: 'Nữ',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Xã Lai Vung, Tỉnh Đồng Tháp',
    noi_o_hien_nay: 'Tổ 1, Ấp An Bình, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_01',
    dia_chi_chi_tiet: 'Hẻm 12 Đường Nông Thôn Mới',
    to_antt_id: 'to_01',
    chuc_vu: 'Thành viên',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Cao đẳng',
    chuyen_nganh: 'Luật học',
    so_cccd: '087195006789',
    ngay_cap_cccd: '2023-01-10',
    dang_vien: false,
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'Vietcombank',
    so_tai_khoan: '0071001293849',
    vneid_muc_2: true,
    so_dien_thoai: '0903124578',
    ghi_chu: 'Hỗ trợ công tác tuyên truyền pháp luật và xử lý hồ sơ',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_004',
    ma_nhan_su: 'ANTT-LV-004',
    stt: 4,
    ho_ten: 'Phạm Minh Trí',
    ngay_sinh: '2001-05-24',
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Bình, Xã Lai Vung, Tỉnh Đồng Tháp',
    ap_id: 'ap_01',
    dia_chi_chi_tiet: 'Cụm 3, gần Chợ Đình',
    to_antt_id: 'to_01',
    chuc_vu: 'Thành viên',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Chưa qua đào tạo',
    so_cccd: '087201009812',
    ngay_cap_cccd: '2021-12-05',
    dang_vien: false,
    ngay_tham_gia_antt: '2024-08-15',
    so_quyet_dinh: '158/QĐ-UBND',
    co_tai_khoan: false,
    vneid_muc_2: true,
    so_dien_thoai: '0389123456',
    ghi_chu: 'Đoàn viên thanh niên xung kích, tích cực tuần tra đêm',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-08-15T08:00:00.000Z',
    updated_at: '2024-08-15T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_005',
    ma_nhan_su: 'ANTT-LV-005',
    stt: 5,
    ho_ten: 'Võ Quốc Tuấn',
    ngay_sinh: '1968-02-18',
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Hòa, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_02',
    dia_chi_chi_tiet: 'QL54 Km 12+300',
    to_antt_id: 'to_02',
    chuc_vu: 'Tổ trưởng',
    trinh_do_hoc_van: 'THCS',
    trinh_do_chuyen_mon: 'Sơ cấp',
    chuyen_nganh: 'Công an xã bán chuyên trách',
    so_cccd: '087068003321',
    ngay_cap_cccd: '2022-04-12',
    dang_vien: true,
    ngay_vao_dang_du_bi: '1998-05-19',
    ngay_chinh_thuc: '1999-05-19',
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'Agribank',
    so_tai_khoan: '6508201994821',
    vneid_muc_2: true,
    so_dien_thoai: '0913987654',
    ghi_chu: 'Nhiều năm làm Công an viên bán chuyên trách',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_006',
    ma_nhan_su: 'ANTT-LV-006',
    stt: 6,
    ho_ten: 'Chau Phước Hậu',
    ngay_sinh: '1989-10-05',
    gioi_tinh: 'Nam',
    dan_toc: 'Khmer',
    biet_tieng_dan_toc: true,
    tieng_dan_toc: 'Tiếng Khmer Nam Bộ',
    que_quan: 'Tri Tôn, An Giang',
    noi_o_hien_nay: 'Ấp An Hòa, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_02',
    dia_chi_chi_tiet: 'Khu vực Chùa Khmer liên ấp',
    to_antt_id: 'to_02',
    chuc_vu: 'Tổ phó',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Trung cấp',
    chuyen_nganh: 'Hành chính văn phòng',
    so_cccd: '087089008912',
    ngay_cap_cccd: '2021-09-20',
    dang_vien: false,
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'BIDV',
    so_tai_khoan: '7411000284719',
    vneid_muc_2: true,
    so_dien_thoai: '0988776655',
    ghi_chu: 'Biết tiếng Khmer, thuận lợi trong công tác nắm tình hình đồng bào',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_007',
    ma_nhan_su: 'ANTT-LV-007',
    stt: 7,
    ho_ten: 'Đặng Kim Chi',
    ngay_sinh: '1992-03-30',
    gioi_tinh: 'Nữ',
    dan_toc: 'Hoa',
    biet_tieng_dan_toc: true,
    tieng_dan_toc: 'Tiếng Quảng Đông',
    que_quan: 'Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Hòa, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_02',
    dia_chi_chi_tiet: 'Đường Liên Thôn 4',
    to_antt_id: 'to_02',
    chuc_vu: 'Thành viên',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Đại học',
    chuyen_nganh: 'Sư phạm Ngoại ngữ',
    so_cccd: '087192005432',
    ngay_cap_cccd: '2022-11-04',
    dang_vien: true,
    ngay_vao_dang_du_bi: '2018-04-30',
    ngay_chinh_thuc: '2019-04-30',
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'MB Bank',
    so_tai_khoan: '091283921882',
    vneid_muc_2: true,
    so_dien_thoai: '0939112233',
    ghi_chu: 'Hỗ trợ phiên dịch và hòa giải cơ sở',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_008',
    ma_nhan_su: 'ANTT-LV-008',
    stt: 8,
    ho_ten: 'Nguyễn Văn Đạt',
    ngay_sinh: '1952-12-01', // Trên 70 tuổi
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Xã Lai Vung, Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Khương, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_03',
    dia_chi_chi_tiet: 'Bến đò An Khương',
    to_antt_id: 'to_03',
    chuc_vu: 'Thành viên',
    trinh_do_hoc_van: 'THCS',
    trinh_do_chuyen_mon: 'Chưa qua đào tạo',
    so_cccd: '087052001199',
    ngay_cap_cccd: '2021-06-18',
    dang_vien: true,
    ngay_vao_dang_du_bi: '1980-02-03',
    ngay_chinh_thuc: '1981-02-03',
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: false,
    vneid_muc_2: false, // Hồ sơ cần cập nhật VNeID
    so_dien_thoai: '0277384912',
    ghi_chu: 'Người có uy tín trong ấp, lớn tuổi cần hỗ trợ VNeID và ngân hàng',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_009',
    ma_nhan_su: 'ANTT-LV-009',
    stt: 9,
    ho_ten: 'Dương Văn Thành',
    ngay_sinh: '1979-06-14',
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Khương, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_03',
    dia_chi_chi_tiet: 'Tổ 4, Ấp An Khương',
    to_antt_id: 'to_03',
    chuc_vu: 'Tổ trưởng',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Trung cấp',
    chuyen_nganh: 'Kỹ thuật nông nghiệp',
    so_cccd: '087079004411',
    ngay_cap_cccd: '2022-08-11',
    dang_vien: true,
    ngay_vao_dang_du_bi: '2012-07-27',
    ngay_chinh_thuc: '2013-07-27',
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'Agribank',
    so_tai_khoan: '6508207183921',
    vneid_muc_2: true,
    so_dien_thoai: '0919283746',
    ghi_chu: 'Quản lý tốt an ninh trật tự khu vực ven sông',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_010',
    ma_nhan_su: 'ANTT-LV-010',
    stt: 10,
    ho_ten: 'Huỳnh Văn Sang',
    ngay_sinh: '1985-09-09',
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Khương, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_03',
    dia_chi_chi_tiet: 'Cầu Rạch Ngựa',
    to_antt_id: 'to_03',
    chuc_vu: 'Tổ phó',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Sơ cấp',
    so_cccd: '087085006622',
    ngay_cap_cccd: '2021-10-15',
    dang_vien: false,
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'Sacombank',
    so_tai_khoan: '070182736412',
    vneid_muc_2: true,
    so_dien_thoai: '0948572910',
    ghi_chu: 'Lực lượng nòng cốt phong trào toàn dân bảo vệ an ninh Tổ quốc',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_011',
    ma_nhan_su: 'ANTT-LV-011',
    stt: 11,
    ho_ten: 'Bùi Thị Mỹ Duyên',
    ngay_sinh: '1998-11-15',
    gioi_tinh: 'Nữ',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Xã Lai Vung, Tỉnh Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Lạc, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_04',
    dia_chi_chi_tiet: 'Gần Trường THCS Lai Vung',
    to_antt_id: 'to_04',
    chuc_vu: 'Thành viên',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Đại học',
    chuyen_nganh: 'Công nghệ thông tin',
    so_cccd: '087198007788',
    ngay_cap_cccd: '2023-04-05',
    dang_vien: false,
    ngay_tham_gia_antt: '2024-09-01',
    so_quyet_dinh: '189/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'Techcombank',
    so_tai_khoan: '19038291048291',
    vneid_muc_2: true,
    so_dien_thoai: '0967891234',
    ghi_chu: 'Hỗ trợ quản trị dữ liệu dân cư và chuyển đổi số tại ấp',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-09-01T08:00:00.000Z',
    updated_at: '2024-09-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_012',
    ma_nhan_su: 'ANTT-LV-012',
    stt: 12,
    ho_ten: 'Lê Văn Bảy',
    ngay_sinh: '1963-07-22',
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Lạc, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_04',
    dia_chi_chi_tiet: 'Kênh ranh An Lạc - Tân Thành',
    to_antt_id: 'to_04',
    chuc_vu: 'Thành viên',
    trinh_do_hoc_van: 'THCS',
    trinh_do_chuyen_mon: 'Chưa qua đào tạo',
    so_cccd: '087063009988',
    ngay_cap_cccd: '2021-07-20',
    dang_vien: true,
    ngay_vao_dang_du_bi: '1992-09-02',
    ngay_chinh_thuc: '1993-09-02',
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'Agribank',
    so_tai_khoan: '6508204918231',
    vneid_muc_2: true,
    so_dien_thoai: '0912384756',
    ghi_chu: 'Nắm chắc địa bàn giáp ranh',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_013',
    ma_nhan_su: 'ANTT-LV-013',
    stt: 13,
    ho_ten: 'Ngô Văn Nghĩa',
    ngay_sinh: '1973-01-19',
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Lạc, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_04',
    dia_chi_chi_tiet: 'Ấp An Lạc',
    to_antt_id: 'to_04',
    chuc_vu: 'Tổ trưởng',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Trung cấp',
    chuyen_nganh: 'Quân sự',
    so_cccd: '087073004821',
    ngay_cap_cccd: '2022-05-19',
    dang_vien: true,
    ngay_vao_dang_du_bi: '2008-05-19',
    ngay_chinh_thuc: '2009-05-19',
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'Agribank',
    so_tai_khoan: '6508203928173',
    vneid_muc_2: true,
    so_dien_thoai: '0918765432',
    ghi_chu: 'Chỉ huy tuần tra địa bàn ấp An Lạc',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_014',
    ma_nhan_su: 'ANTT-LV-014',
    stt: 14,
    ho_ten: 'Đoàn Thanh Nhã',
    ngay_sinh: '1987-04-02',
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Lạc, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_04',
    dia_chi_chi_tiet: 'Tổ 3, An Lạc',
    to_antt_id: 'to_04',
    chuc_vu: 'Tổ phó',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Sơ cấp',
    so_cccd: '087087002938',
    ngay_cap_cccd: '2021-11-20',
    dang_vien: false,
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'VietinBank',
    so_tai_khoan: '107829103948',
    vneid_muc_2: true,
    so_dien_thoai: '0978123890',
    ghi_chu: 'Thường trực tại chốt an ninh',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-07-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_015',
    ma_nhan_su: 'ANTT-LV-015',
    stt: 15,
    ho_ten: 'Nguyễn Hoàng Khang',
    ngay_sinh: '2004-09-10', // 18-30 tuổi
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Bình, Xã Lai Vung',
    ap_id: 'ap_01',
    dia_chi_chi_tiet: 'Tổ 6, Ấp An Bình',
    to_antt_id: 'to_01',
    chuc_vu: 'Thành viên',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Chưa qua đào tạo',
    so_cccd: '', // Cố ý để trống để tạo hồ sơ cần cập nhật mẫu
    dang_vien: false,
    ngay_tham_gia_antt: '2024-09-01',
    co_tai_khoan: false,
    vneid_muc_2: false,
    so_dien_thoai: '0372819203',
    ghi_chu: 'Mới kết nạp, đang làm thủ tục làm lại CCCD và mở tài khoản',
    trang_thai: 'dang_hoat_dong',
    created_at: '2024-09-01T08:00:00.000Z',
    updated_at: '2024-09-01T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_demo_dismissed_01',
    ma_nhan_su: 'ANTT-LV-088',
    stt: 19,
    ho_ten: 'Đặng Văn Phước',
    ngay_sinh: '1961-03-12',
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Ấp An Bình, Xã Lai Vung, Đồng Tháp',
    ap_id: 'ap_01',
    dia_chi_chi_tiet: 'Tổ 3, Ấp An Bình',
    to_antt_id: 'to_01',
    chuc_vu: 'Thành viên',
    chuc_vu_kiem_nhiem: 'Không kiêm nhiệm',
    trinh_do_hoc_van: 'THCS',
    trinh_do_chuyen_mon: 'Chưa qua đào tạo',
    so_cccd: '087061005544',
    ngay_cap_cccd: '2021-06-15',
    dang_vien: false,
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'Agribank',
    so_tai_khoan: '6508205192831',
    vneid_muc_2: true,
    so_dien_thoai: '0918765432',
    ghi_chu: 'Đã hoàn thành tốt nhiệm vụ trong thời gian công tác, tự nguyện xin nghỉ do sức khỏe.',
    trang_thai: 'da_thoi_viec',
    so_quyet_dinh_thoi_viec: '28/QĐ-UBND',
    ngay_quyet_dinh_thoi_viec: '2024-08-20',
    ngay_thoi_viec: '2024-08-25',
    co_quan_ban_hanh_thoi_viec: 'Ủy ban nhân dân xã Lai Vung',
    nguoi_ky_thoi_viec: 'Chủ tịch UBND xã',
    ly_do_thoi_viec: 'Có đơn xin thôi tham gia lực lượng theo nguyện vọng cá nhân (lý do sức khỏe và quá tuổi)',
    da_thu_hoi_the_trang_thiet_bi: true,
    ghi_chu_thoi_viec: 'Đã bàn giao đầy đủ Thẻ ANTT và trang phục cho Công an xã',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-08-25T08:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'ns_demo_dismissed_02',
    ma_nhan_su: 'ANTT-LV-089',
    stt: 20,
    ho_ten: 'Trần Văn Cường',
    ngay_sinh: '1990-09-15',
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    biet_tieng_dan_toc: false,
    que_quan: 'Lai Vung, Đồng Tháp',
    noi_o_hien_nay: 'Thành phố Cần Thơ (trước đây ở Ấp An Hòa, Lai Vung)',
    ap_id: 'ap_02',
    dia_chi_chi_tiet: 'Ấp An Hòa',
    to_antt_id: 'to_02',
    chuc_vu: 'Tổ phó',
    chuc_vu_kiem_nhiem: 'Tổ phó dân phòng',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Trung cấp',
    chuyen_nganh: 'Công nghệ thông tin',
    so_cccd: '087090008899',
    ngay_cap_cccd: '2022-10-10',
    dang_vien: true,
    ngay_vao_dang_du_bi: '2018-03-26',
    ngay_chinh_thuc: '2019-03-26',
    ngay_tham_gia_antt: '2024-07-01',
    so_quyet_dinh: '124/QĐ-UBND',
    co_tai_khoan: true,
    loai_ngan_hang: 'Vietcombank',
    so_tai_khoan: '0071009876543',
    vneid_muc_2: true,
    so_dien_thoai: '0939112233',
    ghi_chu: 'Chuyển công tác và nơi cư trú lên Cần Thơ theo gia đình.',
    trang_thai: 'da_thoi_viec',
    so_quyet_dinh_thoi_viec: '45/QĐ-UBND',
    ngay_quyet_dinh_thoi_viec: '2024-10-05',
    ngay_thoi_viec: '2024-10-10',
    co_quan_ban_hanh_thoi_viec: 'Ủy ban nhân dân xã Lai Vung',
    nguoi_ky_thoi_viec: 'Chủ tịch UBND xã',
    ly_do_thoi_viec: 'Chuyển nơi cư trú ra ngoài địa bàn xã Lai Vung',
    da_thu_hoi_the_trang_thiet_bi: true,
    ghi_chu_thoi_viec: 'Đã hoàn tất thủ tục bàn giao nhiệm vụ Tổ phó cho đồng chí mới',
    created_at: '2024-07-01T08:00:00.000Z',
    updated_at: '2024-10-10T08:00:00.000Z',
    is_demo: true,
  },
];

const INITIAL_TUAN_TRA: NhatKyTuanTra[] = [
  {
    id: 'tt_001',
    ngay_tuan_tra: '2026-09-17',
    ca_tuan_tra: 'Ca đêm (22h00 - 05h00)',
    so_cuoc_cong_khai: 2,
    so_cuoc_mat_phuc: 1,
    tong_so_cuoc: 3,
    so_luot_thanh_vien: 6,
    danh_sach_thanh_vien_ids: ['ns_001', 'ns_002', 'ns_004', 'ns_005'],
    can_bo_cong_an_phu_trach: 'Trung tá Trần Thanh Tuấn - Phó Trưởng Công an xã',
    ap_ids: ['ap_01', 'ap_02'],
    tuyen_duong_dia_ban: 'Tuyến ĐT 851, đường liên ấp An Bình - An Hòa, khu vực cầu Ba Răng và chợ trung tâm xã',
    so_vu_viec_giai_quyet: 2,
    noi_dung_phoi_hop: 'Phối hợp Công an xã giải tán 01 nhóm thanh thiếu niên tụ tập đêm khuya gây mất trật tự trên tuyến ĐT 851; nhắc nhở 03 hộ dân mặt tiền để xe máy sơ hở; tuần tra khép kín địa bàn.',
    ket_qua_noi_bat: 'Không để xảy ra trộm cắp tài sản và tệ nạn xã hội trong ca trực; đảm bảo an ninh trật tự tuyệt đối.',
    ghi_chu: 'Tổ tuần tra quân số đầy đủ, đúng lễ tiết tác phong CAND.',
    nguoi_ghi_so: 'Trung tá Trần Thanh Tuấn',
    created_at: '2026-09-17T06:00:00.000Z',
    updated_at: '2026-09-17T06:00:00.000Z',
  },
  {
    id: 'tt_002',
    ngay_tuan_tra: '2026-09-16',
    ca_tuan_tra: 'Ca tối (17h00 - 22h00)',
    so_cuoc_cong_khai: 1,
    so_cuoc_mat_phuc: 2,
    tong_so_cuoc: 3,
    so_luot_thanh_vien: 5,
    danh_sach_thanh_vien_ids: ['ns_007', 'ns_008', 'ns_010'],
    can_bo_cong_an_phu_trach: 'Đại úy Lê Hoàng Minh',
    ap_ids: ['ap_03', 'ap_04'],
    tuyen_duong_dia_ban: 'Tuyến Quốc lộ 54 đoạn qua xã Lai Vung, khu vực bến đò An Khương - An Lạc',
    so_vu_viec_giai_quyet: 1,
    noi_dung_phoi_hop: 'Phối hợp mật phục phát hiện, giải tán 01 điểm đánh bạc ăn tiền nhỏ tự phát tại bãi đất trống ấp An Khương; tạm giữ tang vật bàn giao Công an xã lập biên bản xử lý theo thẩm quyền.',
    ket_qua_noi_bat: 'Kịp thời ngăn chặn tụ điểm cờ bạc manh nha, nhân dân trong ấp hoan nghênh.',
    ghi_chu: 'Lực lượng ANTT cơ sở phát huy tốt vai trò nắm tình hình địa bàn.',
    nguoi_ghi_so: 'Đại úy Lê Hoàng Minh',
    created_at: '2026-09-16T22:30:00.000Z',
    updated_at: '2026-09-16T22:30:00.000Z',
  },
  {
    id: 'tt_003',
    ngay_tuan_tra: '2026-09-15',
    ca_tuan_tra: 'Ca ngày (07h00 - 17h00)',
    so_cuoc_cong_khai: 2,
    so_cuoc_mat_phuc: 0,
    tong_so_cuoc: 2,
    so_luot_thanh_vien: 4,
    danh_sach_thanh_vien_ids: ['ns_001', 'ns_003'],
    can_bo_cong_an_phu_trach: 'Thượng úy Nguyễn Văn Hậu',
    ap_ids: ['ap_01', 'ap_05'],
    tuyen_duong_dia_ban: 'Cổng trường THCS Lai Vung, khu vực chợ xã và tuyến đê bao vườn quýt hồng',
    so_vu_viec_giai_quyet: 2,
    noi_dung_phoi_hop: 'Phối hợp bảo đảm trật tự an toàn giao thông tại cổng trường học trong giờ tan tầm; tuyên truyền, hòa giải mâu thuẫn tranh chấp ranh đất sinh hoạt giữa 2 hộ dân ấp An Lợi A, giữ vững tình làng nghĩa xóm.',
    ket_qua_noi_bat: 'Không ùn tắc giao thông, hòa giải thành mâu thuẫn tranh chấp ngay tại cơ sở.',
    ghi_chu: 'Ca trực hoàn thành xuất sắc nhiệm vụ.',
    nguoi_ghi_so: 'Thượng úy Nguyễn Văn Hậu',
    created_at: '2026-09-15T17:30:00.000Z',
    updated_at: '2026-09-15T17:30:00.000Z',
  },
];

const INITIAL_TAP_HUAN: DotTapHuan[] = [
  {
    id: 'th_001',
    ten_dot: 'Tập huấn bồi dưỡng pháp luật và nghiệp vụ lực lượng ANTT cơ sở năm 2026',
    chuyen_de: 'Triển khai thi hành Luật Lực lượng tham gia bảo vệ ANTT ở cơ sở (Luật số 30/2023/QH15); Kỹ năng nắm tình hình và xử lý tin báo ban đầu',
    thoi_gian_bat_dau: '2026-07-15',
    thoi_gian_ket_thuc: '2026-07-20',
    dia_diem: 'Hội trường Trung tâm Văn hóa - Học tập cộng đồng xã Lai Vung',
    don_vi_to_chuc: 'Công an tỉnh Đồng Tháp',
    so_lop: 2,
    so_thanh_vien_tham_gia: 35,
    danh_sach_thanh_vien_ids: ['ns_001', 'ns_002', 'ns_003', 'ns_004', 'ns_005', 'ns_007', 'ns_008', 'ns_010'],
    noi_dung_tap_huan: 'Phổ biến Luật số 30/2023/QH15, các văn bản quy phạm pháp luật liên quan; nhiệm vụ, quyền hạn, nguyên tắc hoạt động của lực lượng ANTT cơ sở; phương pháp phối hợp với Công an chính quy trong tuần tra, kiểm soát và xử lý tình huống phát sinh.',
    ket_qua_danh_gia: {
      so_dat: 35,
      so_gioi_xuat_sac: 12,
      so_chua_dat: 0,
      ty_le_hoan_thanh: 100,
    },
    kinh_phi_ho_tro: 5250000,
    trang_thai: 'da_hoan_thanh',
    ghi_chu: '100% học viên tham gia đầy đủ, đạt kiểm tra cuối khóa và được cấp Giấy chứng nhận hoàn thành lớp bồi dưỡng.',
    nguoi_nhap: 'Trung tá Trần Thanh Tuấn',
    created_at: '2026-07-21T08:00:00.000Z',
    updated_at: '2026-07-21T08:00:00.000Z',
  },
  {
    id: 'th_002',
    ten_dot: 'Huấn luyện kỹ năng Phòng cháy, chữa cháy và Cứu nạn, cứu hộ (PCCC & CNCH)',
    chuyen_de: 'Thực hành dập lửa ban đầu bằng bình bột, bình khí CO2; Kỹ năng thoát hiểm, cứu nạn trong đám cháy và sơ cứu y tế',
    thoi_gian_bat_dau: '2026-08-22',
    thoi_gian_ket_thuc: '2026-08-24',
    dia_diem: 'Sân vận động và khuôn viên UBND xã Lai Vung',
    don_vi_to_chuc: 'Công an xã Lai Vung',
    so_lop: 1,
    so_thanh_vien_tham_gia: 28,
    danh_sach_thanh_vien_ids: ['ns_001', 'ns_002', 'ns_004', 'ns_007'],
    noi_dung_tap_huan: 'Quy trình xử lý khi phát hiện cháy nổ tại khu dân cư và chợ; thao tác rải vòi, sử dụng bình chữa cháy xách tay dập tắt khay xăng cháy; kỹ năng di chuyển nạn nhân bị ngạt khói và sơ cấp cứu ban đầu.',
    ket_qua_danh_gia: {
      so_dat: 28,
      so_gioi_xuat_sac: 9,
      so_chua_dat: 0,
      ty_le_hoan_thanh: 100,
    },
    kinh_phi_ho_tro: 2800000,
    trang_thai: 'da_hoan_thanh',
    ghi_chu: 'Các thành viên thực hành thuần thục, sẵn sàng làm nòng cốt PCCC tại các ấp.',
    nguoi_nhap: 'Đại úy Lê Hoàng Minh',
    created_at: '2026-08-25T08:00:00.000Z',
    updated_at: '2026-08-25T08:00:00.000Z',
  },
  {
    id: 'th_003',
    ten_dot: 'Bồi dưỡng võ thuật tự vệ, sử dụng công cụ hỗ trợ và giải tán đám đông',
    chuyen_de: 'Kỹ thuật tay không tự vệ khống chế đối tượng, sử dụng gậy cao su, dây trói nghiệp vụ và phương án bảo vệ mục tiêu',
    thoi_gian_bat_dau: '2026-10-05',
    thoi_gian_ket_thuc: '2026-10-08',
    dia_diem: 'Nhà thi đấu đa năng xã Lai Vung',
    don_vi_to_chuc: 'Công an tỉnh Đồng Tháp',
    so_lop: 1,
    so_thanh_vien_tham_gia: 30,
    danh_sach_thanh_vien_ids: [],
    noi_dung_tap_huan: 'Huấn luyện thế võ CAND tự vệ, kỹ năng tự vệ khi bị tấn công bằng hung khí, kỹ thuật khóa tay khống chế; quy tắc bảo quản và sử dụng đúng quy định pháp luật các loại công cụ hỗ trợ được trang bị.',
    ket_qua_danh_gia: {
      so_dat: 0,
      so_gioi_xuat_sac: 0,
      so_chua_dat: 0,
      ty_le_hoan_thanh: 0,
    },
    trang_thai: 'ke_hoach',
    ghi_chu: 'Đang lập danh sách rà soát thể lực các thành viên trẻ tuổi cử đi tập huấn.',
    nguoi_nhap: 'Trung tá Trần Thanh Tuấn',
    created_at: '2026-09-10T09:00:00.000Z',
    updated_at: '2026-09-10T09:00:00.000Z',
  },
];

const INITIAL_KHEN_THUONG: HoSoKhenThuong[] = [
  {
    id: 'kt_001',
    loai_khen_thuong: 'DotXuat',
    cap_khen_thuong: 'UBND_TINH',
    hinh_thuc: 'Bằng khen của Chủ tịch UBND tỉnh Đồng Tháp',
    thanh_vien_id: 'ns_001',
    ten_nguoi_khen_thuong: 'Nguyễn Văn An (Tổ trưởng Tổ ANTT Ấp An Bình)',
    to_antt_id: 'to_01',
    so_quyet_dinh: '312/QĐ-UBND-KT',
    ngay_quyet_dinh: '2026-08-12',
    co_quan_ban_hanh: 'Ủy ban nhân dân tỉnh Đồng Tháp',
    nguoi_ky: 'Chủ tịch UBND tỉnh',
    ly_do_khen_thuong: 'Đã có thành tích đột xuất xuất sắc, dũng cảm mưu trí vây bắt đối tượng trộm cắp tài sản có mang theo hung khí tại khu vực giáp ranh, thu hồi tài sản trị giá hơn 60 triệu đồng trả lại cho nhân dân.',
    tien_thuong: 3500000,
    nam_khen_thuong: 2026,
    ghi_chu: 'Đã trao thưởng trang trọng tại Hội nghị sơ kết phong trào TDBVANTQ.',
    nguoi_nhap: 'Trung tá Trần Thanh Tuấn',
    created_at: '2026-08-13T09:00:00.000Z',
    updated_at: '2026-08-13T09:00:00.000Z',
  },
  {
    id: 'kt_002',
    loai_khen_thuong: 'DinhKy',
    cap_khen_thuong: 'CONG_AN_TINH',
    hinh_thuc: 'Giấy khen của Giám đốc Công an tỉnh Đồng Tháp',
    thanh_vien_id: 'ns_004',
    ten_nguoi_khen_thuong: 'Trần Hữu Bình (Tổ phó Tổ ANTT Ấp An Hòa)',
    to_antt_id: 'to_02',
    so_quyet_dinh: '88/QĐ-CAT-PX03',
    ngay_quyet_dinh: '2026-08-19',
    co_quan_ban_hanh: 'Công an tỉnh Đồng Tháp',
    nguoi_ky: 'Giám đốc Công an tỉnh',
    ly_do_khen_thuong: 'Đã có thành tích xuất sắc trong đợt cao điểm thi đua chào mừng 81 năm Ngày truyền thống CAND Việt Nam và Ngày hội Toàn dân bảo vệ an ninh Tổ quốc năm 2026.',
    tien_thuong: 1800000,
    nam_khen_thuong: 2026,
    ghi_chu: 'Khen thưởng định kỳ nhân dịp 19/8.',
    nguoi_nhap: 'Trung tá Trần Thanh Tuấn',
    created_at: '2026-08-20T10:00:00.000Z',
    updated_at: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'kt_003',
    loai_khen_thuong: 'DotXuat',
    cap_khen_thuong: 'UBND_XA',
    hinh_thuc: 'Giấy khen của Chủ tịch UBND xã Lai Vung',
    thanh_vien_id: 'ns_008',
    ten_nguoi_khen_thuong: 'Lê Văn Cường (Thành viên Tổ ANTT Ấp An Khương)',
    to_antt_id: 'to_03',
    so_quyet_dinh: '45/QĐ-UBND',
    ngay_quyet_dinh: '2026-09-05',
    co_quan_ban_hanh: 'Ủy ban nhân dân xã Lai Vung',
    nguoi_ky: 'Chủ tịch UBND xã',
    ly_do_khen_thuong: 'Đã có hành động dũng cảm cứu vớt 02 cháu nhỏ bị đuối nước tại tuyến kênh Mương Khai, ấp An Khương và khẩn trương sơ cấp cứu kịp thời bảo toàn tính mạng.',
    tien_thuong: 1000000,
    nam_khen_thuong: 2026,
    ghi_chu: 'Gương người tốt việc tốt tiêu biểu của lực lượng ANTT cơ sở.',
    nguoi_nhap: 'Trung tá Trần Thanh Tuấn',
    created_at: '2026-09-06T08:00:00.000Z',
    updated_at: '2026-09-06T08:00:00.000Z',
  },
  {
    id: 'kt_004',
    loai_khen_thuong: 'DinhKy',
    cap_khen_thuong: 'UBND_XA',
    hinh_thuc: 'Giấy khen của Chủ tịch UBND xã Lai Vung',
    ten_nguoi_khen_thuong: 'Tập thể Tổ ANTT Ấp An Lạc',
    to_antt_id: 'to_04',
    so_quyet_dinh: '18/QĐ-UBND',
    ngay_quyet_dinh: '2026-01-15',
    co_quan_ban_hanh: 'Ủy ban nhân dân xã Lai Vung',
    nguoi_ky: 'Chủ tịch UBND xã',
    ly_do_khen_thuong: 'Đã có thành tích hoàn thành xuất sắc nhiệm vụ bảo đảm an ninh trật tự, an toàn xã hội trên địa bàn ấp An Lạc trong năm 2025, giữ vững địa bàn không có tội phạm.',
    tien_thuong: 2000000,
    nam_khen_thuong: 2025,
    ghi_chu: 'Khen thưởng tập thể xuất sắc tổng kết công tác năm.',
    nguoi_nhap: 'Trung tá Trần Thanh Tuấn',
    created_at: '2026-01-16T14:00:00.000Z',
    updated_at: '2026-01-16T14:00:00.000Z',
  },
];

class StorageService {
  constructor() {
    this.initSystemAndEnforceAdmin();
  }

  private initSystemAndEnforceAdmin(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const CLEAR_FLAG = 'ca_laivung_cleared_by_tuan_v1';
    if (localStorage.getItem(CLEAR_FLAG) !== 'done') {
      // 1. Xóa sạch toàn bộ dữ liệu nhân sự hiện có
      localStorage.setItem(STORAGE_KEYS.NHAN_SU, JSON.stringify([]));

      // 2. Thiết lập lại danh sách tài khoản chuẩn, đảm bảo Admin là Trung tá Trần Thanh Tuấn
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));

      // 3. Đăng nhập phiên làm việc mặc định cho Trung tá Trần Thanh Tuấn
      const adminUser: UserAccount = {
        ...INITIAL_USERS[0],
        lastLoginAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(adminUser));

      // 4. Khởi tạo nhật ký hệ thống ghi nhận việc bàn giao và làm sạch dữ liệu
      const now = new Date().toISOString();
      const initialLog: AuditLog = {
        id: 'log_init_' + Date.now(),
        user_id: adminUser.id,
        user_name: adminUser.fullName,
        userName: adminUser.fullName,
        user_role: 'ADMIN',
        userRole: 'ADMIN',
        thoi_gian: now,
        timestamp: now,
        hanh_dong: 'CHINH_SUA',
        action: 'CHINH_SUA',
        doi_tuong: 'Cơ sở dữ liệu nhân sự ANTT cơ sở',
        target: 'Cơ sở dữ liệu nhân sự ANTT cơ sở',
        noi_dung_thay_doi: 'Đồng chí Trung tá Trần Thanh Tuấn - Phó Trưởng Công an xã (SĐT: 0913344189) tiếp nhận quyền quản trị hệ thống và xóa toàn bộ dữ liệu mẫu hiện có để sẵn sàng nạp dữ liệu chính thức.',
        details: 'Đồng chí Trung tá Trần Thanh Tuấn - Phó Trưởng Công an xã (SĐT: 0913344189) tiếp nhận quyền quản trị hệ thống và xóa toàn bộ dữ liệu mẫu hiện có để sẵn sàng nạp dữ liệu chính thức.',
      };
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([initialLog]));

      localStorage.setItem(CLEAR_FLAG, 'done');
    }

    // Tự động cập nhật đồng bộ 19 ấp chuẩn của xã Lai Vung
    const UPDATE_19_AP_FLAG = 'ca_laivung_19_ap_updated_v2';
    if (localStorage.getItem(UPDATE_19_AP_FLAG) !== 'done') {
      localStorage.setItem(STORAGE_KEYS.DIA_BAN, JSON.stringify(INITIAL_DIA_BAN));
      localStorage.setItem(STORAGE_KEYS.TO_ANTT, JSON.stringify(INITIAL_TO_ANTT));
      localStorage.setItem(UPDATE_19_AP_FLAG, 'done');
    }

    // Khởi tạo dữ liệu tuần tra, tập huấn, khen thưởng nếu chưa có
    if (!localStorage.getItem(STORAGE_KEYS.TUAN_TRA)) {
      localStorage.setItem(STORAGE_KEYS.TUAN_TRA, JSON.stringify(INITIAL_TUAN_TRA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TAP_HUAN)) {
      localStorage.setItem(STORAGE_KEYS.TAP_HUAN, JSON.stringify(INITIAL_TAP_HUAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.KHEN_THUONG)) {
      localStorage.setItem(STORAGE_KEYS.KHEN_THUONG, JSON.stringify(INITIAL_KHEN_THUONG));
    }
  }

  // --- USERS & AUTH ---
  getUsers(): UserAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    let users = INITIAL_USERS;
    if (raw) {
      try {
        users = JSON.parse(raw);
      } catch {
        users = INITIAL_USERS;
      }
    }
    // Luôn đảm bảo tài khoản Admin là đồng chí Trung tá Trần Thanh Tuấn
    const adminIdx = users.findIndex(u => u.role === 'ADMIN' || u.username.toLowerCase() === 'admin');
    const adminAccount: UserAccount = {
      id: adminIdx >= 0 ? users[adminIdx].id : 'user_admin_01',
      username: 'Admin',
      passwordHash: 'Tuan@123',
      fullName: 'Trung tá Trần Thanh Tuấn',
      role: 'ADMIN',
      chucVu: 'Phó Trưởng Công an xã',
      donVi: 'Công an xã Lai Vung',
      soDienThoai: '0913344189',
      createdAt: adminIdx >= 0 ? users[adminIdx].createdAt : '2025-01-01T00:00:00.000Z',
    };

    if (adminIdx >= 0) {
      users[adminIdx] = { ...users[adminIdx], ...adminAccount };
    } else {
      users.unshift(adminAccount);
    }
    this.setUsers(users);
    return users;
  }

  setUsers(users: UserAccount[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getCurrentUser(): UserAccount | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      const user: UserAccount = JSON.parse(raw);
      if (user && (user.role === 'ADMIN' || user.username.toLowerCase() === 'admin')) {
        return {
          ...user,
          username: 'Admin',
          passwordHash: 'Tuan@123',
          fullName: 'Trung tá Trần Thanh Tuấn',
          role: 'ADMIN',
          chucVu: 'Phó Trưởng Công an xã',
          donVi: 'Công an xã Lai Vung',
          soDienThoai: '0913344189',
        };
      }
      return user;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: UserAccount | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // --- DIA BAN (ẤP) ---
  getDiaBanList(): DiaBanAp[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DIA_BAN);
    if (!raw) {
      this.setDiaBanList(INITIAL_DIA_BAN);
      return INITIAL_DIA_BAN;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DIA_BAN;
    }
  }

  setDiaBanList(list: DiaBanAp[]): void {
    localStorage.setItem(STORAGE_KEYS.DIA_BAN, JSON.stringify(list));
  }

  saveDiaBan(item: DiaBanAp): void {
    const list = this.getDiaBanList();
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) {
      list[index] = { ...item, updated_at: new Date().toISOString() };
    } else {
      list.push({
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    this.setDiaBanList(list);
  }

  deleteDiaBan(id: string): void {
    const list = this.getDiaBanList().filter(i => i.id !== id);
    this.setDiaBanList(list);
  }

  // --- TỔ ANTT ---
  getToANTTList(): ToANTT[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TO_ANTT);
    if (!raw) {
      this.setToANTTList(INITIAL_TO_ANTT);
      return INITIAL_TO_ANTT;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TO_ANTT;
    }
  }

  setToANTTList(list: ToANTT[]): void {
    localStorage.setItem(STORAGE_KEYS.TO_ANTT, JSON.stringify(list));
  }

  saveToANTT(item: ToANTT): void {
    const list = this.getToANTTList();
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) {
      list[index] = { ...item, updated_at: new Date().toISOString() };
    } else {
      list.push({
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    this.setToANTTList(list);
  }

  deleteToANTT(id: string): void {
    const list = this.getToANTTList().filter(i => i.id !== id);
    this.setToANTTList(list);
  }

  // --- NHÂN SỰ ---
  getNhanSuList(includeDeleted = false): NhanSu[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NHAN_SU);
    let list: NhanSu[] = [];
    if (!raw) {
      this.setNhanSuList(INITIAL_NHAN_SU);
      list = INITIAL_NHAN_SU;
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_NHAN_SU;
      }
    }
    if (includeDeleted) return list;
    return list.filter(item => item.trang_thai !== 'da_xoa');
  }

  getAllNhanSuRaw(): NhanSu[] {
    return this.getNhanSuList(true);
  }

  setNhanSuList(list: NhanSu[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.NHAN_SU, JSON.stringify(list));
      return true;
    } catch (e) {
      console.warn('Cảnh báo bộ nhớ trình duyệt đầy, tiến hành tối ưu hóa lưu trữ:', e);
      try {
        // Tối ưu hóa: cắt bớt kích thước chuỗi base64 nếu ảnh quá lớn
        const optimizedList = list.map(m => {
          if (m.anh_chan_dung && m.anh_chan_dung.length > 500000) {
            return { ...m, anh_chan_dung: m.anh_chan_dung.slice(0, 250000) };
          }
          return m;
        });
        localStorage.setItem(STORAGE_KEYS.NHAN_SU, JSON.stringify(optimizedList));
        return true;
      } catch (err2) {
        console.error('Không thể ghi dữ liệu nhân sự vào localStorage:', err2);
        return false;
      }
    }
  }

  saveNhanSu(item: NhanSu): { success: boolean; error?: string } {
    const list = this.getAllNhanSuRaw();
    // Kiểm tra trùng CCCD nếu CCCD được nhập
    if (item.so_cccd && item.so_cccd.trim() !== '') {
      const cleanCCCD = item.so_cccd.trim();
      const duplicate = list.find(
        ns => ns.id !== item.id && ns.trang_thai !== 'da_xoa' && ns.so_cccd.trim() === cleanCCCD
      );
      if (duplicate) {
        return {
          success: false,
          error: `Số CCCD "${cleanCCCD}" đã tồn tại trên hồ sơ của "${duplicate.ho_ten}" (${duplicate.ma_nhan_su}). Vui lòng kiểm tra lại!`,
        };
      }
    }

    const index = list.findIndex(i => i.id === item.id);
    const now = new Date().toISOString();

    if (index >= 0) {
      list[index] = {
        ...item,
        updated_at: now,
      };
    } else {
      const maxStt = list.length > 0 ? Math.max(...list.map(i => i.stt || 0)) : 0;
      list.push({
        ...item,
        stt: item.stt || maxStt + 1,
        created_at: now,
        updated_at: now,
      });
    }

    this.setNhanSuList(list);
    return { success: true };
  }

  softDeleteNhanSu(id: string): boolean {
    const list = this.getAllNhanSuRaw();
    const index = list.findIndex(i => i.id === id);
    if (index >= 0) {
      list[index].trang_thai = 'da_xoa';
      list[index].deleted_at = new Date().toISOString();
      list[index].updated_at = new Date().toISOString();
      this.setNhanSuList(list);
      return true;
    }
    return false;
  }

  restoreNhanSu(id: string): boolean {
    const list = this.getAllNhanSuRaw();
    const index = list.findIndex(i => i.id === id);
    if (index >= 0) {
      list[index].trang_thai = 'dang_hoat_dong';
      delete list[index].deleted_at;
      list[index].updated_at = new Date().toISOString();
      this.setNhanSuList(list);
      return true;
    }
    return false;
  }

  permanentDeleteNhanSu(id: string): boolean {
    const list = this.getAllNhanSuRaw().filter(i => i.id !== id);
    this.setNhanSuList(list);
    return true;
  }

  // --- QUYẾT ĐỊNH CHO THÔI THAM GIA LỰC LƯỢNG ANTT CƠ SỞ (UBND CẤP XÃ) ---
  dismissNhanSu(id: string, data: DismissMemberData, currentUser?: UserAccount): boolean {
    const list = this.getAllNhanSuRaw();
    const index = list.findIndex(i => i.id === id);
    if (index >= 0) {
      const now = new Date().toISOString();
      const member = list[index];
      list[index] = {
        ...member,
        trang_thai: 'da_thoi_viec',
        so_quyet_dinh_thoi_viec: data.so_quyet_dinh_thoi_viec,
        ngay_quyet_dinh_thoi_viec: data.ngay_quyet_dinh_thoi_viec,
        ngay_thoi_viec: data.ngay_thoi_viec,
        co_quan_ban_hanh_thoi_viec: data.co_quan_ban_hanh_thoi_viec,
        nguoi_ky_thoi_viec: data.nguoi_ky_thoi_viec,
        ly_do_thoi_viec: data.ly_do_thoi_viec,
        da_thu_hoi_the_trang_thiet_bi: data.da_thu_hoi_the_trang_thiet_bi,
        ghi_chu_thoi_viec: data.ghi_chu_thoi_viec,
        updated_at: now,
      };
      this.setNhanSuList(list);

      const user = currentUser || this.getCurrentUser();
      this.addAuditLog(
        user,
        'CHO_THOI_THAM_GIA',
        `Hồ sơ: ${member.ho_ten} (${member.ma_nhan_su})`,
        `Ban hành QĐ cho thôi tham gia ANTT số ${data.so_quyet_dinh_thoi_viec} ngày ${data.ngay_quyet_dinh_thoi_viec} (${data.co_quan_ban_hanh_thoi_viec}). Lý do: ${data.ly_do_thoi_viec}`
      );
      return true;
    }
    return false;
  }

  reactivateNhanSu(id: string, currentUser?: UserAccount): boolean {
    const list = this.getAllNhanSuRaw();
    const index = list.findIndex(i => i.id === id);
    if (index >= 0) {
      const member = list[index];
      const now = new Date().toISOString();
      list[index] = {
        ...member,
        trang_thai: 'dang_hoat_dong',
        updated_at: now,
      };
      this.setNhanSuList(list);

      const user = currentUser || this.getCurrentUser();
      this.addAuditLog(
        user,
        'KHOI_PHUC_THAM_GIA',
        `Hồ sơ: ${member.ho_ten} (${member.ma_nhan_su})`,
        `Khôi phục đồng chí ${member.ho_ten} trở lại danh sách đang hoạt động lực lượng ANTT cơ sở`
      );
      return true;
    }
    return false;
  }

  updateDismissalDecisionNhanSu(id: string, data: DismissMemberData, currentUser?: UserAccount): boolean {
    const list = this.getAllNhanSuRaw();
    const index = list.findIndex(i => i.id === id);
    if (index >= 0) {
      const now = new Date().toISOString();
      const member = list[index];
      list[index] = {
        ...member,
        so_quyet_dinh_thoi_viec: data.so_quyet_dinh_thoi_viec,
        ngay_quyet_dinh_thoi_viec: data.ngay_quyet_dinh_thoi_viec,
        ngay_thoi_viec: data.ngay_thoi_viec,
        co_quan_ban_hanh_thoi_viec: data.co_quan_ban_hanh_thoi_viec,
        nguoi_ky_thoi_viec: data.nguoi_ky_thoi_viec,
        ly_do_thoi_viec: data.ly_do_thoi_viec,
        da_thu_hoi_the_trang_thiet_bi: data.da_thu_hoi_the_trang_thiet_bi,
        ghi_chu_thoi_viec: data.ghi_chu_thoi_viec,
        updated_at: now,
      };
      this.setNhanSuList(list);

      const user = currentUser || this.getCurrentUser();
      this.addAuditLog(
        user,
        'CAP_NHAT_QD_THOI_VIEC',
        `Hồ sơ: ${member.ho_ten} (${member.ma_nhan_su})`,
        `Cập nhật thông tin Quyết định cho thôi tham gia: Số ${data.so_quyet_dinh_thoi_viec}`
      );
      return true;
    }
    return false;
  }

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  addAuditLog(
    user: UserAccount | null,
    action: AuditLog['hanh_dong'],
    target: string,
    details: string
  ): void {
    const logs = this.getAuditLogs();
    const now = new Date().toISOString();
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: user?.id || 'system',
      user_name: user?.fullName || 'Hệ thống',
      userName: user?.fullName || 'Hệ thống',
      user_role: user?.role || 'ADMIN',
      userRole: user?.role || 'ADMIN',
      thoi_gian: now,
      timestamp: now,
      hanh_dong: action,
      action: action,
      doi_tuong: target,
      target: target,
      noi_dung_thay_doi: details,
      details: details,
    };
    logs.unshift(newLog); // mới nhất lên đầu
    // Giữ tối đa 500 bản ghi audit log
    if (logs.length > 500) {
      logs.length = 500;
    }
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  // --- CONVENIENCE ALIASES FOR COMPONENT INTERACTION ---
  getMembers(): NhanSu[] {
    return this.getAllNhanSuRaw();
  }

  getDiaBan(): DiaBanAp[] {
    return this.getDiaBanList();
  }

  getToANTT(): ToANTT[] {
    return this.getToANTTList();
  }

  saveMember(item: NhanSu): { success: boolean; error?: string } {
    return this.saveNhanSu(item);
  }

  bulkSaveMembers(items: NhanSu[]): void {
    const current = this.getAllNhanSuRaw();
    const merged = [...items, ...current.filter(c => !items.some(i => i.id === c.id))];
    this.setNhanSuList(merged);
  }

  softDeleteMember(id: string): boolean {
    return this.softDeleteNhanSu(id);
  }

  restoreMember(id: string): boolean {
    return this.restoreNhanSu(id);
  }

  permanentDeleteMember(id: string): boolean {
    return this.permanentDeleteNhanSu(id);
  }

  dismissMember(id: string, data: DismissMemberData, currentUser?: UserAccount): boolean {
    return this.dismissNhanSu(id, data, currentUser);
  }

  reactivateMember(id: string, currentUser?: UserAccount): boolean {
    return this.reactivateNhanSu(id, currentUser);
  }

  updateDismissalDecision(id: string, data: DismissMemberData, currentUser?: UserAccount): boolean {
    return this.updateDismissalDecisionNhanSu(id, data, currentUser);
  }

  exportFullBackupJSON(): string {
    return this.exportDatabaseJSON();
  }

  restoreFromBackupJSON(jsonString: string): boolean {
    const res = this.importDatabaseJSON(jsonString);
    return res.success;
  }

  // --- TUẦN TRA & PHỐI HỢP ANTT ---
  getNhatKyTuanTraList(): NhatKyTuanTra[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TUAN_TRA);
    if (!raw) return INITIAL_TUAN_TRA;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TUAN_TRA;
    }
  }

  saveNhatKyTuanTra(item: NhatKyTuanTra, user?: UserAccount): NhatKyTuanTra {
    const list = this.getNhatKyTuanTraList();
    const currentUser = user || this.getCurrentUser() || INITIAL_USERS[0];
    const isEdit = list.some(x => x.id === item.id);
    let updated: NhatKyTuanTra[];

    const finalItem: NhatKyTuanTra = {
      ...item,
      tong_so_cuoc: (Number(item.so_cuoc_cong_khai) || 0) + (Number(item.so_cuoc_mat_phuc) || 0),
      updated_at: new Date().toISOString(),
    };

    if (isEdit) {
      updated = list.map(x => x.id === item.id ? finalItem : x);
      this.addAuditLog(
        currentUser,
        'CAP_NHAT',
        `Nhật ký tuần tra ngày ${item.ngay_tuan_tra} (${item.ca_tuan_tra})`,
        `Cập nhật số cuộc: ${finalItem.tong_so_cuoc} (Công khai: ${finalItem.so_cuoc_cong_khai}, Mật phục: ${finalItem.so_cuoc_mat_phuc}), Lượt TV: ${finalItem.so_luot_thanh_vien}`
      );
    } else {
      finalItem.created_at = new Date().toISOString();
      updated = [finalItem, ...list];
      this.addAuditLog(
        currentUser,
        'THEM_MOI',
        `Nhật ký tuần tra ngày ${item.ngay_tuan_tra} (${item.ca_tuan_tra})`,
        `Ghi sổ tuần tra: ${finalItem.tong_so_cuoc} cuộc (Công khai: ${finalItem.so_cuoc_cong_khai}, Mật phục: ${finalItem.so_cuoc_mat_phuc}), Lực lượng: ${finalItem.so_luot_thanh_vien} lượt thành viên`
      );
    }

    localStorage.setItem(STORAGE_KEYS.TUAN_TRA, JSON.stringify(updated));
    return finalItem;
  }

  deleteNhatKyTuanTra(id: string, user?: UserAccount): void {
    const list = this.getNhatKyTuanTraList();
    const item = list.find(x => x.id === id);
    if (!item) return;

    const currentUser = user || this.getCurrentUser() || INITIAL_USERS[0];
    const updated = list.filter(x => x.id !== id);
    localStorage.setItem(STORAGE_KEYS.TUAN_TRA, JSON.stringify(updated));

    this.addAuditLog(
      currentUser,
      'XOA_VINH_VIEN',
      `Nhật ký tuần tra ngày ${item.ngay_tuan_tra} (${item.ca_tuan_tra})`,
      `Xóa bỏ nhật ký ca tuần tra do ${item.nguoi_ghi_so} lập`
    );
  }

  // --- QUẢN LÝ TẬP HUẤN NGHIỆP VỤ ---
  getDotTapHuanList(): DotTapHuan[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TAP_HUAN);
    if (!raw) return INITIAL_TAP_HUAN;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TAP_HUAN;
    }
  }

  saveDotTapHuan(item: DotTapHuan, user?: UserAccount): DotTapHuan {
    const list = this.getDotTapHuanList();
    const currentUser = user || this.getCurrentUser() || INITIAL_USERS[0];
    const isEdit = list.some(x => x.id === item.id);
    let updated: DotTapHuan[];

    const finalItem: DotTapHuan = {
      ...item,
      updated_at: new Date().toISOString(),
    };

    if (isEdit) {
      updated = list.map(x => x.id === item.id ? finalItem : x);
      this.addAuditLog(
        currentUser,
        'CAP_NHAT',
        `Đợt tập huấn: ${item.ten_dot}`,
        `Cập nhật đợt tập huấn: ${item.so_lop} lớp, ${item.so_thanh_vien_tham_gia} thành viên tham gia (${item.don_vi_to_chuc})`
      );
    } else {
      finalItem.created_at = new Date().toISOString();
      updated = [finalItem, ...list];
      this.addAuditLog(
        currentUser,
        'THEM_MOI',
        `Đợt tập huấn: ${item.ten_dot}`,
        `Tạo mới đợt tập huấn: ${item.so_lop} lớp, ${item.so_thanh_vien_tham_gia} thành viên tham gia do ${item.don_vi_to_chuc} tổ chức`
      );
    }

    localStorage.setItem(STORAGE_KEYS.TAP_HUAN, JSON.stringify(updated));
    return finalItem;
  }

  deleteDotTapHuan(id: string, user?: UserAccount): void {
    const list = this.getDotTapHuanList();
    const item = list.find(x => x.id === id);
    if (!item) return;

    const currentUser = user || this.getCurrentUser() || INITIAL_USERS[0];
    const updated = list.filter(x => x.id !== id);
    localStorage.setItem(STORAGE_KEYS.TAP_HUAN, JSON.stringify(updated));

    this.addAuditLog(
      currentUser,
      'XOA_VINH_VIEN',
      `Đợt tập huấn: ${item.ten_dot}`,
      `Xóa hồ sơ đợt tập huấn nghiệp vụ do ${item.nguoi_nhap} khởi tạo`
    );
  }

  // --- QUẢN LÝ THI ĐUA - KHEN THƯỞNG ---
  getHoSoKhenThuongList(): HoSoKhenThuong[] {
    const raw = localStorage.getItem(STORAGE_KEYS.KHEN_THUONG);
    if (!raw) return INITIAL_KHEN_THUONG;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_KHEN_THUONG;
    }
  }

  saveHoSoKhenThuong(item: HoSoKhenThuong, user?: UserAccount): HoSoKhenThuong {
    const list = this.getHoSoKhenThuongList();
    const currentUser = user || this.getCurrentUser() || INITIAL_USERS[0];
    const isEdit = list.some(x => x.id === item.id);
    let updated: HoSoKhenThuong[];

    const finalItem: HoSoKhenThuong = {
      ...item,
      updated_at: new Date().toISOString(),
    };

    const loaiText = item.loai_khen_thuong === 'DotXuat' ? 'Đột xuất' : 'Định kỳ';
    const capText = item.cap_khen_thuong === 'UBND_TINH' ? 'Cấp UBND tỉnh' : item.cap_khen_thuong === 'CONG_AN_TINH' ? 'Cấp Công an tỉnh' : 'Cấp UBND xã';

    if (isEdit) {
      updated = list.map(x => x.id === item.id ? finalItem : x);
      this.addAuditLog(
        currentUser,
        'CAP_NHAT',
        `Khen thưởng QĐ ${item.so_quyet_dinh} - ${item.ten_nguoi_khen_thuong || 'Tập thể'}`,
        `Cập nhật hồ sơ khen thưởng: ${loaiText} (${capText}) - ${item.hinh_thuc}`
      );
    } else {
      finalItem.created_at = new Date().toISOString();
      updated = [finalItem, ...list];
      this.addAuditLog(
        currentUser,
        'THEM_MOI',
        `Khen thưởng QĐ ${item.so_quyet_dinh} - ${item.ten_nguoi_khen_thuong || 'Tập thể'}`,
        `Thêm mới hồ sơ khen thưởng: ${loaiText} (${capText}) - ${item.hinh_thuc}`
      );
    }

    localStorage.setItem(STORAGE_KEYS.KHEN_THUONG, JSON.stringify(updated));
    return finalItem;
  }

  deleteHoSoKhenThuong(id: string, user?: UserAccount): void {
    const list = this.getHoSoKhenThuongList();
    const item = list.find(x => x.id === id);
    if (!item) return;

    const currentUser = user || this.getCurrentUser() || INITIAL_USERS[0];
    const updated = list.filter(x => x.id !== id);
    localStorage.setItem(STORAGE_KEYS.KHEN_THUONG, JSON.stringify(updated));

    this.addAuditLog(
      currentUser,
      'XOA_VINH_VIEN',
      `Khen thưởng QĐ ${item.so_quyet_dinh} - ${item.ten_nguoi_khen_thuong || 'Tập thể'}`,
      `Xóa quyết định khen thưởng số ${item.so_quyet_dinh}`
    );
  }

  // --- BACKUP & RESTORE ---
  exportDatabaseJSON(): string {
    const backupData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      agency: 'CÔNG AN XÃ LAI VUNG',
      system: 'QUẢN LÝ THÀNH VIÊN ANTT CƠ SỞ',
      data: {
        users: this.getUsers(),
        dia_ban: this.getDiaBanList(),
        to_antt: this.getToANTTList(),
        nhan_su: this.getAllNhanSuRaw(),
        audit_logs: this.getAuditLogs(),
        tuan_tra: this.getNhatKyTuanTraList(),
        tap_huan: this.getDotTapHuanList(),
        khen_thuong: this.getHoSoKhenThuongList(),
      },
    };
    return JSON.stringify(backupData, null, 2);
  }

  importDatabaseJSON(jsonString: string): { success: boolean; message: string; count?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !Array.isArray(parsed.data.nhan_su)) {
        return { success: false, message: 'Tệp sao lưu không đúng cấu trúc hệ thống Công an xã Lai Vung!' };
      }

      if (parsed.data.users) this.setUsers(parsed.data.users);
      if (parsed.data.dia_ban) this.setDiaBanList(parsed.data.dia_ban);
      if (parsed.data.to_antt) this.setToANTTList(parsed.data.to_antt);
      if (parsed.data.nhan_su) this.setNhanSuList(parsed.data.nhan_su);
      if (parsed.data.audit_logs) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(parsed.data.audit_logs));
      }
      if (parsed.data.tuan_tra) {
        localStorage.setItem(STORAGE_KEYS.TUAN_TRA, JSON.stringify(parsed.data.tuan_tra));
      }
      if (parsed.data.tap_huan) {
        localStorage.setItem(STORAGE_KEYS.TAP_HUAN, JSON.stringify(parsed.data.tap_huan));
      }
      if (parsed.data.khen_thuong) {
        localStorage.setItem(STORAGE_KEYS.KHEN_THUONG, JSON.stringify(parsed.data.khen_thuong));
      }

      return {
        success: true,
        message: 'Khôi phục cơ sở dữ liệu thành công!',
        count: parsed.data.nhan_su.length,
      };
    } catch (e: any) {
      return {
        success: false,
        message: 'Lỗi đọc tệp JSON: ' + (e?.message || 'Tệp hỏng hoặc không đúng định dạng'),
      };
    }
  }

  resetToDemoData(): void {
    this.setUsers(INITIAL_USERS);
    this.setDiaBanList(INITIAL_DIA_BAN);
    this.setToANTTList(INITIAL_TO_ANTT);
    this.setNhanSuList(DEMO_SAMPLE_MEMBERS);
    localStorage.setItem(STORAGE_KEYS.TUAN_TRA, JSON.stringify(INITIAL_TUAN_TRA));
    localStorage.setItem(STORAGE_KEYS.TAP_HUAN, JSON.stringify(INITIAL_TAP_HUAN));
    localStorage.setItem(STORAGE_KEYS.KHEN_THUONG, JSON.stringify(INITIAL_KHEN_THUONG));
  }

  clearAllData(user?: UserAccount): void {
    this.setNhanSuList([]);
    const currentUser = user || this.getCurrentUser() || INITIAL_USERS[0];
    this.addAuditLog(
      currentUser,
      'XOA_VINH_VIEN',
      'Toàn bộ danh sách hồ sơ nhân sự',
      'Đồng chí Trung tá Trần Thanh Tuấn - Phó Trưởng Công an xã đã thực hiện xóa sạch toàn bộ dữ liệu nhân sự trong hệ thống'
    );
  }
}

export const storageService = new StorageService();
