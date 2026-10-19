import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  User, 
  KeyRound, 
  AlertCircle, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Briefcase, 
  BadgeCheck,
  Mail,
  HelpCircle,
  Database
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { storageService, SYSTEM_MANAGER_INFO } from '../services/storage';
import { supabase, SUPABASE_TABLES } from '../services/supabaseClient';

interface LoginProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // Mode: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showAdminGuide, setShowAdminGuide] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regChucVu, setRegChucVu] = useState('Cán bộ Công an xã');
  const [regDonVi, setRegDonVi] = useState('Công an xã Lai Vung');
  const [regPhone, setRegPhone] = useState('');
  const [autoLogin, setAutoLogin] = useState(true);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Xử lý Đăng nhập qua Supabase Auth
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanInput = username.trim();
    if (!cleanInput || !password.trim()) {
      setLoginError('Vui lòng nhập đầy đủ tên đăng nhập / email và mật khẩu.');
      return;
    }

    setIsLoggingIn(true);

    try {
      // 1. Chuẩn hóa địa chỉ email để xác thực với Supabase Auth
      let authEmail = cleanInput;
      if (!authEmail.includes('@')) {
        // Tìm xem người dùng có email đã lưu trong danh sách hồ sơ local không
        const localUser = storageService.getUsers().find(
          u => u.username.toLowerCase() === cleanInput.toLowerCase()
        );
        if (localUser && localUser.email) {
          authEmail = localUser.email;
        } else {
          authEmail = `${cleanInput.toLowerCase()}@laivung.antt.local`;
        }
      }

      // 2. Xác thực tài khoản trực tiếp qua Supabase Auth (Không có điều kiện vượt mật khẩu dùng chung)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: password,
      });

      if (authError || !authData.user) {
        setIsLoggingIn(false);
        if (authError?.message?.includes('Invalid login credentials')) {
          setLoginError('Tên đăng nhập / Email hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.');
        } else if (authError?.message?.includes('Email not confirmed')) {
          setLoginError('Tài khoản chưa được xác nhận email. Quản trị viên vui lòng xác nhận tài khoản trong Supabase Auth hoặc tắt tùy chọn Confirm Email.');
        } else {
          setLoginError(`Lỗi xác thực: ${authError?.message || 'Không thể đăng nhập qua Supabase Auth.'}`);
        }
        return;
      }

      // 3. Đọc thông tin hồ sơ cán bộ từ bảng public.users (Không truy vấn cột mật khẩu)
      const { data: profile, error: profileError } = await supabase
        .from(SUPABASE_TABLES.USERS)
        .select('id, username, full_name, role, chuc_vu, don_vi, so_dien_thoai, created_at, raw_data')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('Không thể tải hồ sơ public.users khi đăng nhập:', profileError.message);
      }

      const fallbackRole: UserRole = 'VIEWER';
      const userAccount: UserAccount = storageService.fromUserRow(profile || {}, {
        id: authData.user.id,
        username: authData.user.user_metadata?.username || cleanInput,
        email: authData.user.email,
        fullName: authData.user.user_metadata?.full_name || cleanInput,
        role: fallbackRole,
        chucVu: authData.user.user_metadata?.chuc_vu || 'Cán bộ Công an xã',
        donVi: authData.user.user_metadata?.don_vi || 'Công an xã Lai Vung',
        soDienThoai: authData.user.user_metadata?.so_dien_thoai || '',
        createdAt: authData.user.created_at || '',
        lastLoginAt: new Date().toISOString(),
      });

      // Tự động tạo hồ sơ mặc định là VIEWER nếu tài khoản chưa có trong public.users (và truy vấn không bị lỗi)
      if (!profile && !profileError) {
        void supabase
          .from(SUPABASE_TABLES.USERS)
          .upsert(storageService.toUserRow({ ...userAccount, role: 'VIEWER' }), { onConflict: 'id' });
      }

      storageService.setCurrentUser(userAccount);

      storageService.addAuditLog(
        userAccount,
        'DANG_NHAP',
        `Tài khoản: ${userAccount.username} (${userAccount.fullName})`,
        `Đăng nhập thành công với vai trò ${userAccount.role} - Đơn vị: ${userAccount.donVi}`
      );

      setIsLoggingIn(false);
      onLoginSuccess(userAccount);
    } catch (err: any) {
      setIsLoggingIn(false);
      setLoginError(err?.message || 'Có lỗi xảy ra khi xác thực tài khoản qua Supabase Auth.');
    }
  };

  // Xử lý Đăng ký tài khoản mới qua Supabase Auth
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const cleanUsername = regUsername.trim();
    const cleanFullName = regFullName.trim();
    const cleanPassword = regPassword;
    const cleanConfirm = regConfirmPassword;
    const cleanEmail = regEmail.trim();

    // Validation
    if (!cleanUsername) {
      setRegError('Vui lòng nhập tên đăng nhập.');
      return;
    }

    if (cleanUsername.length < 3) {
      setRegError('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return;
    }

    if (/\s/.test(cleanUsername)) {
      setRegError('Tên đăng nhập không được chứa khoảng trắng (viết liền không dấu).');
      return;
    }

    if (!cleanFullName) {
      setRegError('Vui lòng nhập họ và tên cán bộ/chiến sĩ.');
      return;
    }

    if (!cleanPassword) {
      setRegError('Vui lòng nhập mật khẩu.');
      return;
    }

    if (cleanPassword.length < 6) {
      setRegError('Mật khẩu phải có tối thiểu 6 ký tự để bảo đảm an toàn nghiệp vụ.');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setRegError('Mật khẩu và xác nhận mật khẩu không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    setIsRegistering(true);

    try {
      // YÊU CẦU 1: Người đăng ký mới LUÔN LUÔN là VIEWER. Không nhận quyền từ client, không tự nhận ADMIN
      const res = await storageService.registerUser({
        username: cleanUsername,
        email: cleanEmail || undefined,
        password: cleanPassword,
        fullName: cleanFullName,
        role: 'VIEWER',
        chucVu: regChucVu,
        donVi: regDonVi,
        soDienThoai: regPhone,
      });

      setIsRegistering(false);

      if (!res.success || !res.user) {
        setRegError(res.error || 'Đăng ký tài khoản không thành công.');
        return;
      }

      if (res.requireEmailConfirmation) {
        setRegSuccess(
          `Đăng ký tài khoản "${res.user.username}" thành công trên Supabase Auth! Vui lòng xác nhận email hoặc quản trị viên kích hoạt tài khoản trước khi đăng nhập.`
        );
        setActiveTab('login');
        setUsername(cleanUsername);
        return;
      }

      setRegSuccess(`Đăng ký tài khoản "${res.user.username}" thành công trên Supabase Auth!`);

      if (autoLogin) {
        const registeredUser = res.user;
        const loggedInUser: UserAccount = {
          ...registeredUser,
          lastLoginAt: new Date().toISOString(),
        };
        storageService.setCurrentUser(loggedInUser);
        onLoginSuccess(loggedInUser);
      } else {
        setTimeout(() => {
          setUsername(cleanUsername);
          setPassword(cleanPassword);
          setActiveTab('login');
          setLoginError('');
        }, 1200);
      }
    } catch (err: any) {
      setIsRegistering(false);
      setRegError(err?.message || 'Có lỗi xảy ra trong quá trình đăng ký tài khoản. Vui lòng thử lại!');
    }
  };

  const handleSelectUsernameHelper = (uname: string) => {
    setUsername(uname);
    setPassword('');
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2faee] via-[#edf7e5] to-[#dff1d3] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Police Grid Pattern & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#4d7c0f_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-lime-400/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-lg bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 text-white">
        {/* Police Insignia & Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-slate-800">
          <div className="mb-3 flex items-center justify-center">
            <img
              src="/huyhieu_cand.svg"
              alt="Huy hiệu Công an nhân dân Việt Nam"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)] transition-transform duration-300 hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex flex-col items-center gap-1 mb-2">
            <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase">
              CÔNG AN TỈNH ĐỒNG THÁP
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-700 to-red-800 border border-amber-400/50 text-amber-300 text-xs font-black tracking-wider shadow-sm uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              CÔNG AN XÃ LAI VUNG
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase leading-snug">
            QUẢN LÝ THÀNH VIÊN ANTT CƠ SỞ
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hệ thống nghiệp vụ lưu trữ & chuẩn hóa nhân sự lực lượng ANTT cơ sở
          </p>
        </div>

        {/* Tab Switcher: Đăng nhập vs Đăng ký tài khoản */}
        <div className="mt-5 grid grid-cols-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            type="button"
            id="tab-login"
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>ĐĂNG NHẬP</span>
          </button>

          <button
            type="button"
            id="tab-register"
            onClick={() => {
              setActiveTab('register');
              setRegError('');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>ĐĂNG KÝ TÀI KHOẢN</span>
          </button>
        </div>

        {/* ===================== TAB 1: FORM ĐĂNG NHẬP ===================== */}
        {activeTab === 'login' && (
          <div className="animate-in fade-in duration-200">
            {/* Contact info for System Administrator (Không hiển thị mật khẩu Admin) */}
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-left">
              <div className="text-[11px] font-bold text-amber-400 flex items-center justify-between uppercase tracking-wide">
                <div className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Quản trị hệ thống & Hỗ trợ kỹ thuật</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdminGuide(!showAdminGuide)}
                  className="text-[10px] text-amber-300 hover:text-amber-200 underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{showAdminGuide ? 'Ẩn hướng dẫn ADMIN' : 'HD thiết lập ADMIN'}</span>
                </button>
              </div>
              <div className="mt-2 text-xs text-slate-200 space-y-1">
                <div>
                  <span className="text-slate-400">Đồng chí: </span>
                  <span className="font-bold text-amber-300">
                    {SYSTEM_MANAGER_INFO.rank} {SYSTEM_MANAGER_INFO.fullName}
                  </span>
                  <span className="text-slate-300"> – {SYSTEM_MANAGER_INFO.title}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-400">Số điện thoại liên hệ:</span>
                  <a
                    href={`tel:${SYSTEM_MANAGER_INFO.phone}`}
                    className="font-mono font-bold text-amber-300 hover:text-amber-200 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{SYSTEM_MANAGER_INFO.phone}</span>
                  </a>
                </div>
                <div className="text-[11px] text-slate-400 pt-0.5 border-t border-amber-500/20">
                  <span>Tài khoản Quản trị: <strong className="text-white font-mono">{SYSTEM_MANAGER_INFO.adminUsername}</strong></span>
                  <span className="ml-2 text-emerald-400 font-medium">• Xác thực trực tiếp qua Supabase Auth</span>
                </div>
              </div>
            </div>

            {/* Admin Supabase Auth Guide Collapsible */}
            {showAdminGuide && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-950 border border-amber-500/50 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hướng dẫn thiết lập tài khoản Quản trị viên (ADMIN) đầu tiên:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-300 leading-relaxed">
                  <li>
                    <strong>Cách 1:</strong> Đăng ký tài khoản trên tab &quot;Đăng ký tài khoản&quot; với tên đăng nhập (vd: <code className="text-amber-300 font-mono">admin</code>) và mật khẩu cá nhân. Sau đó mở <strong>SQL Editor</strong> trên Supabase chạy lệnh:
                    <div className="p-1.5 bg-slate-900 rounded font-mono text-[10px] text-emerald-300 mt-1 select-all">
                      UPDATE public.users SET role = &apos;ADMIN&apos; WHERE username = &apos;admin&apos;;
                    </div>
                  </li>
                  <li>
                    <strong>Cách 2:</strong> Vào Supabase Dashboard $\rightarrow$ mục <strong>Authentication</strong> $\rightarrow$ bấm <strong>Add User</strong> để tạo tài khoản, sau đó gán quyền ADMIN trong bảng <code className="text-amber-300 font-mono">public.users</code>.
                  </li>
                </ol>
              </div>
            )}

            {/* Error Alert */}
            {loginError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên đăng nhập hoặc Email cán bộ
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="login-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập hoặc Email cán bộ"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Mật khẩu đăng nhập
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu tài khoản"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="btn-submit-login"
                disabled={isLoggingIn}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isLoggingIn ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ĐĂNG NHẬP HỆ THỐNG</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Chuyển nhanh sang Đăng ký */}
            <div className="mt-4 text-center">
              <span className="text-xs text-slate-400">Chưa có tài khoản cán bộ? </span>
              <button
                type="button"
                id="btn-switch-to-register"
                onClick={() => {
                  setActiveTab('register');
                  setRegError('');
                }}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng ký tài khoản ngay</span>
              </button>
            </div>

            {/* Điền nhanh tên đăng nhập mẫu (Không vượt mật khẩu) */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Điền nhanh tên tài khoản mẫu
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="demo-username-admin"
                  onClick={() => handleSelectUsernameHelper('Admin')}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    username.toLowerCase() === 'admin'
                      ? 'bg-red-950/60 border-red-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold text-red-400">ADMIN</div>
                  <div className="text-[10px] text-slate-400 truncate">Trung tá Tuấn</div>
                </button>

                <button
                  type="button"
                  id="demo-username-manager"
                  onClick={() => handleSelectUsernameHelper('canbo_quanly')}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    username === 'canbo_quanly'
                      ? 'bg-blue-950/60 border-blue-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold text-blue-400">CÁN BỘ QL</div>
                  <div className="text-[10px] text-slate-400 truncate">Đại úy Minh</div>
                </button>

                <button
                  type="button"
                  id="demo-username-viewer"
                  onClick={() => handleSelectUsernameHelper('canbo_xem')}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    username === 'canbo_xem'
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold text-emerald-400">TRA CỨU</div>
                  <div className="text-[10px] text-slate-400 truncate">Thượng úy Hậu</div>
                </button>
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-2 italic">
                * Xác thực an toàn qua Supabase Auth. Vui lòng nhập đúng mật khẩu của tài khoản.
              </p>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: FORM ĐĂNG KÝ TÀI KHOẢN ===================== */}
        {activeTab === 'register' && (
          <div className="animate-in fade-in duration-200">
            <div className="mt-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-left">
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Đăng ký tài khoản xác thực Supabase Auth</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Tài khoản được bảo mật và xác thực độc quyền bởi <strong>Supabase Auth</strong>. Bảng dữ liệu nội bộ chỉ lưu trữ hồ sơ công tác, không lưu mật khẩu.
              </p>
            </div>

            {/* Error Banner */}
            {regError && (
              <div className="mt-3.5 p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* Success Banner */}
            {regSuccess && (
              <div className="mt-3.5 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleRegisterSubmit} className="mt-3.5 space-y-3.5">
              {/* Tên đăng nhập & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tên đăng nhập <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="register-username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="vd: letuan, canbo_antt"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email cán bộ <span className="text-slate-400 font-normal">(tùy chọn)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="register-email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value.trim())}
                      placeholder="vd: letuan@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Họ và tên cán bộ */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ và tên cán bộ / chiến sĩ <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="register-fullname"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="vd: Đại úy Lê Hoàng Minh hoặc Nguyễn Văn An"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Mật khẩu & Nhập lại mật khẩu (2 cột) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mật khẩu <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      id="register-password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Xác nhận mật khẩu <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      id="register-confirm-password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className={`w-full pl-9 pr-9 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition ${
                        regConfirmPassword && regConfirmPassword !== regPassword
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {regConfirmPassword && regConfirmPassword !== regPassword && (
                    <span className="text-[10px] text-rose-400">Mật khẩu xác nhận chưa khớp</span>
                  )}
                </div>
              </div>

              {/* Vai trò khởi tạo mặc định: Cán bộ Tra cứu (VIEWER) */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Vai trò khởi tạo mặc định:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Cán bộ Tra cứu (VIEWER)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  * Mọi tài khoản mới đăng ký đều nhận quyền <strong>VIEWER</strong>. Chỉ Quản trị viên (ADMIN) mới có thẩm quyền phân quyền nâng cao trên hệ thống.
                </p>
              </div>

              {/* Chức vụ & Đơn vị & SĐT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Chức vụ công tác
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="register-chucvu"
                      value={regChucVu}
                      onChange={(e) => setRegChucVu(e.target.value)}
                      placeholder="vd: Cán bộ Công an xã, Tổ trưởng Tổ ANTT..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      id="register-phone"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="vd: 0912345678"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Đơn vị công tác
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="register-donvi"
                    value={regDonVi}
                    onChange={(e) => setRegDonVi(e.target.value)}
                    placeholder="Công an xã Lai Vung"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Tùy chọn Tự động đăng nhập */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="checkbox-autologin"
                  checked={autoLogin}
                  onChange={(e) => setAutoLogin(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-slate-950 border-slate-700 rounded focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <label htmlFor="checkbox-autologin" className="text-xs text-slate-300 cursor-pointer select-none">
                  Tự động đăng nhập vào hệ thống ngay sau khi đăng ký thành công
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-submit-register"
                disabled={isRegistering}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isRegistering ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>HOÀN TẤT ĐĂNG KÝ VỚI SUPABASE AUTH</span>
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <span className="text-xs text-slate-400">Đã có tài khoản cán bộ? </span>
              <button
                type="button"
                id="btn-back-to-login"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                }}
                className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Quay lại Đăng nhập</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-slate-500 z-10 space-y-1">
        <div>© 2026 CÔNG AN XÃ LAI VUNG – HUYỆN LAI VUNG – TỈNH ĐỒNG THÁP</div>
        <div className="text-[11px] text-slate-600">
          Phụ trách quản trị hệ thống: Đồng chí Trung tá Trần Thanh Tuấn (0913344189)
        </div>
      </div>
    </div>
  );
};
