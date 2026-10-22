import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://vupxyirmjjaruipruowu.supabase.co';

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_IB-fdrHzGoWv5HCHmDghJw_yE4YhC7H';

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

export const SQL_STEP_1_TABLES_SCHEMA = `-- =========================================================================
-- BƯỚC 1: KHỞI TẠO CẤU TRÚC 8 BẢNG DỮ LIỆU CÔNG TÁC & BẢNG USERS
-- ĐƠN VỊ: CÔNG AN XÃ LAI VUNG - TỈNH ĐỒNG THÁP
-- Ghi chú: Chạy trong SQL Editor trên Supabase để tạo 8 bảng
-- =========================================================================
BEGIN;

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

-- 7. Bảng Nhật ký Hệ thống (audit_logs)
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

-- 8. Bảng Hồ sơ Cán bộ (users) - Tuyệt đối không lưu mật khẩu
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'VIEWER',
  chuc_vu TEXT,
  don_vi TEXT,
  so_dien_thoai TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB DEFAULT '{}'::jsonb
);

-- Bật Row Level Security (RLS) cho tất cả các bảng
ALTER TABLE public.dia_ban_ap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.to_antt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhan_su ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhat_ky_tuan_tra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dot_tap_huan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ho_so_khen_thuong ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Chính sách truy cập dữ liệu nghiệp vụ
DROP POLICY IF EXISTS "Allow all access dia_ban_ap" ON public.dia_ban_ap;
-- Không tạo chính sách mở toàn quyền. Dùng RLS đã cấu hình trên máy chủ.

DROP POLICY IF EXISTS "Allow all access to_antt" ON public.to_antt;
-- Không tạo chính sách mở toàn quyền. Dùng RLS đã cấu hình trên máy chủ.

DROP POLICY IF EXISTS "Allow all access nhan_su" ON public.nhan_su;
-- Không tạo chính sách mở toàn quyền. Dùng RLS đã cấu hình trên máy chủ.

DROP POLICY IF EXISTS "Allow all access nhat_ky_tuan_tra" ON public.nhat_ky_tuan_tra;
-- Không tạo chính sách mở toàn quyền. Dùng RLS đã cấu hình trên máy chủ.

DROP POLICY IF EXISTS "Allow all access dot_tap_huan" ON public.dot_tap_huan;
-- Không tạo chính sách mở toàn quyền. Dùng RLS đã cấu hình trên máy chủ.

DROP POLICY IF EXISTS "Allow all access ho_so_khen_thuong" ON public.ho_so_khen_thuong;
-- Không tạo chính sách mở toàn quyền. Dùng RLS đã cấu hình trên máy chủ.

DROP POLICY IF EXISTS "Allow all access audit_logs" ON public.audit_logs;
-- Không tạo chính sách mở toàn quyền. Dùng RLS đã cấu hình trên máy chủ.

COMMIT;
`;

