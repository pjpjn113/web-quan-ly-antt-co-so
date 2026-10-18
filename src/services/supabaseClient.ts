import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://vupxyirmjjaruipruowu.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_IB-fdrHzGoWv5HCHmDghJw_yE4YhC7H';

export const SUPABASE_PROJECT_REF = 'vupxyirmjjaruipruowu';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SUPABASE_TABLES = {
  DIA_BAN: 'dia_ban_ap',
  TO_ANTT: 'to_antt',
  NHAN_SU: 'nhan_su',
  TUAN_TRA: 'nhat_ky_tuan_tra',
  TAP_HUAN: 'dot_tap_huan',
  KHEN_THUONG: 'ho_so_khen_thuong',
  USERS: 'users',
  AUDIT_LOGS: 'audit_logs',
} as const;

export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- KỊCH BẢN KHỞI TẠO CƠ SỞ DỮ LIỆU SUPABASE (POSTGRESQL)
-- ĐƠN VỊ: CÔNG AN XÃ LAI VUNG - TỈNH ĐỒNG THÁP
-- HỆ THỐNG: QUẢN LÝ LỰC LƯỢNG THAM GIA BẢO VỆ ANTT Ở CƠ SỞ
-- Hướng dẫn: Copy toàn bộ nội dung này dán vào mục SQL Editor trên Supabase
-- và nhấn nút "RUN" để tạo bảng và phân quyền kết nối.
-- =========================================================================

-- 1. Bảng Địa bàn Ấp (dia_ban_ap)
CREATE TABLE IF NOT EXISTS public.dia_ban_ap (
  id TEXT PRIMARY KEY,
  ma_ap TEXT NOT NULL,
  ten_ap TEXT NOT NULL,
  mo_ta TEXT,
  ghi_chu TEXT,
  trang_thai TEXT DEFAULT 'hoat_dong',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB DEFAULT '{}'::jsonb
);

-- 2. Bảng Tổ ANTT cơ sở (to_antt)
CREATE TABLE IF NOT EXISTS public.to_antt (
  id TEXT PRIMARY KEY,
  ma_to TEXT NOT NULL,
  ten_to TEXT NOT NULL,
  ap_id TEXT,
  to_truong_id TEXT,
  to_pho_id TEXT,
  ngay_thanh_lap TEXT,
  dia_ban_hoat_dong TEXT,
  ghi_chu TEXT,
  trang_thai TEXT DEFAULT 'hoat_dong',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB DEFAULT '{}'::jsonb
);

-- 3. Bảng Hồ sơ Thành viên ANTT cơ sở (nhan_su)
CREATE TABLE IF NOT EXISTS public.nhan_su (
  id TEXT PRIMARY KEY,
  ma_nhan_su TEXT NOT NULL,
  stt INTEGER DEFAULT 1,
  ho_ten TEXT NOT NULL,
  ngay_sinh TEXT,
  gioi_tinh TEXT,
  dan_toc TEXT,
  que_quan TEXT,
  noi_o_hien_nay TEXT,
  ap_id TEXT,
  dia_chi_chi_tiet TEXT,
  to_antt_id TEXT,
  chuc_vu TEXT,
  chuc_vu_kiem_nhiem TEXT,
  trinh_do_hoc_van TEXT,
  trinh_do_chuyen_mon TEXT,
  chuyen_nganh TEXT,
  so_cccd TEXT,
  ngay_cap_cccd TEXT,
  dang_vien BOOLEAN DEFAULT FALSE,
  ngay_tham_gia_antt TEXT,
  so_quyet_dinh TEXT,
  co_tai_khoan BOOLEAN DEFAULT FALSE,
  loai_ngan_hang TEXT,
  so_tai_khoan TEXT,
  vneid_muc_2 BOOLEAN DEFAULT FALSE,
  so_dien_thoai TEXT,
  ghi_chu TEXT,
  trang_thai TEXT DEFAULT 'dang_hoat_dong',
  so_quyet_dinh_thoi_viec TEXT,
  ngay_quyet_dinh_thoi_viec TEXT,
  ngay_thoi_viec TEXT,
  ly_do_thoi_viec TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB DEFAULT '{}'::jsonb
);

