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
import { OFFICIAL_MEMBERS } from '../data/officialMembers';
import { supabase, SUPABASE_TABLES, SUPABASE_URL } from './supabaseClient';
import { sessionDataCache, removeLegacyBusinessData } from './sessionDataCache';

// Nhật ký chỉ được thêm qua RPC; danh tính và thời gian do máy chủ xác định.
async function appendOwnAuditLogs(logs: AuditLog[]): Promise<void> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Cần đăng nhập để ghi nhật ký.');
  for (const log of logs) {
    if (log.user_id !== data.user.id) continue;
    const { error: writeError } = await supabase.rpc('append_audit_event', {
      p_event: {
        id: log.id,
        hanh_dong: log.hanh_dong,
        doi_tuong: log.doi_tuong,
        noi_dung_thay_doi: log.noi_dung_thay_doi,
      },
    });
    if (writeError) throw new Error(writeError.message);
  }
}



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

export const SYSTEM_MANAGER_INFO = {
  fullName: 'Trần Thanh Tuấn',
  rank: 'Trung tá',
  title: 'Phó Trưởng Công an xã',
  phone: '0913344189',
  agency: 'Công an xã Lai Vung',
  parentAgency: 'Công an tỉnh Đồng Tháp',
  province: 'Tỉnh Đồng Tháp',
  adminUsername: 'Admin',
};

const INITIAL_USERS: UserAccount[] = [];

const SYSTEM_AUDIT_USER: UserAccount = {
  id: 'system',
  username: 'system',
  fullName: 'Hệ thống Công an xã',
  role: 'VIEWER',
  chucVu: 'Hệ thống',
  donVi: 'Công an xã Lai Vung',
  createdAt: '2025-01-01T00:00:00.000Z',
};

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
    to_truong_id: 'ns_007',
    to_pho_id: 'ns_008',
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
    to_truong_id: 'ns_049',
    to_pho_id: 'ns_050',
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
    to_truong_id: 'ns_001',
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
    to_truong_id: 'ns_054',
    to_pho_id: 'ns_055',
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
    to_truong_id: 'ns_011',
    to_pho_id: 'ns_012',
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
    to_truong_id: 'ns_016',
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
    to_truong_id: 'ns_057',
    to_pho_id: 'ns_058',
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
    to_truong_id: 'ns_062',
    to_pho_id: 'ns_063',
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
    to_truong_id: 'ns_008',
    to_pho_id: 'ns_012',
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
    to_truong_id: 'ns_004',
    to_pho_id: 'ns_027',
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
    to_truong_id: 'ns_007',
    to_pho_id: 'ns_014',
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
    to_truong_id: 'ns_006',
    to_pho_id: 'ns_009',
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
    to_truong_id: 'ns_003',
    to_pho_id: 'ns_011',
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
    to_truong_id: 'ns_001',
    to_pho_id: 'ns_002',
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
    to_truong_id: 'ns_044',
    to_pho_id: 'ns_045',
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
    to_truong_id: 'ns_028',
    to_pho_id: 'ns_029',
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
    to_truong_id: 'ns_040',
    to_pho_id: 'ns_041',
    ngay_thanh_lap: '2024-07-01',
    dia_ban_hoat_dong: 'Toàn bộ địa bàn Ấp Tân Thuận',
    trang_thai: 'hoat_dong',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
];

// Dữ liệu chuẩn chính thức lực lượng ANTT cơ sở xã Lai Vung (19 đồng chí chính thức theo biểu mẫu văn bản)
const INITIAL_NHAN_SU: NhanSu[] = OFFICIAL_MEMBERS;
export const DEMO_SAMPLE_MEMBERS: NhanSu[] = OFFICIAL_MEMBERS;
const INITIAL_TUAN_TRA: NhatKyTuanTra[] = [];
const INITIAL_TAP_HUAN: DotTapHuan[] = [];
const INITIAL_KHEN_THUONG: HoSoKhenThuong[] = [];

/**
 * Gộp 19 đồng chí chính thức từ biểu mẫu văn bản vào danh sách hiện tại.
 * Đảm bảo:
 * - Nếu đồng chí đã có (trùng CCCD hoặc Họ tên + Ngày sinh): cập nhật thông tin chuẩn xác theo biểu mẫu.
 * - Nếu chưa có: thêm mới nối tiếp (STT từ 65..83, mã NS từ NS-065..NS-083, ID duy nhất), đưa tổng quân số lên đúng 83.
 */
export function mergeOfficial19Members(existingList: NhanSu[]): {
  mergedList: NhanSu[];
  newlyAddedCount: number;
  toUpsert: NhanSu[];
} {
  const currentList = [...existingList];
  const toUpsert: NhanSu[] = [];
  let addedCount = 0;

  for (const official of OFFICIAL_MEMBERS) {
    const cleanCCCD = (official.so_cccd || '').trim();

    // 1. Tìm theo số CCCD (định danh duy nhất của công dân)
    let idx = -1;
    if (cleanCCCD) {
      idx = currentList.findIndex(
        m => m.so_cccd && m.so_cccd.trim() === cleanCCCD
      );
    }

    // 2. Nếu không thấy theo CCCD, tìm theo Họ tên + Ngày sinh
    if (idx === -1) {
      idx = currentList.findIndex(
        m => m.ho_ten.trim().toLowerCase() === official.ho_ten.trim().toLowerCase() &&
             m.ngay_sinh === official.ngay_sinh
      );
    }

    if (idx >= 0) {
      const existing = currentList[idx];
      const updated: NhanSu = {
        ...existing,
        ho_ten: official.ho_ten,
        ngay_sinh: official.ngay_sinh,
        gioi_tinh: official.gioi_tinh,
        chuc_vu: official.chuc_vu,
        chuc_vu_kiem_nhiem: official.chuc_vu_kiem_nhiem,
        ap_id: official.ap_id,
        to_antt_id: official.to_antt_id,
        dia_chi_chi_tiet: official.dia_chi_chi_tiet,
        noi_o_hien_nay: official.noi_o_hien_nay,
        trinh_do_hoc_van: official.trinh_do_hoc_van,
        trinh_do_chuyen_mon: official.trinh_do_chuyen_mon,
        chuyen_nganh: official.chuyen_nganh,
        dang_vien: official.dang_vien,
        vneid_muc_2: official.vneid_muc_2,
        co_tai_khoan: official.co_tai_khoan,
        so_tai_khoan: official.so_tai_khoan,
        loai_ngan_hang: official.loai_ngan_hang,
        so_dien_thoai: official.so_dien_thoai,
        ngay_tham_gia_antt: official.ngay_tham_gia_antt,
        ma_bhyt: official.ma_bhyt || existing.ma_bhyt,
        ghi_chu: official.ghi_chu || existing.ghi_chu,
        trang_thai: 'dang_hoat_dong',
        updated_at: new Date().toISOString(),
      };
      currentList[idx] = updated;
      toUpsert.push(updated);
    } else {
      const maxStt = currentList.reduce((max, m) => Math.max(max, m.stt || 0), 0);
      const nextStt = maxStt + 1;

      let nextCodeNum = nextStt;
      while (currentList.some(m => m.ma_nhan_su === `NS-${String(nextCodeNum).padStart(3, '0')}`)) {
        nextCodeNum++;
      }
      const maNhanSu = `NS-${String(nextCodeNum).padStart(3, '0')}`;

      let uniqueId = cleanCCCD ? `ns_official_${cleanCCCD.slice(-6)}_${nextStt}` : `ns_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      while (currentList.some(m => m.id === uniqueId)) {
        uniqueId = `ns_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      }

      const newMember: NhanSu = {
        ...official,
        id: uniqueId,
        ma_nhan_su: maNhanSu,
        stt: nextStt,
        trang_thai: 'dang_hoat_dong',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      currentList.push(newMember);
      toUpsert.push(newMember);
      addedCount++;
    }
  }

  return {
    mergedList: currentList,
    newlyAddedCount: addedCount,
    toUpsert,
  };
}

export type SupabaseSyncStatus =
  | 'checking'
  | 'connected_ready'
  | 'connected_missing_tables'
  | 'syncing'
  | 'error';

export interface SupabaseConnectionReport {
  status: SupabaseSyncStatus;
  message: string;
  projectUrl: string;
  lastSyncAt?: string;
  tableCounts?: {
    nhan_su: number;
    dia_ban_ap: number;
    to_antt: number;
    nhat_ky_tuan_tra: number;
    dot_tap_huan: number;
    ho_so_khen_thuong: number;
  };
  errorDetail?: string;
}

class StorageService {
  private syncStatus: SupabaseSyncStatus = 'checking';
  private syncMessage = 'Đang kiểm tra kết nối Supabase...';
  private lastSyncAt: string | undefined = undefined;
  private lastUsersError: string | null = null;
  private statusListeners: Array<(status: SupabaseSyncStatus, message: string, lastSyncAt?: string) => void> = [];
  private dataListeners: Array<() => void> = [];

  constructor() {
    this.initSystemAndEnforceAdmin();
  }

  getLastUsersError(): string | null {
    return this.lastUsersError;
  }