export const SQL_STEP_2_SECURITY_AND_RLS = `-- =========================================================================
-- BƯỚC 2: TẠO SCHEMA BẢO MẬT RIÊNG, HÀM KIỂM TRA ADMIN, TRIGGER & CHÍNH SÁCH RLS
-- ĐƠN VỊ: CÔNG AN XÃ LAI VUNG - TỈNH ĐỒNG THÁP
-- ĐÁP ỨNG QUY CHUẨN:
-- 1. Người đăng ký mới LUÔN LUÔN là VIEWER, không lấy quyền từ raw_user_meta_data
-- 2. Chỉ ADMIN mới được thay đổi role của người khác; người dùng không được đổi id hay role
-- 3. Tạo schema riêng app_security, hàm app_security.is_admin() SECURITY DEFINER SET search_path = ''
-- 4. Tài khoản thường chỉ xem hồ sơ của chính mình; ADMIN quản lý toàn bộ danh sách; không trả mật khẩu
-- =========================================================================
BEGIN;

-- 1. Tạo schema bảo mật nội bộ riêng không công khai
CREATE SCHEMA IF NOT EXISTS app_security;
REVOKE ALL ON SCHEMA app_security FROM PUBLIC;
GRANT USAGE ON SCHEMA app_security TO authenticated;
GRANT USAGE ON SCHEMA app_security TO service_role;

-- 2. Hàm kiểm tra quyền ADMIN trong schema riêng
-- Đạt chuẩn: SECURITY DEFINER, SET search_path = '' và sử dụng tên bảng đầy đủ public.users
CREATE OR REPLACE FUNCTION app_security.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users
    WHERE id = (auth.uid())::text 
      AND role = 'ADMIN'
  );
END;
$$;

REVOKE ALL ON FUNCTION app_security.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_security.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION app_security.is_admin() TO service_role;

-- 3. Trigger đồng bộ tài khoản mới từ auth.users sang public.users
-- Người đăng ký mới CỐ ĐỊNH vai trò là VIEWER (không nhận quyền từ raw_user_meta_data)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_username TEXT;
  v_fullname TEXT;
  v_chucvu TEXT;
  v_donvi TEXT;
  v_sdt TEXT;
BEGIN
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  v_fullname := COALESCE(NEW.raw_user_meta_data->>'full_name', v_username);
  v_chucvu := COALESCE(NEW.raw_user_meta_data->>'chuc_vu', 'Cán bộ Công an xã');
  v_donvi := COALESCE(NEW.raw_user_meta_data->>'don_vi', 'Công an xã Lai Vung');
  v_sdt := COALESCE(NEW.raw_user_meta_data->>'so_dien_thoai', '');

  -- Mọi tài khoản mới đăng ký đều CỐ ĐỊNH là VIEWER
  INSERT INTO public.users (
    id, 
    username, 
    full_name, 
    role, 
    chuc_vu, 
    don_vi, 
    so_dien_thoai, 
    created_at, 
    updated_at,
    raw_data
  )
  VALUES (
    NEW.id::text,
    v_username,
    v_fullname,
    'VIEWER', -- Luôn luôn là VIEWER
    v_chucvu,
    v_donvi,
    v_sdt,
    NOW(),
    NOW(),
    jsonb_build_object(
      'id', NEW.id::text,
      'username', v_username,
      'fullName', v_fullname,
      'role', 'VIEWER',
      'chucVu', v_chucvu,
      'donVi', v_donvi,
      'soDienThoai', v_sdt
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    chuc_vu = EXCLUDED.chuc_vu,
    don_vi = EXCLUDED.don_vi,
    so_dien_thoai = EXCLUDED.so_dien_thoai,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Trigger bảo vệ dữ liệu người dùng:
-- Cấm thay đổi id, chỉ ADMIN mới được đổi role người dùng
CREATE OR REPLACE FUNCTION public.trg_enforce_user_security()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Chặn thay đổi ID tài khoản
  IF TG_OP = 'UPDATE' AND NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'Nghiêm cấm thay đổi trường id của tài khoản!';
  END IF;

  -- Chặn người dùng thường thay đổi vai trò (role)
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT app_security.is_admin() THEN
      RAISE EXCEPTION 'Chỉ Quản trị viên (ADMIN) mới có quyền thay đổi vai trò (role) tài khoản!';
    END IF;
  END IF;

  -- Khi tạo mới trực tiếp từ bảng, nếu không phải ADMIN thì bắt buộc là VIEWER
  IF TG_OP = 'INSERT' THEN
    IF NEW.role <> 'VIEWER' AND NOT app_security.is_admin() THEN
      NEW.role := 'VIEWER';
    END IF;
  END IF;

  -- Loại bỏ triệt để mọi trường mật khẩu trong raw_data nếu có
  IF NEW.raw_data IS NOT NULL THEN
    NEW.raw_data := NEW.raw_data - 'password' - 'passwordHash' - 'password_hash' - 'plainPassword';
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_security_before_write ON public.users;
CREATE TRIGGER trg_users_security_before_write
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_enforce_user_security();

-- 5. Thiết lập Row Level Security (RLS) cho bảng public.users
DROP POLICY IF EXISTS "Allow all access users" ON public.users;
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_admin_only" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- SELECT: Tài khoản thường CHỈ XEM HỒ SƠ CỦA MÌNH; ADMIN quản lý toàn bộ danh sách
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid())::text = id 
    OR app_security.is_admin()
  );

-- INSERT: Tài khoản tự thêm hồ sơ của chính mình hoặc ADMIN thêm
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid())::text = id 
    OR app_security.is_admin()
  );

-- UPDATE: Người dùng cập nhật thông tin cá nhân của mình (trigger chặn đổi role), ADMIN cập nhật mọi người
CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid())::text = id 
    OR app_security.is_admin()
  )
  WITH CHECK (
    (auth.uid())::text = id 
    OR app_security.is_admin()
  );

-- DELETE: Duy nhất ADMIN được phép xóa tài khoản (không được tự xóa chính mình)
CREATE POLICY "users_delete_policy" ON public.users
  FOR DELETE
  TO authenticated
  USING (
    app_security.is_admin() 
    AND id <> (auth.uid())::text
  );

COMMIT;
`;