-- 4. Bảng Nhật ký Tuần tra hàng ngày (nhat_ky_tuan_tra)
CREATE TABLE IF NOT EXISTS public.nhat_ky_tuan_tra (
  id TEXT PRIMARY KEY,
  ngay_tuan_tra TEXT NOT NULL,
  ca_tuan_tra TEXT,
  so_cuoc_cong_khai INTEGER DEFAULT 0,
  so_cuoc_mat_phuc INTEGER DEFAULT 0,
  tong_so_cuoc INTEGER DEFAULT 0,
  so_luot_thanh_vien INTEGER DEFAULT 0,
  can_bo_cong_an_phu_trach TEXT,
  tuyen_duong_dia_ban TEXT,
  so_vu_viec_giai_quyet INTEGER DEFAULT 0,
  noi_dung_phoi_hop TEXT,
  ket_qua_noi_bat TEXT,
  nguoi_ghi_so TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB DEFAULT '{}'::jsonb
);

-- 5. Bảng Quản lý Tập huấn nghiệp vụ (dot_tap_huan)
CREATE TABLE IF NOT EXISTS public.dot_tap_huan (
  id TEXT PRIMARY KEY,
  ten_dot TEXT NOT NULL,
  chuyen_de TEXT,
  thoi_gian_bat_dau TEXT,
  thoi_gian_ket_thuc TEXT,
  dia_diem TEXT,
  don_vi_to_chuc TEXT,
  so_lop INTEGER DEFAULT 1,
  so_thanh_vien_tham_gia INTEGER DEFAULT 0,
  noi_dung_tap_huan TEXT,
  kinh_phi_ho_tro NUMERIC DEFAULT 0,
  trang_thai TEXT DEFAULT 'ke_hoach',
  nguoi_nhap TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB DEFAULT '{}'::jsonb
);

-- 6. Bảng Quản lý Thi đua - Khen thưởng (ho_so_khen_thuong)
CREATE TABLE IF NOT EXISTS public.ho_so_khen_thuong (
  id TEXT PRIMARY KEY,
  loai_khen_thuong TEXT,
  cap_khen_thuong TEXT,
  hinh_thuc TEXT,
  ten_nguoi_khen_thuong TEXT,
  thanh_vien_id TEXT,
  to_antt_id TEXT,
  so_quyet_dinh TEXT,
  ngay_quyet_dinh TEXT,
  co_quan_ban_hanh TEXT,
  ly_do_khen_thuong TEXT,
  tien_thuong NUMERIC DEFAULT 0,
  nam_khen_thuong INTEGER,
  nguoi_nhap TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB DEFAULT '{}'::jsonb
);

-- 7. Bảng Tài khoản Cán bộ sử dụng (users)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'VIEWER',
  chuc_vu TEXT,
  don_vi TEXT,
  so_dien_thoai TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB DEFAULT '{}'::jsonb
);

-- 8. Bảng Nhật ký Hệ thống (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  thoi_gian TEXT,
  hanh_dong TEXT,
  doi_tuong TEXT,
  noi_dung_thay_doi TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb
);

-- =========================================================================
-- PHÂN QUYỀN TRUY CẬP (ROW LEVEL SECURITY & POLICIES) CHO ANON / PUBLIC KEY
-- =========================================================================
ALTER TABLE public.dia_ban_ap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.to_antt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhan_su ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhat_ky_tuan_tra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dot_tap_huan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ho_so_khen_thuong ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access dia_ban_ap" ON public.dia_ban_ap;
CREATE POLICY "Allow all access dia_ban_ap" ON public.dia_ban_ap FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to_antt" ON public.to_antt;
CREATE POLICY "Allow all access to_antt" ON public.to_antt FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access nhan_su" ON public.nhan_su;
CREATE POLICY "Allow all access nhan_su" ON public.nhan_su FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access nhat_ky_tuan_tra" ON public.nhat_ky_tuan_tra;
CREATE POLICY "Allow all access nhat_ky_tuan_tra" ON public.nhat_ky_tuan_tra FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access dot_tap_huan" ON public.dot_tap_huan;
CREATE POLICY "Allow all access dot_tap_huan" ON public.dot_tap_huan FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access ho_so_khen_thuong" ON public.ho_so_khen_thuong;
CREATE POLICY "Allow all access ho_so_khen_thuong" ON public.ho_so_khen_thuong FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access users" ON public.users;
CREATE POLICY "Allow all access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access audit_logs" ON public.audit_logs;
CREATE POLICY "Allow all access audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
`;