  // --- SUPABASE LISTENERS & STATUS ---
  subscribeSyncStatus(
    listener: (status: SupabaseSyncStatus, message: string, lastSyncAt?: string) => void
  ): () => void {
    this.statusListeners.push(listener);
    listener(this.syncStatus, this.syncMessage, this.lastSyncAt);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  subscribeDataRefresh(listener: () => void): () => void {
    this.dataListeners.push(listener);
    return () => {
      this.dataListeners = this.dataListeners.filter(l => l !== listener);
    };
  }

  private notifyStatus(status: SupabaseSyncStatus, message: string): void {
    this.syncStatus = status;
    this.syncMessage = message;
    if (status === 'connected_ready') {
      this.lastSyncAt = new Date().toISOString();
    }
    this.statusListeners.forEach(l => l(this.syncStatus, this.syncMessage, this.lastSyncAt));
  }

  private notifyDataRefresh(): void {
    this.dataListeners.forEach(l => l());
  }

  getSyncInfo(): { status: SupabaseSyncStatus; message: string; lastSyncAt?: string } {
    return {
      status: this.syncStatus,
      message: this.syncMessage,
      lastSyncAt: this.lastSyncAt,
    };
  }

  // --- SUPABASE ROW MAPPERS ---
  private fromDbRow<T>(row: any): T {
    if (!row) return row;
    const { raw_data, ...rest } = row;
    const definedCols: Record<string, any> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== null && v !== undefined) {
        definedCols[k] = v;
      }
    }
    const base = typeof raw_data === 'object' && raw_data !== null ? raw_data : {};
    return { ...base, ...definedCols } as T;
  }

  /**
   * Mapper riêng cho bảng public.users -> UserAccount.
   * - Các cột chính thức (id, username, full_name, role, chuc_vu, don_vi, so_dien_thoai, created_at)
   *   là nguồn ưu tiên.
   * - Đặc biệt id và role chỉ lấy từ cột chính thức (hoặc fallback xác thực khi chưa có dòng),
   *   tuyệt đối không lấy quyền (role) hay id từ raw_data.
   * - Ngày tạo thiếu hoặc không hợp lệ trả về '' để hiển thị "Chưa cập nhật", không tự lấy ngày hiện tại.
   * - Loại bỏ hoàn toàn mọi trường mật khẩu / bản băm mật khẩu.
   */
  fromUserRow(row: any, fallback?: Partial<UserAccount>): UserAccount {
    const source = row && typeof row === 'object' ? row : {};
    const raw =
      source.raw_data && typeof source.raw_data === 'object' && source.raw_data !== null
        ? source.raw_data
        : {};

    const pickNonEmptyStr = (...candidates: any[]): string => {
      for (const c of candidates) {
        if (typeof c === 'string' && c.trim() !== '') {
          return c.trim();
        }
      }
      return '';
    };

    const pickValidDateStr = (...candidates: any[]): string => {
      for (const c of candidates) {
        if (typeof c === 'string' && c.trim() !== '') {
          const trimmed = c.trim();
          const parsed = new Date(trimmed);
          if (!Number.isNaN(parsed.getTime())) {
            return trimmed;
          }
        }
      }
      return '';
    };

    // 1. id: Nguồn ưu tiên tuyệt đối từ cột id chính thức, không lấy từ raw_data
    const id = pickNonEmptyStr(
      source.id != null ? String(source.id) : '',
      fallback?.id != null ? String(fallback.id) : ''
    );

    // 2. role: Nguồn ưu tiên tuyệt đối từ cột role chính thức, KHÔNG lấy quyền từ raw_data
    const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'VIEWER'];
    const roleCandidate = source.role ?? fallback?.role;
    const role: UserRole = validRoles.includes(roleCandidate) ? roleCandidate : 'VIEWER';

    // 3. Các cột chính thức trong bảng public.users là nguồn ưu tiên
    const username = pickNonEmptyStr(
      source.username,
      raw.username,
      fallback?.username
    );

    const email = pickNonEmptyStr(
      source.email,
      raw.email,
      fallback?.email
    ) || undefined;

    const fullName = pickNonEmptyStr(
      source.full_name,
      source.fullName,
      raw.fullName,
      raw.full_name,
      fallback?.fullName,
      username
    );

    const chucVu = pickNonEmptyStr(
      source.chuc_vu,
      source.chucVu,
      raw.chucVu,
      raw.chuc_vu,
      fallback?.chucVu
    ) || 'Cán bộ Công an xã';

    const donVi = pickNonEmptyStr(
      source.don_vi,
      source.donVi,
      raw.donVi,
      raw.don_vi,
      fallback?.donVi
    ) || 'Công an xã Lai Vung';

    const soDienThoai = pickNonEmptyStr(
      source.so_dien_thoai,
      source.soDienThoai,
      raw.soDienThoai,
      raw.so_dien_thoai,
      fallback?.soDienThoai
    );

    // 4. Ngày tạo: không tự lấy ngày hiện tại thay ngày tạo bị thiếu
    const createdAt = pickValidDateStr(
      source.created_at,
      source.createdAt,
      raw.createdAt,
      raw.created_at,
      fallback?.createdAt
    );

    const lastLoginAt = pickValidDateStr(
      source.last_login_at,
      source.lastLoginAt,
      raw.lastLoginAt,
      raw.last_login_at,
      fallback?.lastLoginAt
    ) || undefined;

    return {
      id,
      username,
      ...(email ? { email } : {}),
      fullName,
      role,
      chucVu,
      donVi,
      soDienThoai,
      ...(lastLoginAt ? { lastLoginAt } : {}),
      createdAt,
    };
  }

  private toDiaBanRow(item: DiaBanAp) {
    return {
      id: item.id,
      ma_ap: item.ma_ap,
      ten_ap: item.ten_ap,
      mo_ta: item.mo_ta || null,
      ghi_chu: item.ghi_chu || null,
      trang_thai: item.trang_thai || 'hoat_dong',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      raw_data: item,
    };
  }

  private toToANTTRow(item: ToANTT) {
    return {
      id: item.id,
      ma_to: item.ma_to,
      ten_to: item.ten_to,
      ap_id: item.ap_id || null,
      to_truong_id: item.to_truong_id || null,
      to_pho_id: item.to_pho_id || null,
      ngay_thanh_lap: item.ngay_thanh_lap || null,
      dia_ban_hoat_dong: item.dia_ban_hoat_dong || null,
      ghi_chu: item.ghi_chu || null,
      trang_thai: item.trang_thai || 'hoat_dong',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      raw_data: item,
    };
  }

  private toNhanSuRow(item: NhanSu) {
    return {
      id: item.id,
      ma_nhan_su: item.ma_nhan_su,
      stt: item.stt || 1,
      ho_ten: item.ho_ten,
      ngay_sinh: item.ngay_sinh || null,
      gioi_tinh: item.gioi_tinh || 'Nam',
      dan_toc: item.dan_toc || 'Kinh',
      que_quan: item.que_quan || '',
      noi_o_hien_nay: item.noi_o_hien_nay || '',
      ap_id: item.ap_id || null,
      dia_chi_chi_tiet: item.dia_chi_chi_tiet || '',
      to_antt_id: item.to_antt_id || null,
      chuc_vu: item.chuc_vu || 'Thành viên',
      chuc_vu_kiem_nhiem: item.chuc_vu_kiem_nhiem || null,
      trinh_do_hoc_van: item.trinh_do_hoc_van || 'THPT',
      trinh_do_chuyen_mon: item.trinh_do_chuyen_mon || 'Chưa qua đào tạo',
      chuyen_nganh: item.chuyen_nganh || null,
      so_cccd: item.so_cccd || '',
      ngay_cap_cccd: item.ngay_cap_cccd || null,
      dang_vien: Boolean(item.dang_vien),
      ngay_tham_gia_antt: item.ngay_tham_gia_antt || null,
      so_quyet_dinh: item.so_quyet_dinh || null,
      co_tai_khoan: Boolean(item.co_tai_khoan),
      loai_ngan_hang: item.loai_ngan_hang || null,
      so_tai_khoan: item.so_tai_khoan || null,
      vneid_muc_2: Boolean(item.vneid_muc_2),
      so_dien_thoai: item.so_dien_thoai || '',
      ma_bhyt: item.ma_bhyt || null,
      ghi_chu: item.ghi_chu || null,
      trang_thai: item.trang_thai || 'dang_hoat_dong',
      so_quyet_dinh_thoi_viec: item.so_quyet_dinh_thoi_viec || null,
      ngay_quyet_dinh_thoi_viec: item.ngay_quyet_dinh_thoi_viec || null,
      ngay_thoi_viec: item.ngay_thoi_viec || null,
      ly_do_thoi_viec: item.ly_do_thoi_viec || null,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      raw_data: item,
    };
  }

  private toTuanTraRow(item: NhatKyTuanTra) {
    return {
      id: item.id,
      ngay_tuan_tra: item.ngay_tuan_tra,
      ca_tuan_tra: item.ca_tuan_tra,
      so_cuoc_cong_khai: Number(item.so_cuoc_cong_khai) || 0,
      so_cuoc_mat_phuc: Number(item.so_cuoc_mat_phuc) || 0,
      tong_so_cuoc: Number(item.tong_so_cuoc) || 0,
      so_luot_thanh_vien: Number(item.so_luot_thanh_vien) || 0,
      can_bo_cong_an_phu_trach: item.can_bo_cong_an_phu_trach || '',
      tuyen_duong_dia_ban: item.tuyen_duong_dia_ban || '',
      so_vu_viec_giai_quyet: Number(item.so_vu_viec_giai_quyet) || 0,
      noi_dung_phoi_hop: item.noi_dung_phoi_hop || '',
      ket_qua_noi_bat: item.ket_qua_noi_bat || null,
      nguoi_ghi_so: item.nguoi_ghi_so || '',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      raw_data: item,
    };
  }

  private toTapHuanRow(item: DotTapHuan) {
    return {
      id: item.id,
      ten_dot: item.ten_dot,
      chuyen_de: item.chuyen_de || '',
      thoi_gian_bat_dau: item.thoi_gian_bat_dau || '',
      thoi_gian_ket_thuc: item.thoi_gian_ket_thuc || '',
      dia_diem: item.dia_diem || '',
      don_vi_to_chuc: item.don_vi_to_chuc || '',
      so_lop: Number(item.so_lop) || 1,
      so_thanh_vien_tham_gia: Number(item.so_thanh_vien_tham_gia) || 0,
      noi_dung_tap_huan: item.noi_dung_tap_huan || '',
      kinh_phi_ho_tro: Number(item.kinh_phi_ho_tro) || 0,
      trang_thai: item.trang_thai || 'ke_hoach',
      nguoi_nhap: item.nguoi_nhap || '',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      raw_data: item,
    };
  }

  private toKhenThuongRow(item: HoSoKhenThuong) {
    return {
      id: item.id,
      loai_khen_thuong: item.loai_khen_thuong,
      cap_khen_thuong: item.cap_khen_thuong,
      hinh_thuc: item.hinh_thuc || '',
      ten_nguoi_khen_thuong: item.ten_nguoi_khen_thuong || null,
      thanh_vien_id: item.thanh_vien_id || null,
      to_antt_id: item.to_antt_id || null,
      so_quyet_dinh: item.so_quyet_dinh || '',
      ngay_quyet_dinh: item.ngay_quyet_dinh || '',
      co_quan_ban_hanh: item.co_quan_ban_hanh || '',
      ly_do_khen_thuong: item.ly_do_khen_thuong || '',
      tien_thuong: Number(item.tien_thuong) || 0,
      nam_khen_thuong: Number(item.nam_khen_thuong) || new Date().getFullYear(),
      nguoi_nhap: item.nguoi_nhap || '',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      raw_data: item,
    };
  }

  toUserRow(item: UserAccount) {
    // Tuyệt đối không gửi mật khẩu hoặc bản băm mật khẩu vào public.users hay raw_data.
    // Không tự lấy ngày hiện tại thay cho ngày tạo bị thiếu.
    const clean = this.fromUserRow(item);
    const hasValidCreatedAt =
      typeof clean.createdAt === 'string' &&
      clean.createdAt.trim() !== '' &&
      !Number.isNaN(new Date(clean.createdAt.trim()).getTime());
    const validCreatedAt = hasValidCreatedAt ? clean.createdAt.trim() : null;

    const safeRawData: Record<string, any> = {
      id: clean.id,
      username: clean.username,
      ...(clean.email ? { email: clean.email } : {}),
      fullName: clean.fullName,
      role: clean.role,
      chucVu: clean.chucVu,
      donVi: clean.donVi,
      soDienThoai: clean.soDienThoai || '',
      ...(validCreatedAt ? { createdAt: validCreatedAt } : {}),
      ...(clean.lastLoginAt ? { lastLoginAt: clean.lastLoginAt } : {}),
    };

    return {
      id: clean.id,
      username: clean.username,
      full_name: clean.fullName,
      role: clean.role,
      chuc_vu: clean.chucVu,
      don_vi: clean.donVi,
      so_dien_thoai: clean.soDienThoai || null,
      created_at: validCreatedAt,
      updated_at: new Date().toISOString(),
      raw_data: safeRawData,
    };
  }

  private toAuditLogRow(item: AuditLog) {
    return {
      id: item.id,
      user_id: item.user_id,
      user_name: item.user_name,
      user_role: item.user_role,
      thoi_gian: item.thoi_gian,
      hanh_dong: item.hanh_dong,
      doi_tuong: item.doi_tuong,
      noi_dung_thay_doi: item.noi_dung_thay_doi,
      raw_data: item,
    };
  }

  // --- PENDING SYNC QUEUE & TOMBSTONES (ĐẢM BẢO XÓA / CẬP NHẬT KHÔNG BAO GIỜ BỊ PHỤC HỒI NHẦM KHI F5 TRANG) ---
  private readonly PENDING_SYNC_KEY = 'ca_laivung_antt_pending_sync_v1';
  private syncQueue: Promise<void> = Promise.resolve();

  private enqueueSync(task: () => Promise<void>): Promise<void> {
    const generation = sessionDataCache.generation;
    this.syncQueue = this.syncQueue.then(async () => {
      if (generation !== sessionDataCache.generation) return;
      await task();
    }).catch(err => {
      console.warn('Lỗi trong hàng đợi đồng bộ Supabase:', err);
    });
    return this.syncQueue;
  }

  private getPendingSync(): {
    hardDeletedIds: string[];
    softDeletedMap: Record<string, string>;
    deletedTombstones: Record<string, string>;
    softDeletedTombstones: Record<string, string>;
    clearAllPending: boolean;
  } {
    try {
      const raw = sessionDataCache.getItem(this.PENDING_SYNC_KEY);
      if (!raw) {
        return {
          hardDeletedIds: [],
          softDeletedMap: {},
          deletedTombstones: {},
          softDeletedTombstones: {},
          clearAllPending: false,
        };
      }
      const parsed = JSON.parse(raw);
      return {
        hardDeletedIds: Array.isArray(parsed.hardDeletedIds) ? parsed.hardDeletedIds : [],
        softDeletedMap:
          parsed.softDeletedMap && typeof parsed.softDeletedMap === 'object' ? parsed.softDeletedMap : {},
        deletedTombstones:
          parsed.deletedTombstones && typeof parsed.deletedTombstones === 'object'
            ? parsed.deletedTombstones
            : {},
        softDeletedTombstones:
          parsed.softDeletedTombstones && typeof parsed.softDeletedTombstones === 'object'
            ? parsed.softDeletedTombstones
            : {},
        clearAllPending: Boolean(parsed.clearAllPending),
      };
    } catch {
      return {
        hardDeletedIds: [],
        softDeletedMap: {},
        deletedTombstones: {},
        softDeletedTombstones: {},
        clearAllPending: false,
      };
    }
  }

  private savePendingSync(state: {
    hardDeletedIds: string[];
    softDeletedMap: Record<string, string>;
    deletedTombstones: Record<string, string>;
    softDeletedTombstones: Record<string, string>;
    clearAllPending: boolean;
  }): void {
    try {
      sessionDataCache.setItem(this.PENDING_SYNC_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Không thể lưu trạng thái pending sync:', e);
    }
  }

  private markPendingHardDelete(id: string): void {
    const p = this.getPendingSync();
    if (!p.hardDeletedIds.includes(id)) {
      p.hardDeletedIds.push(id);
    }
    p.deletedTombstones[id] = new Date().toISOString();
    delete p.softDeletedMap[id];
    delete p.softDeletedTombstones[id];
    this.savePendingSync(p);
  }

  private clearPendingHardDelete(id: string, removeTombstone = false): void {
    const p = this.getPendingSync();
    p.hardDeletedIds = p.hardDeletedIds.filter(x => x !== id);
    if (removeTombstone) {
      delete p.deletedTombstones[id];
    }
    this.savePendingSync(p);
  }

  private markPendingSoftDelete(id: string, deletedAt: string): void {
    const p = this.getPendingSync();
    p.softDeletedMap[id] = deletedAt;
    p.softDeletedTombstones[id] = deletedAt;
    this.savePendingSync(p);
  }

  private clearPendingSoftDelete(id: string, removeTombstone = false): void {
    const p = this.getPendingSync();
    delete p.softDeletedMap[id];
    if (removeTombstone) {
      delete p.softDeletedTombstones[id];
    }
    this.savePendingSync(p);
  }

  // --- BACKGROUND SYNC HELPERS ---
  private bgUpsert(table: string, rows: any | any[]): Promise<void> {
    if (this.syncStatus === 'connected_missing_tables') return Promise.resolve();
    return this.enqueueSync(async () => {
      try {
        let payload = Array.isArray(rows) ? rows : [rows];
        if (payload.length === 0) return;

        // Bảo vệ chống ghi đè ngược bản ghi đã xóa khi ảnh chân dung lớn tải lên chậm hơn lệnh xóa
        if (table === SUPABASE_TABLES.NHAN_SU) {
          const pending = this.getPendingSync();
          if (pending.clearAllPending) return;
          payload = payload
            .filter(r => !pending.hardDeletedIds.includes(r.id) && !pending.deletedTombstones[r.id])
            .map(r => {
              const softAt = pending.softDeletedMap[r.id] || pending.softDeletedTombstones[r.id];
              if (softAt) {
                return {
                  ...r,
                  trang_thai: 'da_xoa',
                  updated_at: softAt,
                  raw_data: r.raw_data ? { ...r.raw_data, trang_thai: 'da_xoa', deleted_at: softAt, updated_at: softAt } : r.raw_data,
                };
              }
              return r;
            });
          if (payload.length === 0) return;
        }

        const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
        if (error) {
          if (
            error.code === '42P01' ||
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')
          ) {
            this.notifyStatus(
              'connected_missing_tables',
              'Đã kết nối Supabase nhưng chưa khởi tạo bảng SQL'
            );
          } else {
            console.warn(`Lỗi đồng bộ lên bảng Supabase [${table}]:`, error.message);
          }
        } else {
          this.notifyStatus('connected_ready', 'Đã đồng bộ dữ liệu với đám mây Supabase');
        }
      } catch (err) {
        console.warn(`Lỗi kết nối mạng khi đồng bộ bảng [${table}]:`, err);
      }
    });
  }

  private bgDelete(table: string, id: string): Promise<void> {
    if (this.syncStatus === 'connected_missing_tables') return Promise.resolve();
    return this.enqueueSync(async () => {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (!error) {
          if (table === SUPABASE_TABLES.NHAN_SU) {
            this.clearPendingHardDelete(id, false);
          }
          this.notifyStatus('connected_ready', 'Đã đồng bộ xóa dữ liệu trên Supabase');
        }
      } catch (err) {
        console.warn(`Lỗi xóa bản ghi trên Supabase [${table}]:`, err);
      }
    });
  }

  private async flushPendingSyncToSupabase(): Promise<void> {
    await this.syncQueue;
    const p = this.getPendingSync();
    try {
      if (p.clearAllPending) {
        const { error } = await supabase.from(SUPABASE_TABLES.NHAN_SU).delete().neq('id', '__none__');
        if (!error) {
          p.clearAllPending = false;
          p.hardDeletedIds = [];
          p.softDeletedMap = {};
          this.savePendingSync(p);
        }
      }

      const allHardDeleteIds = Array.from(
        new Set([...p.hardDeletedIds, ...Object.keys(p.deletedTombstones)])
      );
      if (allHardDeleteIds.length > 0) {
        const { error } = await supabase
          .from(SUPABASE_TABLES.NHAN_SU)
          .delete()
          .in('id', allHardDeleteIds);
        if (!error) {
          const current = this.getPendingSync();
          current.hardDeletedIds = current.hardDeletedIds.filter(id => !allHardDeleteIds.includes(id));
          this.savePendingSync(current);
        }
      }

      const softEntries = Object.entries({ ...p.softDeletedTombstones, ...p.softDeletedMap });
      if (softEntries.length > 0) {
        const localRawList = this.getAllNhanSuRaw();
        for (const [id, deletedAt] of softEntries) {
          const localItem = localRawList.find(m => m.id === id);
          const updatePayload: Record<string, any> = {
            trang_thai: 'da_xoa',
            updated_at: deletedAt,
          };
          if (localItem) {
            updatePayload.raw_data = {
              ...localItem,
              trang_thai: 'da_xoa',
              deleted_at: deletedAt,
              updated_at: deletedAt,
            };
          }
          const { error } = await supabase
            .from(SUPABASE_TABLES.NHAN_SU)
            .update(updatePayload)
            .eq('id', id);
          if (!error) {
            this.clearPendingSoftDelete(id, false);
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi đồng bộ các thao tác xóa đang chờ:', e);
    }
  }

  // --- CHECK & INITIALIZE SUPABASE ---
  async checkSupabaseConnection(): Promise<SupabaseConnectionReport> {
    this.notifyStatus('checking', 'Đang kiểm tra kết nối máy chủ Supabase...');
    try {
      const { count: nhanSuCount, error: nsError } = await supabase
        .from(SUPABASE_TABLES.NHAN_SU)
        .select('*', { count: 'exact', head: true });

      if (nsError) {
        const isMissingTable =
          nsError.code === '42P01' ||
          nsError.code === 'PGRST205' ||
          nsError.message?.includes('does not exist') ||
          nsError.message?.includes('Could not find the table') ||
          nsError.message?.includes('schema cache');

        if (isMissingTable) {
          this.notifyStatus(
            'connected_missing_tables',
            'Đã kết nối máy chủ Supabase — Cần chạy lệnh SQL khởi tạo bảng'
          );
          return {
            status: 'connected_missing_tables',
            message: 'Đã kết nối đúng Project Supabase (vupxyirmjjaruipruowu), nhưng chưa tạo các bảng dữ liệu. Vui lòng copy mã SQL bên dưới và nhấn RUN trong SQL Editor của Supabase.',
            projectUrl: SUPABASE_URL,
            errorDetail: nsError.message,
          };
        }

        this.notifyStatus('error', `Lỗi truy cập Supabase: ${nsError.message}`);
        return {
          status: 'error',
          message: `Không thể truy vấn bảng trên Supabase: ${nsError.message}`,
          projectUrl: SUPABASE_URL,
          errorDetail: nsError.message,
        };
      }

      const [
        { count: diaBanCount },
        { count: toCount },
        { count: tuanTraCount },
        { count: tapHuanCount },
        { count: khenThuongCount },
      ] = await Promise.all([
        supabase.from(SUPABASE_TABLES.DIA_BAN).select('*', { count: 'exact', head: true }),
        supabase.from(SUPABASE_TABLES.TO_ANTT).select('*', { count: 'exact', head: true }),
        supabase.from(SUPABASE_TABLES.TUAN_TRA).select('*', { count: 'exact', head: true }),
        supabase.from(SUPABASE_TABLES.TAP_HUAN).select('*', { count: 'exact', head: true }),
        supabase.from(SUPABASE_TABLES.KHEN_THUONG).select('*', { count: 'exact', head: true }),
      ]);

      this.notifyStatus('connected_ready', 'Đang kết nối trực tuyến với Supabase');

      return {
        status: 'connected_ready',
        message: 'Kết nối Supabase hoàn tất và các bảng dữ liệu đã sẵn sàng hoạt động!',
        projectUrl: SUPABASE_URL,
        lastSyncAt: this.lastSyncAt,
        tableCounts: {
          nhan_su: nhanSuCount || 0,
          dia_ban_ap: diaBanCount || 0,
          to_antt: toCount || 0,
          nhat_ky_tuan_tra: tuanTraCount || 0,
          dot_tap_huan: tapHuanCount || 0,
          ho_so_khen_thuong: khenThuongCount || 0,
        },
      };
    } catch (err: any) {
      const msg = err?.message || 'Lỗi mạng không xác định';
      this.notifyStatus('error', `Lỗi kết nối Supabase: ${msg}`);
      return {
        status: 'error',
        message: `Không thể kết nối tới Supabase: ${msg}`,
        projectUrl: SUPABASE_URL,
        errorDetail: msg,
      };
    }
  }

  // --- PULL ALL DATA FROM SUPABASE ---
  async pullFromSupabase(): Promise<{
    success: boolean;
    message: string;
    missingTables?: boolean;
  }> {
    const generation = sessionDataCache.generation;
    this.notifyStatus('syncing', 'Đang tải dữ liệu từ đám mây Supabase...');
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user || generation !== sessionDataCache.generation) {
        return { success: false, message: 'Cần đăng nhập để tải dữ liệu.' };
      }
      // 1. Thực thi dứt điểm các thao tác xóa/cập nhật còn đang chờ (nếu người dùng vừa bấm Xóa rồi tải lại trang ngay)
      await this.flushPendingSyncToSupabase();

      const { data: nsData, error: nsErr } = await supabase
        .from(SUPABASE_TABLES.NHAN_SU)
        .select('*')
        .order('stt', { ascending: true });

      if (generation !== sessionDataCache.generation) return { success: false, message: 'Phiên đã kết thúc.' };
      if (nsErr) {
        const isMissing =
          nsErr.code === '42P01' ||
          nsErr.code === 'PGRST205' ||
          nsErr.message?.includes('does not exist') ||
          nsErr.message?.includes('Could not find the table') ||
          nsErr.message?.includes('schema cache');

        if (isMissing) {
          this.notifyStatus(
            'connected_missing_tables',
            'Đã kết nối Supabase — Cần chạy SQL tạo bảng lần đầu'
          );
          return {
            success: false,
            missingTables: true,
            message: 'Các bảng dữ liệu chưa được tạo trên Supabase. Hãy mở mục Sao lưu & Kết nối Supabase để lấy mã SQL khởi tạo bảng.',
          };
        }
        this.notifyStatus('error', `Lỗi tải dữ liệu: ${nsErr.message}`);
        return { success: false, message: nsErr.message };
      }

      const [
        { data: dbData },
        { data: toData },
        { data: ttData },
        { data: thData },
        { data: ktData },
        { data: usrData, error: usrErr },
        { data: logData },
      ] = await Promise.all([
        supabase.from(SUPABASE_TABLES.DIA_BAN).select('*'),
        supabase.from(SUPABASE_TABLES.TO_ANTT).select('*'),
        supabase.from(SUPABASE_TABLES.TUAN_TRA).select('*'),
        supabase.from(SUPABASE_TABLES.TAP_HUAN).select('*'),
        supabase.from(SUPABASE_TABLES.KHEN_THUONG).select('*'),
        supabase.from(SUPABASE_TABLES.USERS).select('id, username, full_name, role, chuc_vu, don_vi, so_dien_thoai, created_at, raw_data'),
        supabase.from(SUPABASE_TABLES.AUDIT_LOGS).select('*').order('thoi_gian', { ascending: false }).limit(500),
      ]);

      if (generation !== sessionDataCache.generation) return { success: false, message: 'Phiên đã kết thúc.' };

      // 2. Đồng bộ từng bảng danh mục độc lập (KHÔNG tự động đẩy lại nhan_su cũ từ localStorage khi bảng nhan_su trên Supabase đã xóa hết về 0)
      if (dbData && dbData.length > 0) {
        const list = dbData.map(r => this.fromDbRow<DiaBanAp>(r));
        sessionDataCache.setItem(STORAGE_KEYS.DIA_BAN, JSON.stringify(list));
      } else if (dbData) {
        sessionDataCache.setItem(STORAGE_KEYS.DIA_BAN, '[]');
      }

      if (toData && toData.length > 0) {
        const list = toData.map(r => this.fromDbRow<ToANTT>(r));
        sessionDataCache.setItem(STORAGE_KEYS.TO_ANTT, JSON.stringify(list));
      } else if (toData) {
        sessionDataCache.setItem(STORAGE_KEYS.TO_ANTT, '[]');
      }

      if (nsData !== null && nsData !== undefined) {
        const pending = this.getPendingSync();
        if (pending.clearAllPending) {
          this.setNhanSuListLocalOnly([]);
        } else {
          const orphanZombieIds: string[] = [];
          const list = nsData
            .map(r => this.fromDbRow<NhanSu>(r))
            .filter(item => {
              const isHardDeleted =
                pending.hardDeletedIds.includes(item.id) || Boolean(pending.deletedTombstones[item.id]);
              if (isHardDeleted) {
                orphanZombieIds.push(item.id);
                return false;
              }
              return true;
            })
            .map(item => {
              const softDeletedAt =
                pending.softDeletedMap[item.id] || pending.softDeletedTombstones[item.id];
              if (softDeletedAt) {
                return {
                  ...item,
                  trang_thai: 'da_xoa' as const,
                  deleted_at: softDeletedAt,
                  updated_at: softDeletedAt,
                };
              }
              return item;
            });

          if (orphanZombieIds.length > 0) {
            void supabase.from(SUPABASE_TABLES.NHAN_SU).delete().in('id', orphanZombieIds);
          }

          // Tự động gộp 19 đồng chí chính thức từ biểu mẫu văn bản nếu CSDL Supabase chưa có đủ
          const { mergedList, newlyAddedCount, toUpsert } = mergeOfficial19Members(list);
          this.setNhanSuListLocalOnly(mergedList);

          if (newlyAddedCount > 0 && toUpsert.length > 0) {
            void this.bgUpsert(SUPABASE_TABLES.NHAN_SU, toUpsert.map(m => this.toNhanSuRow(m)));
          }
        }
      }

      if (ttData) {
        const list = ttData.map(r => this.fromDbRow<NhatKyTuanTra>(r));
        sessionDataCache.setItem(STORAGE_KEYS.TUAN_TRA, JSON.stringify(list));
      }
      if (thData) {
        const list = thData.map(r => this.fromDbRow<DotTapHuan>(r));
        sessionDataCache.setItem(STORAGE_KEYS.TAP_HUAN, JSON.stringify(list));
      }
      if (ktData) {
        const list = ktData.map(r => this.fromDbRow<HoSoKhenThuong>(r));
        sessionDataCache.setItem(STORAGE_KEYS.KHEN_THUONG, JSON.stringify(list));
      }

      // 3. Ánh xạ danh sách tài khoản bằng fromUserRow().
      // Khi tải danh sách users lỗi hoặc rỗng, TUYỆT ĐỐI KHÔNG tự đẩy danh sách tài khoản cũ từ localStorage lên Supabase.
      if (usrErr) {
        this.lastUsersError = usrErr.message;
        console.warn('Lỗi tải bảng public.users từ Supabase:', usrErr.message);
      } else {
        this.lastUsersError = null;
        const list = (usrData || []).map(r => this.fromUserRow(r));
        sessionDataCache.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));

        const activeUser = this.getCurrentUser();
        if (activeUser) {
          const matchedSelf = list.find(u => u.id === activeUser.id);
          if (matchedSelf) {
            this.setCurrentUser({
              ...matchedSelf,
              email: matchedSelf.email || activeUser.email,
              lastLoginAt: activeUser.lastLoginAt || matchedSelf.lastLoginAt,
            });
          }
        }
      }

      if (logData) {
        const list = logData.map(r => this.fromDbRow<AuditLog>(r));
        sessionDataCache.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(list));
      }

      if (usrErr) {
        const errMsg = `Lỗi truy vấn bảng users trên Supabase: ${usrErr.message}`;
        this.notifyStatus('error', errMsg);
        this.notifyDataRefresh();
        return {
          success: false,
          message: errMsg,
        };
      }

      this.notifyStatus('connected_ready', 'Đã đồng bộ dữ liệu mới nhất từ Supabase');
      this.notifyDataRefresh();

      return {
        success: true,
        message: `Đã tải thành công dữ liệu từ Supabase (${nsData?.length || 0} hồ sơ nhân sự, ${dbData?.length || 19} ấp, ${toData?.length || 19} tổ ANTT).`,
      };
    } catch (err: any) {
      const msg = err?.message || 'Lỗi mạng khi tải dữ liệu từ Supabase';
      this.notifyStatus('error', msg);
      return { success: false, message: msg };
    }
  }

  // --- PUSH ALL LOCAL DATA TO SUPABASE ---
  async pushAllToSupabase(): Promise<{
    success: boolean;
    message: string;
    counts?: Record<string, number>;
  }> {
    this.notifyStatus('syncing', 'Đang đẩy toàn bộ dữ liệu lên Supabase...');
    try {
      const diaBan = this.getDiaBanList().map(x => this.toDiaBanRow(x));
      const toANTT = this.getToANTTList().map(x => this.toToANTTRow(x));
      const nhanSu = this.getAllNhanSuRaw().map(x => this.toNhanSuRow(x));
      const tuanTra = this.getNhatKyTuanTraList().map(x => this.toTuanTraRow(x));
      const tapHuan = this.getDotTapHuanList().map(x => this.toTapHuanRow(x));
      const khenThuong = this.getHoSoKhenThuongList().map(x => this.toKhenThuongRow(x));

      const results = await Promise.all([
        diaBan.length > 0 ? supabase.from(SUPABASE_TABLES.DIA_BAN).upsert(diaBan, { onConflict: 'id' }) : Promise.resolve({ error: null }),
        toANTT.length > 0 ? supabase.from(SUPABASE_TABLES.TO_ANTT).upsert(toANTT, { onConflict: 'id' }) : Promise.resolve({ error: null }),
        nhanSu.length > 0 ? supabase.from(SUPABASE_TABLES.NHAN_SU).upsert(nhanSu, { onConflict: 'id' }) : Promise.resolve({ error: null }),
        tuanTra.length > 0 ? supabase.from(SUPABASE_TABLES.TUAN_TRA).upsert(tuanTra, { onConflict: 'id' }) : Promise.resolve({ error: null }),
        tapHuan.length > 0 ? supabase.from(SUPABASE_TABLES.TAP_HUAN).upsert(tapHuan, { onConflict: 'id' }) : Promise.resolve({ error: null }),
        khenThuong.length > 0 ? supabase.from(SUPABASE_TABLES.KHEN_THUONG).upsert(khenThuong, { onConflict: 'id' }) : Promise.resolve({ error: null }),
      ]);

      const firstErr = results.find(r => r.error)?.error;
      if (firstErr) {
        const isMissing =
          firstErr.code === '42P01' ||
          firstErr.code === 'PGRST205' ||
          firstErr.message?.includes('does not exist') ||
          firstErr.message?.includes('Could not find the table') ||
          firstErr.message?.includes('schema cache');

        if (isMissing) {
          this.notifyStatus('connected_missing_tables', 'Chưa tạo bảng trên Supabase');
          return {
            success: false,
            message: 'Chưa thể đẩy dữ liệu vì trên Supabase chưa tạo bảng. Vui lòng copy mã SQL bên dưới và chạy trong SQL Editor của Supabase trước.',
          };
        }

        this.notifyStatus('error', `Lỗi đồng bộ: ${firstErr.message}`);
        return {
          success: false,
          message: `Lỗi từ Supabase: ${firstErr.message}`,
        };
      }

      this.notifyStatus('connected_ready', 'Đã đồng bộ 100% dữ liệu lên Supabase');
      return {
        success: true,
        message: `Đã đẩy thành công toàn bộ dữ liệu lên Supabase (${nhanSu.length} nhân sự, ${diaBan.length} ấp, ${toANTT.length} tổ ANTT, ${tuanTra.length} ca tuần tra, ${tapHuan.length} đợt tập huấn, ${khenThuong.length} hồ sơ khen thưởng).`,
        counts: {
          nhan_su: nhanSu.length,
          dia_ban_ap: diaBan.length,
          to_antt: toANTT.length,
          nhat_ky_tuan_tra: tuanTra.length,
          dot_tap_huan: tapHuan.length,
          ho_so_khen_thuong: khenThuong.length,
        },
      };
    } catch (err: any) {
      const msg = err?.message || 'Lỗi không xác định khi đẩy dữ liệu lên Supabase';
      this.notifyStatus('error', msg);
      return { success: false, message: msg };
    }
  }

  private initSystemAndEnforceAdmin(): void {
    removeLegacyBusinessData();
  }

  clearSessionData(): void {
    sessionDataCache.clear();
    this.lastUsersError = null;
    this.lastSyncAt = undefined;
    this.notifyStatus('checking', 'Cần đăng nhập để tải dữ liệu');
    this.notifyDataRefresh();
  }

  // --- USERS & AUTH ---
  // Yêu cầu 4: Tài khoản thường chỉ được xem hồ sơ của mình; ADMIN được quản lý danh sách.
  getUsers(caller?: UserAccount): UserAccount[] {
    const raw = sessionDataCache.getItem(STORAGE_KEYS.USERS);
    let users: any[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        users = Array.isArray(parsed) ? parsed : [];
      } catch {
        users = [];
      }
    }
    // Ánh xạ chuẩn qua fromUserRow (đảm bảo tên trường camelCase và loại bỏ mọi trường mật khẩu)
    const cleanUsers = users.map(u => this.fromUserRow(u));

    const activeUser = caller !== undefined ? caller : this.getCurrentUser();
    // Nếu không phải ADMIN, chỉ được xem hồ sơ của chính mình
    if (activeUser && activeUser.role !== 'ADMIN') {
      return cleanUsers.filter(
        u => u.id === activeUser.id || (activeUser.username && u.username.toLowerCase() === activeUser.username.toLowerCase())
      );
    }

    return cleanUsers;
  }

  setUsers(users: UserAccount[]): void {
    // Chuẩn hóa và loại bỏ toàn bộ thông tin mật khẩu trước khi lưu trữ cục bộ
    const safeUsers = users.map(u => this.fromUserRow(u));
    sessionDataCache.setItem(STORAGE_KEYS.USERS, JSON.stringify(safeUsers));
  }

  async fetchUsersFromSupabase(caller?: UserAccount): Promise<{
    success: boolean;
    users: UserAccount[];
    error?: string;
  }> {
    const generation = sessionDataCache.generation;
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.USERS)
        .select('id, username, full_name, role, chuc_vu, don_vi, so_dien_thoai, created_at, raw_data')
        .order('created_at', { ascending: true });

      if (generation !== sessionDataCache.generation) return { success: false, users: [], error: 'Phiên đã kết thúc.' };
      if (error) {
        // Khi tải danh sách users lỗi, không tự đẩy danh sách tài khoản cũ từ localStorage lên Supabase
        this.lastUsersError = error.message;
        return {
          success: false,
          users: this.getUsers(caller),
          error: error.message,
        };
      }

      this.lastUsersError = null;
      const mappedUsers = (data || []).map(r => this.fromUserRow(r));
      sessionDataCache.setItem(STORAGE_KEYS.USERS, JSON.stringify(mappedUsers));

      const activeUser = caller || this.getCurrentUser();
      if (activeUser) {
        const matchedSelf = mappedUsers.find(u => u.id === activeUser.id);
        if (matchedSelf) {
          this.setCurrentUser({
            ...matchedSelf,
            email: matchedSelf.email || activeUser.email,
            lastLoginAt: activeUser.lastLoginAt || matchedSelf.lastLoginAt,
          });
        }
      }

      this.notifyDataRefresh();
      return {
        success: true,
        users: this.getUsers(caller),
      };
    } catch (err: any) {
      const errMsg = err?.message || 'Lỗi mạng khi truy vấn danh sách tài khoản từ Supabase.';
      this.lastUsersError = errMsg;
      return {
        success: false,
        users: this.getUsers(caller),
        error: errMsg,
      };
    }
  }

  getCurrentUser(): UserAccount | null {
    if (typeof window === 'undefined') return null;
    const raw = sessionDataCache.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return this.fromUserRow(parsed);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: UserAccount | null): void {
    if (typeof window === 'undefined') return;
    if (user) {
      const safeUser = this.fromUserRow(user);
      sessionDataCache.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    } else {
      sessionDataCache.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  async registerUser(params: {
    username: string;
    email?: string;
    password: string;
    fullName: string;
    role?: UserRole;
    chucVu?: string;
    donVi?: string;
    soDienThoai?: string;
  }): Promise<{ success: boolean; error?: string; user?: UserAccount; requireEmailConfirmation?: boolean }> {
    const rawUsername = (params.username || '').trim();
    if (!rawUsername) {
      return { success: false, error: 'Vui lòng nhập tên đăng nhập.' };
    }
    if (rawUsername.length < 3) {
      return { success: false, error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' };
    }
    if (/\s/.test(rawUsername)) {
      return { success: false, error: 'Tên đăng nhập không được chứa khoảng trắng (viết liền không dấu).' };
    }
    if (!params.password || params.password.length < 6) {
      return { success: false, error: 'Mật khẩu phải có tối thiểu 6 ký tự để bảo đảm an toàn.' };
    }
    if (!params.fullName || !params.fullName.trim()) {
      return { success: false, error: 'Vui lòng nhập họ và tên cán bộ.' };
    }

    // YÊU CẦU 1: Người đăng ký mới LUÔN LUÔN là VIEWER. Không lấy quyền từ raw_user_meta_data và không cho tài khoản đầu tiên tự nhận ADMIN.
    const safeRole: UserRole = 'VIEWER';
    const cleanUsername = rawUsername.toLowerCase();
    const cleanFullName = params.fullName.trim();
    const cleanChucVu = params.chucVu?.trim() || 'Cán bộ cơ sở';
    const cleanDonVi = params.donVi?.trim() || 'Công an xã Lai Vung';
    const cleanPhone = params.soDienThoai?.trim() || '';

    // Chuẩn hóa email xác thực qua Supabase Auth
    let email = params.email?.trim() || '';
    if (!email) {
      email = `${cleanUsername}@laivung.antt.local`;
    }

    try {
      // 1. Tạo tài khoản người dùng qua Supabase Auth (Mật khẩu được mã hóa an toàn trên máy chủ Supabase Auth)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: params.password,
        options: {
          data: {
            username: cleanUsername,
            full_name: cleanFullName,
            role: 'VIEWER', // Luôn luôn cố định là VIEWER
            chuc_vu: cleanChucVu,
            don_vi: cleanDonVi,
            so_dien_thoai: cleanPhone,
          },
        },
      });

      if (authError) {
        return {
          success: false,
          error: authError.message || 'Không thể đăng ký tài khoản với Supabase Auth.',
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Không nhận được phản hồi tài khoản từ máy chủ Supabase Auth.',
        };
      }

      const userId = authData.user.id;
      const authCreatedAt = authData.user.created_at || '';

      const draftUser: UserAccount = this.fromUserRow(
        {
          id: userId,
          username: cleanUsername,
          full_name: cleanFullName,
          role: safeRole,
          chuc_vu: cleanChucVu,
          don_vi: cleanDonVi,
          so_dien_thoai: cleanPhone,
          created_at: authCreatedAt,
        },
        { email }
      );

      // 2. Lưu hồ sơ cán bộ vào bảng public.users (Tuyệt đối không gửi mật khẩu hay bản băm)
      const userRow = this.toUserRow(draftUser);
      const { data: savedRow, error: dbErr } = await supabase
        .from(SUPABASE_TABLES.USERS)
        .upsert(userRow, { onConflict: 'id' })
        .select('id, username, full_name, role, chuc_vu, don_vi, so_dien_thoai, created_at, raw_data')
        .maybeSingle();

      if (dbErr) {
        console.warn('Lưu hồ sơ vào public.users báo lỗi (trigger auth có thể đã tự tạo):', dbErr.message);
      }

      const newUser = this.fromUserRow(savedRow || userRow, draftUser);

      // 3. Cập nhật danh sách tài khoản cục bộ
      const rawUsers = sessionDataCache.getItem(STORAGE_KEYS.USERS);
      let allUsers: UserAccount[] = [];
      if (rawUsers) {
        try {
          const parsed = JSON.parse(rawUsers);
          allUsers = Array.isArray(parsed) ? parsed.map(u => this.fromUserRow(u)) : [];
        } catch {
          allUsers = [];
        }
      }
      const updatedUsers = [
        ...allUsers.filter(u => u.id !== newUser.id && u.username.toLowerCase() !== cleanUsername),
        newUser,
      ];
      sessionDataCache.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

      // 4. Ghi nhật ký hệ thống (KHÔNG bao giờ chứa mật khẩu)
      this.addAuditLog(
        newUser,
        'THEM_MOI',
        `Tài khoản: ${newUser.username} (${newUser.fullName})`,
        `Đăng ký tài khoản cán bộ thành công qua Supabase Auth với vai trò ${newUser.role} - Đơn vị: ${newUser.donVi}`
      );

      const requireEmailConfirmation = !authData.session && Boolean(authData.user);

      return {
        success: true,
        user: newUser,
        requireEmailConfirmation,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Có lỗi xảy ra khi tạo tài khoản xác thực Supabase Auth.',
      };
    }
  }

  // Yêu cầu 2: Chỉ quản trị viên được thay đổi role của người khác. Người dùng thường không được đổi role hoặc id của mình.
  async updateUserRole(
    targetUserId: string,
    newRole: UserRole,
    caller?: UserAccount
  ): Promise<{ success: boolean; error?: string }> {
    const activeUser = caller || this.getCurrentUser();
    if (!activeUser || activeUser.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Chỉ Quản trị viên (ADMIN) mới có quyền thay đổi vai trò (role) của tài khoản khác.',
      };
    }

    try {
      const now = new Date().toISOString();
      const { data: updatedRow, error } = await supabase
        .from(SUPABASE_TABLES.USERS)
        .update({ role: newRole, updated_at: now })
        .eq('id', targetUserId)
        .select('id, username, full_name, role, chuc_vu, don_vi, so_dien_thoai, created_at, raw_data')
        .maybeSingle();

      if (error) {
        return { success: false, error: error.message };
      }

      const raw = sessionDataCache.getItem(STORAGE_KEYS.USERS);
      let allUsers: UserAccount[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          allUsers = Array.isArray(parsed) ? parsed.map(u => this.fromUserRow(u)) : [];
        } catch {
          allUsers = [];
        }
      }
      const updated = allUsers.map(u => {
        if (u.id === targetUserId) {
          return updatedRow ? this.fromUserRow(updatedRow, u) : { ...u, role: newRole };
        }
        return u;
      });
      sessionDataCache.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));

      this.addAuditLog(
        activeUser,
        'CHINH_SUA',
        `Phân quyền tài khoản ID: ${targetUserId}`,
        `Quản trị viên đã thay đổi vai trò người dùng thành ${newRole}`
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Lỗi khi cập nhật vai trò người dùng' };
    }
  }

  deleteUser(id: string, caller?: UserAccount): { success: boolean; error?: string } {
    const activeUser = caller || this.getCurrentUser();
    if (activeUser && activeUser.role !== 'ADMIN') {
      return { success: false, error: 'Chỉ Quản trị viên (ADMIN) mới có quyền xóa tài khoản.' };
    }
    if (activeUser && activeUser.id === id) {
      return { success: false, error: 'Quản trị viên không thể tự xóa tài khoản của chính mình.' };
    }

    const raw = sessionDataCache.getItem(STORAGE_KEYS.USERS);
    let allUsers: UserAccount[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        allUsers = Array.isArray(parsed) ? parsed.map(u => this.fromUserRow(u)) : [];
      } catch {
        allUsers = [];
      }
    }

    const target = allUsers.find(u => u.id === id);
    if (!target) return { success: false, error: 'Không tìm thấy tài khoản.' };

    const filtered = allUsers.filter(u => u.id !== id);
    sessionDataCache.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    void this.bgDelete(SUPABASE_TABLES.USERS, id);

    this.addAuditLog(
      activeUser,
      'XOA_VINH_VIEN',
      `Tài khoản: ${target.username} (${target.fullName})`,
      'Quản trị viên xóa tài khoản cán bộ khỏi hệ thống'
    );
    return { success: true };
  }

  updateUser(user: UserAccount, caller?: UserAccount): { success: boolean; error?: string } {
    const activeUser = caller || this.getCurrentUser();
    const raw = sessionDataCache.getItem(STORAGE_KEYS.USERS);
    let allUsers: UserAccount[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        allUsers = Array.isArray(parsed) ? parsed.map(u => this.fromUserRow(u)) : [];
      } catch {
        allUsers = [];
      }
    }
    const idx = allUsers.findIndex(u => u.id === user.id);
    if (idx === -1) return { success: false, error: 'Không tìm thấy tài khoản.' };

    const oldUser = allUsers[idx];
    // Yêu cầu 2: Người dùng thường không được đổi role hoặc id của mình
    if (activeUser?.role !== 'ADMIN') {
      if (user.id !== oldUser.id) {
        return { success: false, error: 'Không thể thay đổi ID tài khoản.' };
      }
      if (user.role !== oldUser.role) {
        return { success: false, error: 'Chỉ Quản trị viên (ADMIN) mới có quyền thay đổi vai trò (role).' };
      }
    }

    const safeUser = this.fromUserRow(user, oldUser);
    allUsers[idx] = safeUser;
    sessionDataCache.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
    void this.bgUpsert(SUPABASE_TABLES.USERS, this.toUserRow(safeUser));
    return { success: true };
  }

  async syncUsersToSupabase(): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const users = this.getUsers().map(u => this.toUserRow(u));
      if (users.length === 0) {
        return {
          success: false,
          message: 'Danh sách tài khoản hiện đang rỗng, không có tài khoản nào để đẩy lên Supabase.',
        };
      }
      const { error } = await supabase.from(SUPABASE_TABLES.USERS).upsert(users, { onConflict: 'id' });
      if (error) {
        return { success: false, message: `Lỗi Supabase: ${error.message}` };
      }
      this.notifyStatus('connected_ready', 'Đã đồng bộ tài khoản người dùng lên Supabase');
      return {
        success: true,
        message: `Đã lưu trữ thành công ${users.length} tài khoản (kèm tên đăng nhập) lên bảng users của Supabase!`,
        count: users.length,
      };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Lỗi mạng khi kết nối Supabase' };
    }
  }

  // --- DIA BAN (ẤP) ---
  getDiaBanList(): DiaBanAp[] {
    const raw = sessionDataCache.getItem(STORAGE_KEYS.DIA_BAN);
    if (!raw) {
      sessionDataCache.setItem(STORAGE_KEYS.DIA_BAN, JSON.stringify(INITIAL_DIA_BAN));
      return INITIAL_DIA_BAN;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DIA_BAN;
    }
  }

  setDiaBanList(list: DiaBanAp[]): void {
    sessionDataCache.setItem(STORAGE_KEYS.DIA_BAN, JSON.stringify(list));
    void this.bgUpsert(SUPABASE_TABLES.DIA_BAN, list.map(item => this.toDiaBanRow(item)));
  }

  saveDiaBan(item: DiaBanAp): void {
    const list = this.getDiaBanList();
    const index = list.findIndex(i => i.id === item.id);
    let savedItem: DiaBanAp;
    if (index >= 0) {
      savedItem = { ...item, updated_at: new Date().toISOString() };
      list[index] = savedItem;
    } else {
      savedItem = {
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      list.push(savedItem);
    }
    sessionDataCache.setItem(STORAGE_KEYS.DIA_BAN, JSON.stringify(list));
    void this.bgUpsert(SUPABASE_TABLES.DIA_BAN, this.toDiaBanRow(savedItem));
  }

  deleteDiaBan(id: string): void {
    const list = this.getDiaBanList().filter(i => i.id !== id);
    sessionDataCache.setItem(STORAGE_KEYS.DIA_BAN, JSON.stringify(list));
    void this.bgDelete(SUPABASE_TABLES.DIA_BAN, id);
  }

  // --- TỔ ANTT ---
  getToANTTList(): ToANTT[] {
    const raw = sessionDataCache.getItem(STORAGE_KEYS.TO_ANTT);
    if (!raw) {
      sessionDataCache.setItem(STORAGE_KEYS.TO_ANTT, JSON.stringify(INITIAL_TO_ANTT));
      return INITIAL_TO_ANTT;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TO_ANTT;
    }
  }

  setToANTTList(list: ToANTT[]): void {
    sessionDataCache.setItem(STORAGE_KEYS.TO_ANTT, JSON.stringify(list));
    void this.bgUpsert(SUPABASE_TABLES.TO_ANTT, list.map(item => this.toToANTTRow(item)));
  }

  saveToANTT(item: ToANTT): void {
    const list = this.getToANTTList();
    const index = list.findIndex(i => i.id === item.id);
    let savedItem: ToANTT;
    if (index >= 0) {
      savedItem = { ...item, updated_at: new Date().toISOString() };
      list[index] = savedItem;
    } else {
      savedItem = {
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      list.push(savedItem);
    }
    sessionDataCache.setItem(STORAGE_KEYS.TO_ANTT, JSON.stringify(list));
    void this.bgUpsert(SUPABASE_TABLES.TO_ANTT, this.toToANTTRow(savedItem));
  }

  deleteToANTT(id: string): void {
    const list = this.getToANTTList().filter(i => i.id !== id);
    sessionDataCache.setItem(STORAGE_KEYS.TO_ANTT, JSON.stringify(list));
    void this.bgDelete(SUPABASE_TABLES.TO_ANTT, id);
  }

  // --- NHÂN SỰ ---
  getNhanSuList(includeDeleted = false): NhanSu[] {
    const raw = sessionDataCache.getItem(STORAGE_KEYS.NHAN_SU);
    let list: NhanSu[] = [];
    if (!raw) {
      const merged = mergeOfficial19Members([]);
      this.setNhanSuListLocalOnly(merged.mergedList);
      list = merged.mergedList;
    } else {
      try {
        list = JSON.parse(raw);
        if (!this.getPendingSync().clearAllPending) {
          const { mergedList, newlyAddedCount, toUpsert } = mergeOfficial19Members(list);
          if (newlyAddedCount > 0) {
            list = mergedList;
            this.setNhanSuListLocalOnly(list);
            if (toUpsert.length > 0) {
              void this.bgUpsert(SUPABASE_TABLES.NHAN_SU, toUpsert.map(m => this.toNhanSuRow(m)));
            }
          }
        }
      } catch {
        const merged = mergeOfficial19Members([]);
        this.setNhanSuListLocalOnly(merged.mergedList);
        list = merged.mergedList;
      }
    }
    if (includeDeleted) return list;
    return list.filter(item => item.trang_thai !== 'da_xoa');
  }

  getAllNhanSuRaw(): NhanSu[] {
    return this.getNhanSuList(true);
  }

  private setNhanSuListLocalOnly(list: NhanSu[]): boolean {
    try {
      sessionDataCache.setItem(STORAGE_KEYS.NHAN_SU, JSON.stringify(list));
      return true;
    } catch (e) {
      console.warn('Cảnh báo bộ nhớ trình duyệt đầy, tiến hành tối ưu hóa lưu trữ:', e);
      try {
        const optimizedList = list.map(m => {
          if (m.anh_chan_dung && m.anh_chan_dung.length > 500000) {
            return { ...m, anh_chan_dung: m.anh_chan_dung.slice(0, 250000) };
          }
          return m;
        });
        sessionDataCache.setItem(STORAGE_KEYS.NHAN_SU, JSON.stringify(optimizedList));
        return true;
      } catch (err2) {
        console.error('Không thể ghi dữ liệu nhân sự vào localStorage:', err2);
        return false;
      }
    }
  }

  setNhanSuList(list: NhanSu[]): boolean {
    const ok = this.setNhanSuListLocalOnly(list);
    void this.bgUpsert(SUPABASE_TABLES.NHAN_SU, list.map(item => this.toNhanSuRow(item)));
    return ok;
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
    let savedItem: NhanSu;

    if (index >= 0) {
      savedItem = {
        ...item,
        updated_at: now,
      };
      list[index] = savedItem;
    } else {
      const maxStt = list.length > 0 ? Math.max(...list.map(i => i.stt || 0)) : 0;
      savedItem = {
        ...item,
        stt: item.stt || maxStt + 1,
        created_at: now,
        updated_at: now,
      };
      list.push(savedItem);
    }

    this.clearPendingHardDelete(savedItem.id, true);
    this.clearPendingSoftDelete(savedItem.id, true);
    this.setNhanSuListLocalOnly(list);
    void this.bgUpsert(SUPABASE_TABLES.NHAN_SU, this.toNhanSuRow(savedItem));
    return { success: true };
  }

  softDeleteNhanSu(id: string): boolean {
    const list = this.getAllNhanSuRaw();
    const index = list.findIndex(i => i.id === id);
    if (index >= 0) {
      const now = new Date().toISOString();
      list[index].trang_thai = 'da_xoa';
      list[index].deleted_at = now;
      list[index].updated_at = now;
      this.markPendingSoftDelete(id, now);
      this.setNhanSuListLocalOnly(list);

      const updatedItem = { ...list[index] };
      void this.enqueueSync(async () => {
        try {
          const { error } = await supabase
            .from(SUPABASE_TABLES.NHAN_SU)
            .update({
              trang_thai: 'da_xoa',
              updated_at: now,
              raw_data: updatedItem,
            })
            .eq('id', id);
          if (!error) {
            this.clearPendingSoftDelete(id, false);
            this.notifyStatus('connected_ready', 'Đã đồng bộ xóa mềm lên Supabase');
          }
        } catch (err) {
          console.warn('Lỗi đồng bộ xóa mềm lên Supabase:', err);
        }
      });
      return true;
    }
    return false;
  }

  restoreNhanSu(id: string): boolean {
    const list = this.getAllNhanSuRaw();
    const index = list.findIndex(i => i.id === id);
    if (index >= 0) {
      const now = new Date().toISOString();
      list[index].trang_thai = 'dang_hoat_dong';
      delete list[index].deleted_at;
      list[index].updated_at = now;
      this.clearPendingSoftDelete(id, true);
      this.clearPendingHardDelete(id, true);
      this.setNhanSuListLocalOnly(list);
      void this.bgUpsert(SUPABASE_TABLES.NHAN_SU, this.toNhanSuRow(list[index]));
      return true;
    }
    return false;
  }

  permanentDeleteNhanSu(id: string): boolean {
    this.markPendingHardDelete(id);
    const list = this.getAllNhanSuRaw().filter(i => i.id !== id);
    this.setNhanSuListLocalOnly(list);
    void this.bgDelete(SUPABASE_TABLES.NHAN_SU, id);
    return true;
  }

  emptyTrash(): number {
    const list = this.getAllNhanSuRaw();
    const deleted = list.filter(i => i.trang_thai === 'da_xoa');
    if (deleted.length === 0) return 0;
    const deletedIds = deleted.map(i => i.id);
    deletedIds.forEach(id => this.markPendingHardDelete(id));
    const remaining = list.filter(i => i.trang_thai !== 'da_xoa');
    this.setNhanSuListLocalOnly(remaining);
    void this.enqueueSync(async () => {
      try {
        const { error } = await supabase.from(SUPABASE_TABLES.NHAN_SU).delete().in('id', deletedIds);
        if (!error) {
          deletedIds.forEach(id => this.clearPendingHardDelete(id, false));
          this.notifyStatus('connected_ready', `Đã dọn sạch ${deletedIds.length} hồ sơ trên Supabase`);
        }
      } catch (err) {
        console.warn('Lỗi dọn sạch thùng rác trên Supabase:', err);
      }
    });
    return deletedIds.length;
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
      this.setNhanSuListLocalOnly(list);
      void this.bgUpsert(SUPABASE_TABLES.NHAN_SU, this.toNhanSuRow(list[index]));

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
      this.clearPendingSoftDelete(id, true);
      this.clearPendingHardDelete(id, true);
      this.setNhanSuListLocalOnly(list);
      void this.bgUpsert(SUPABASE_TABLES.NHAN_SU, this.toNhanSuRow(list[index]));

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
      this.setNhanSuListLocalOnly(list);
      void this.bgUpsert(SUPABASE_TABLES.NHAN_SU, this.toNhanSuRow(list[index]));

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
    const raw = sessionDataCache.getItem(STORAGE_KEYS.AUDIT_LOGS);
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
  ): Promise<void> {
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
    sessionDataCache.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    if (!user) return Promise.resolve();
    return this.enqueueSync(async () => {
      try {
        await appendOwnAuditLogs([newLog]);
      } catch (error: any) {
        this.notifyStatus('error', error?.message || 'Không ghi được nhật ký lên Supabase');
        throw error;
      }
    });
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
    items.forEach(item => {
      this.clearPendingHardDelete(item.id, true);
      this.clearPendingSoftDelete(item.id, true);
    });
    const current = this.getAllNhanSuRaw();
    const merged = [...items, ...current.filter(c => !items.some(i => i.id === c.id))];
    this.setNhanSuListLocalOnly(merged);
    void this.bgUpsert(SUPABASE_TABLES.NHAN_SU, items.map(item => this.toNhanSuRow(item)));
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
    const raw = sessionDataCache.getItem(STORAGE_KEYS.TUAN_TRA);
    if (!raw) return INITIAL_TUAN_TRA;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TUAN_TRA;
    }
  }

  saveNhatKyTuanTra(item: NhatKyTuanTra, user?: UserAccount): NhatKyTuanTra {
    const list = this.getNhatKyTuanTraList();
    const currentUser = user || this.getCurrentUser() || SYSTEM_AUDIT_USER;
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

    sessionDataCache.setItem(STORAGE_KEYS.TUAN_TRA, JSON.stringify(updated));
    void this.bgUpsert(SUPABASE_TABLES.TUAN_TRA, this.toTuanTraRow(finalItem));
    return finalItem;
  }

  deleteNhatKyTuanTra(id: string, user?: UserAccount): void {
    const list = this.getNhatKyTuanTraList();
    const item = list.find(x => x.id === id);
    if (!item) return;

    const currentUser = user || this.getCurrentUser() || SYSTEM_AUDIT_USER;
    const updated = list.filter(x => x.id !== id);
    sessionDataCache.setItem(STORAGE_KEYS.TUAN_TRA, JSON.stringify(updated));
    void this.bgDelete(SUPABASE_TABLES.TUAN_TRA, id);

    this.addAuditLog(
      currentUser,
      'XOA_VINH_VIEN',
      `Nhật ký tuần tra ngày ${item.ngay_tuan_tra} (${item.ca_tuan_tra})`,
      `Xóa bỏ nhật ký ca tuần tra do ${item.nguoi_ghi_so} lập`
    );
  }

  // --- QUẢN LÝ TẬP HUẤN NGHIỆP VỤ ---
  getDotTapHuanList(): DotTapHuan[] {
    const raw = sessionDataCache.getItem(STORAGE_KEYS.TAP_HUAN);
    if (!raw) return INITIAL_TAP_HUAN;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TAP_HUAN;
    }
  }

  saveDotTapHuan(item: DotTapHuan, user?: UserAccount): DotTapHuan {
    const list = this.getDotTapHuanList();
    const currentUser = user || this.getCurrentUser() || SYSTEM_AUDIT_USER;
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

    sessionDataCache.setItem(STORAGE_KEYS.TAP_HUAN, JSON.stringify(updated));
    void this.bgUpsert(SUPABASE_TABLES.TAP_HUAN, this.toTapHuanRow(finalItem));
    return finalItem;
  }

  deleteDotTapHuan(id: string, user?: UserAccount): void {
    const list = this.getDotTapHuanList();
    const item = list.find(x => x.id === id);
    if (!item) return;

    const currentUser = user || this.getCurrentUser() || SYSTEM_AUDIT_USER;
    const updated = list.filter(x => x.id !== id);
    sessionDataCache.setItem(STORAGE_KEYS.TAP_HUAN, JSON.stringify(updated));
    void this.bgDelete(SUPABASE_TABLES.TAP_HUAN, id);

    this.addAuditLog(
      currentUser,
      'XOA_VINH_VIEN',
      `Đợt tập huấn: ${item.ten_dot}`,
      `Xóa hồ sơ đợt tập huấn nghiệp vụ do ${item.nguoi_nhap} khởi tạo`
    );
  }

  // --- QUẢN LÝ THI ĐUA - KHEN THƯỞNG ---
  getHoSoKhenThuongList(): HoSoKhenThuong[] {
    const raw = sessionDataCache.getItem(STORAGE_KEYS.KHEN_THUONG);
    if (!raw) return INITIAL_KHEN_THUONG;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_KHEN_THUONG;
    }
  }

  saveHoSoKhenThuong(item: HoSoKhenThuong, user?: UserAccount): HoSoKhenThuong {
    const list = this.getHoSoKhenThuongList();
    const currentUser = user || this.getCurrentUser() || SYSTEM_AUDIT_USER;
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

    sessionDataCache.setItem(STORAGE_KEYS.KHEN_THUONG, JSON.stringify(updated));
    void this.bgUpsert(SUPABASE_TABLES.KHEN_THUONG, this.toKhenThuongRow(finalItem));
    return finalItem;
  }

  deleteHoSoKhenThuong(id: string, user?: UserAccount): void {
    const list = this.getHoSoKhenThuongList();
    const item = list.find(x => x.id === id);
    if (!item) return;

    const currentUser = user || this.getCurrentUser() || SYSTEM_AUDIT_USER;
    const updated = list.filter(x => x.id !== id);
    sessionDataCache.setItem(STORAGE_KEYS.KHEN_THUONG, JSON.stringify(updated));
    void this.bgDelete(SUPABASE_TABLES.KHEN_THUONG, id);

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

      this.savePendingSync({
        hardDeletedIds: [],
        softDeletedMap: {},
        deletedTombstones: {},
        softDeletedTombstones: {},
        clearAllPending: false,
      });
      if (parsed.data.users) this.setUsers(parsed.data.users);
      if (parsed.data.dia_ban) this.setDiaBanList(parsed.data.dia_ban);
      if (parsed.data.to_antt) this.setToANTTList(parsed.data.to_antt);
      if (parsed.data.nhan_su) this.setNhanSuList(parsed.data.nhan_su);
      if (parsed.data.audit_logs) {
        sessionDataCache.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(parsed.data.audit_logs));
      }
      if (parsed.data.tuan_tra) {
        sessionDataCache.setItem(STORAGE_KEYS.TUAN_TRA, JSON.stringify(parsed.data.tuan_tra));
      }
      if (parsed.data.tap_huan) {
        sessionDataCache.setItem(STORAGE_KEYS.TAP_HUAN, JSON.stringify(parsed.data.tap_huan));
      }
      if (parsed.data.khen_thuong) {
        sessionDataCache.setItem(STORAGE_KEYS.KHEN_THUONG, JSON.stringify(parsed.data.khen_thuong));
      }

      void this.pushAllToSupabase();

      return {
        success: true,
        message: 'Khôi phục cơ sở dữ liệu thành công và đang đồng bộ lên Supabase!',
        count: parsed.data.nhan_su.length,
      };
    } catch (e: any) {
      return {
        success: false,
        message: 'Lỗi đọc tệp JSON: ' + (e?.message || 'Tệp hỏng hoặc không đúng định dạng'),
      };
    }
  }

  async syncOfficial19ToDatabase(user?: UserAccount): Promise<{
    success: boolean;
    message: string;
    totalCount: number;
    newlyAdded: number;
  }> {
    const currentList = this.getAllNhanSuRaw();
    const { mergedList, newlyAddedCount, toUpsert } = mergeOfficial19Members(currentList);

    this.setNhanSuListLocalOnly(mergedList);

    // Cập nhật to_truong_id / to_pho_id cho các tổ ANTT
    const toList = this.getToANTTList();
    let toUpdated = false;
    for (const m of mergedList) {
      if (m.chuc_vu === 'Tổ trưởng') {
        const t = toList.find(x => x.id === m.to_antt_id);
        if (t && t.to_truong_id !== m.id) {
          t.to_truong_id = m.id;
          toUpdated = true;
        }
      } else if (m.chuc_vu === 'Tổ phó') {
        const t = toList.find(x => x.id === m.to_antt_id);
        if (t && t.to_pho_id !== m.id) {
          t.to_pho_id = m.id;
          toUpdated = true;
        }
      }
    }
    if (toUpdated) {
      this.setToANTTList(toList);
    }

    if (toUpsert.length > 0) {
      const dbRows = toUpsert.map(m => this.toNhanSuRow(m));
      void this.bgUpsert(SUPABASE_TABLES.NHAN_SU, dbRows);
    }

    const activeUser = user || this.getCurrentUser() || SYSTEM_AUDIT_USER;
    this.addAuditLog(
      activeUser,
      'CAP_NHAT',
      'Đồng bộ 19 nhân sự chính thức vào CSDL',
      `Đã cập nhật ${newlyAddedCount} đồng chí mới vào CSDL, nâng tổng số quân số quản lý lên ${mergedList.length} đồng chí.`
    );

    this.notifyDataRefresh();

    return {
      success: true,
      message: `Đã cập nhật thành công! Tổng quân số hiện tại: ${mergedList.length} đồng chí (bổ sung mới ${newlyAddedCount} đồng chí).`,
      totalCount: mergedList.length,
      newlyAdded: newlyAddedCount,
    };
  }

  resetToDemoData(user?: UserAccount): void {
    this.savePendingSync({
      hardDeletedIds: [],
      softDeletedMap: {},
      deletedTombstones: {},
      softDeletedTombstones: {},
      clearAllPending: false,
    });
    this.setNhanSuList(OFFICIAL_MEMBERS);
    const currentUser = user || this.getCurrentUser() || SYSTEM_AUDIT_USER;
    this.addAuditLog(
      currentUser,
      'KHOI_PHUC',
      'Danh sách hồ sơ nhân sự ANTT cơ sở',
      `Khôi phục danh sách chính thức gồm ${OFFICIAL_MEMBERS.length} đồng chí theo biểu mẫu thống kê Công an xã Lai Vung`
    );
    this.notifyDataRefresh();
  }

  clearAllData(user?: UserAccount): void {
    const p = this.getPendingSync();
    p.clearAllPending = true;
    this.savePendingSync(p);
    this.setNhanSuListLocalOnly([]);
    void this.enqueueSync(async () => {
      try {
        const { error } = await supabase.from(SUPABASE_TABLES.NHAN_SU).delete().neq('id', '__none__');
        if (!error) {
          this.savePendingSync({
            hardDeletedIds: [],
            softDeletedMap: {},
            deletedTombstones: {},
            softDeletedTombstones: {},
            clearAllPending: false,
          });
          this.notifyStatus('connected_ready', 'Đã xóa sạch dữ liệu nhân sự trên Supabase');
        }
      } catch (e) {
        console.warn('Lỗi xóa sạch bảng nhan_su trên Supabase:', e);
      }
    });
    const currentUser = user || this.getCurrentUser() || SYSTEM_AUDIT_USER;
    this.addAuditLog(
      currentUser,
      'XOA_VINH_VIEN',
      'Toàn bộ danh sách hồ sơ nhân sự',
      'Đồng chí phụ trách hệ thống đã thực hiện xóa sạch toàn bộ dữ liệu nhân sự kiểm thử trong hệ thống'
    );
  }
}

export const storageService = new StorageService();