export const SQL_STEP_3_SET_FIRST_ADMIN = `-- =========================================================================
-- BƯỚC 3: THIẾT LẬP TÀI KHOẢN ADMIN ĐẦU TIÊN (DO CHỦ DỰ ÁN CHẠY)
-- HƯỚNG DẪN:
-- 1. Đăng ký tài khoản trên web hoặc tạo trong Supabase Auth -> Users.
-- 2. Sao chép User UID (chuỗi dạng UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
-- 3. Thay thế chuỗi 'THAY_BANG_UUID_CUA_BAN_O_DAY' ở dưới bằng UUID đó.
-- 4. Chạy đoạn SQL này trong SQL Editor của Supabase.
-- LƯU Ý: Không tự chọn tài khoản đầu tiên và không xóa bất kỳ tài khoản cũ nào.
-- =========================================================================
BEGIN;

DO $$
DECLARE
  -- Thay thế chuỗi này bằng User UID thực tế của tài khoản Admin từ Supabase Auth
  v_target_uuid TEXT := 'THAY_BANG_UUID_CUA_BAN_O_DAY';
  v_user_email TEXT;
BEGIN
  IF v_target_uuid = 'THAY_BANG_UUID_CUA_BAN_O_DAY' OR v_target_uuid IS NULL OR trim(v_target_uuid) = '' THEN
    RAISE EXCEPTION 'LỖI: Vui lòng điền UUID tài khoản thật của bạn vào biến v_target_uuid trước khi chạy!';
  END IF;

  SELECT email INTO v_user_email FROM auth.users WHERE id::text = v_target_uuid;
  
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'LỖI: Không tìm thấy tài khoản có UUID % trong auth.users! Hãy kiểm tra lại User UID.', v_target_uuid;
  END IF;

  -- Cập nhật hoặc đảm bảo tài khoản có quyền ADMIN trong public.users
  INSERT INTO public.users (
    id, 
    username, 
    full_name, 
    role, 
    chuc_vu, 
    don_vi, 
    created_at, 
    updated_at, 
    raw_data
  )
  VALUES (
    v_target_uuid,
    split_part(v_user_email, '@', 1),
    'Chỉ huy / Quản trị viên cấp cao',
    'ADMIN',
    'Phó Trưởng Công an xã',
    'Công an xã Lai Vung',
    NOW(),
    NOW(),
    jsonb_build_object(
      'id', v_target_uuid,
      'username', split_part(v_user_email, '@', 1),
      'fullName', 'Chỉ huy / Quản trị viên cấp cao',
      'role', 'ADMIN',
      'chucVu', 'Phó Trưởng Công an xã',
      'donVi', 'Công an xã Lai Vung'
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'ADMIN',
    updated_at = NOW();

  RAISE NOTICE '>>> XÁC NHẬN THÀNH CÔNG: Tài khoản % (UUID: %) đã được kích hoạt quyền ADMIN!', v_user_email, v_target_uuid;
END $$;

COMMIT;
`;

export const SQL_STEP_4_MIGRATE_AND_CLEANUP = `-- =========================================================================
-- BƯỚC 4: CHUYỂN ĐỔI TÀI KHOẢN CŨ & LÀM SẠCH TRIỆT ĐỂ MẬT KHẨU ĐÃ LƯU
-- ĐIỀU KIỆN AN TOÀN:
-- Tuyệt đối KHÔNG chạy bước này trước khi:
-- 1. Bạn đã đăng nhập thành công bằng tài khoản Supabase Auth.
-- 2. Đã chạy Bước 3 và xác nhận quyền ADMIN hoạt động bình thường!
-- =========================================================================
BEGIN;

-- 1. Kiểm tra điều kiện tiên quyết: Phải có ít nhất 1 tài khoản ADMIN hợp lệ kết nối với auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM public.users u 
    JOIN auth.users a ON u.id = a.id::text 
    WHERE u.role = 'ADMIN'
  ) THEN
    RAISE EXCEPTION 'DỪNG THỰC HIỆN: Chưa có tài khoản ADMIN nào từ auth.users được kích hoạt. Hãy chạy Bước 3 và xác nhận đăng nhập trước khi làm sạch mật khẩu!';
  END IF;
  RAISE NOTICE 'Kiểm tra tài khoản ADMIN: HỢP LỆ.';
END $$;

-- 2. Xóa bỏ cột password_hash khỏi bảng public.users nếu cột này còn tồn tại
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE public.users DROP COLUMN password_hash;
    RAISE NOTICE 'Đã xóa bỏ cột password_hash khỏi bảng public.users.';
  ELSE
    RAISE NOTICE 'Bảng public.users không có cột password_hash (đã an toàn).';
  END IF;
END $$;

-- 3. Làm sạch toàn bộ các thuộc tính mật khẩu trong trường raw_data của mọi người dùng
UPDATE public.users
SET 
  raw_data = raw_data - 'password' - 'passwordHash' - 'password_hash' - 'plainPassword',
  updated_at = NOW()
WHERE raw_data ? 'password' 
   OR raw_data ? 'passwordHash' 
   OR raw_data ? 'password_hash'
   OR raw_data ? 'plainPassword';

-- 4. Bảo toàn nguyên vẹn danh sách hồ sơ cán bộ cũ trong public.users,
-- không xóa bất kỳ thông tin nhân sự nào.

RAISE NOTICE '>>> HOÀN TẤT LÀM SẠCH: Toàn bộ mật khẩu lưu trữ đã được dọn sạch hoàn toàn khỏi cơ sở dữ liệu!';

COMMIT;
`;

// Tương thích ngược với các tên biến cũ
export const SUPABASE_SQL_SCHEMA = SQL_STEP_1_TABLES_SCHEMA;
export const SUPABASE_AUTH_SECURITY_SQL = SQL_STEP_2_SECURITY_AND_RLS;
export const SUPABASE_SET_ADMIN_SQL = SQL_STEP_3_SET_FIRST_ADMIN;
export const SUPABASE_CLEANUP_PASSWORDS_SQL = SQL_STEP_4_MIGRATE_AND_CLEANUP;


