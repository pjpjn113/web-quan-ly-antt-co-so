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
  ShieldAlert
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { storageService, SYSTEM_MANAGER_INFO } from '../services/storage';
import { hashPassword } from '../utils/security';

interface LoginProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // Mode: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('Tuan@123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('VIEWER');
  const [regChucVu, setRegChucVu] = useState('Cán bộ Công an xã');
  const [regDonVi, setRegDonVi] = useState('Công an xã Lai Vung');
  const [regPhone, setRegPhone] = useState('');
  const [autoLogin, setAutoLogin] = useState(true);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Xử lý Đăng nhập
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanUsername = username.trim();
    if (!cleanUsername || !password.trim()) {
      setLoginError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const users = storageService.getUsers();
      const user = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
      const inputHash = await hashPassword(password);

      // Kiểm tra mật khẩu (hỗ trợ Tuan@123 cho Admin, 123456, hash hoặc passwordHash)
      const isMatch = user && (
        password === 'Tuan@123' ||
        password === '123456' || 
        user.passwordHash === password ||
        user.passwordHash === inputHash ||
        user.passwordHash === '123456_hashed_secure'
      );

      if (user && isMatch) {
        const updatedUser: UserAccount = {
          ...user,
          lastLoginAt: new Date().toISOString(),
        };

        storageService.setCurrentUser(updatedUser);

        storageService.addAuditLog(
          updatedUser,
          'DANG_NHAP',
          `Tài khoản: ${updatedUser.username} (${updatedUser.fullName})`,
          `Đăng nhập thành công với vai trò ${updatedUser.role} - Đơn vị: ${updatedUser.donVi}`
        );

        setIsLoggingIn(false);
        onLoginSuccess(updatedUser);
      } else {
        setIsLoggingIn(false);
        setLoginError('Tên đăng nhập hoặc mật khẩu không chính xác! Vui lòng thử lại.');
      }
    } catch {
      setIsLoggingIn(false);
      setLoginError('Có lỗi xảy ra khi xác thực tài khoản. Vui lòng thử lại!');
    }
  };

  // Xử lý Đăng ký tài khoản
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const cleanUsername = regUsername.trim();
    const cleanFullName = regFullName.trim();
    const cleanPassword = regPassword;
    const cleanConfirm = regConfirmPassword;

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
      setRegError('Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn nghiệp vụ.');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setRegError('Mật khẩu và xác nhận mật khẩu không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    setIsRegistering(true);

    try {
      const res = await storageService.registerUser({
        username: cleanUsername,
        password: cleanPassword,
        fullName: cleanFullName,
        role: regRole,
        chucVu: regChucVu,
        donVi: regDonVi,
        soDienThoai: regPhone,
      });

      setIsRegistering(false);

      if (!res.success || !res.user) {
        setRegError(res.error || 'Đăng ký tài khoản không thành công.');
        return;
      }

      setRegSuccess(`Đăng ký tài khoản "${res.user.username}" thành công!`);

      if (autoLogin) {
        // Tự động đăng nhập luôn
        const registeredUser = res.user;
        const loggedInUser: UserAccount = {
          ...registeredUser,
          lastLoginAt: new Date().toISOString(),
        };
        storageService.setCurrentUser(loggedInUser);
        storageService.addAuditLog(
          loggedInUser,
          'DANG_NHAP',
          `Tài khoản: ${loggedInUser.username} (${loggedInUser.fullName})`,
          `Tự động đăng nhập sau khi hoàn tất đăng ký tài khoản mới`
        );
        onLoginSuccess(loggedInUser);
      } else {
        // Chuyển sang tab Đăng nhập và điền sẵn thông tin
        setTimeout(() => {
          setUsername(cleanUsername);
          setPassword(cleanPassword);
          setActiveTab('login');
          setLoginError('');
        }, 1200);
      }
    } catch {
      setIsRegistering(false);
      setRegError('Có lỗi xảy ra trong quá trình đăng ký tài khoản. Vui lòng thử lại!');
    }
  };

  const handleQuickLogin = (uname: string, pwd = '123456') => {
    setUsername(uname);
    setPassword(pwd);
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2faee] via-[#edf7e5] to-[#dff1d3] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Police Grid Pattern & Ambient Glow with Young Rice Leaf Tones */}
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
            {/* Contact info for System Administrator */}
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-left">
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Quản trị hệ thống & Hỗ trợ kỹ thuật</span>
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
                <div className="text-[11px] text-slate-400 pt-0.5 border-t border-amber-500/20 flex flex-wrap gap-x-3">
                  <span>Tài khoản: <strong className="text-white font-mono">{SYSTEM_MANAGER_INFO.adminUsername}</strong></span>
                  <span>Mật khẩu: <strong className="text-amber-300 font-mono">{SYSTEM_MANAGER_INFO.adminPassword}</strong></span>
                </div>
              </div>
            </div>

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
                  Tên tài khoản (Tên đăng nhập)
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
                    placeholder="Nhập tên đăng nhập (vd: Admin hoặc tài khoản đã đăng ký)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
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
                    placeholder="Nhập mật khẩu (vd: Tuan@123)"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
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

            {/* Demo Fast-Login Selector */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                Chọn nhanh vai trò mẫu để trải nghiệm
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="demo-login-admin"
                  onClick={() => handleQuickLogin('Admin', 'Tuan@123')}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    username.toLowerCase() === 'admin'
                      ? 'bg-red-950/60 border-red-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold text-red-400">ADMIN</div>
                  <div className="text-[10px] text-slate-300 font-medium truncate">Đ/c Trần Thanh Tuấn</div>
                </button>

                <button
                  type="button"
                  id="demo-login-manager"
                  onClick={() => handleQuickLogin('canbo_quanly', '123456')}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    username === 'canbo_quanly'
                      ? 'bg-blue-950/60 border-blue-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold text-blue-400">CÁN BỘ QL</div>
                  <div className="text-[10px] text-slate-400 truncate">Đại úy Lê H. Minh</div>
                </button>

                <button
                  type="button"
                  id="demo-login-viewer"
                  onClick={() => handleQuickLogin('canbo_xem', '123456')}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    username === 'canbo_xem'
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold text-emerald-400">TRA CỨU</div>
                  <div className="text-[10px] text-slate-400 truncate">Thượng úy N.V. Hậu</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: FORM ĐĂNG KÝ TÀI KHOẢN ===================== */}
        {activeTab === 'register' && (
          <div className="animate-in fade-in duration-200">
            <div className="mt-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-left">
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Đăng ký tài khoản cán bộ nghiệp vụ mới</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Tạo tài khoản cá nhân bằng <strong>tên đăng nhập</strong> và <strong>mật khẩu</strong> để truy cập và làm việc trên cơ sở dữ liệu ANTT cơ sở xã Lai Vung.
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
              {/* Tên đăng nhập */}
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
                    placeholder="vd: canbo_antt, letuan, nguyenvanan..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition font-mono"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Viết liền không dấu, từ 3 ký tự trở lên (dùng để đăng nhập hệ thống)</p>
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
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 transition"
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
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {regConfirmPassword && regConfirmPassword !== regPassword && (
                    <span className="text-[10px] text-rose-400">Mật khẩu xác nhận chưa khớp</span>
                  )}
                </div>
              </div>

              {/* Vai trò & Quyền hạn phân quyền */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Vai trò & Quyền hạn truy cập <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('VIEWER')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      regRole === 'VIEWER'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                      <span>Cán bộ Tra cứu (VIEWER)</span>
                      {regRole === 'VIEWER' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tra cứu, xem hồ sơ nhân sự, in báo cáo</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('MANAGER')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      regRole === 'MANAGER'
                        ? 'bg-blue-950/60 border-blue-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-blue-400 flex items-center justify-between">
                      <span>Cán bộ Quản lý (MANAGER)</span>
                      {regRole === 'MANAGER' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Thêm, sửa, xóa, duyệt hồ sơ ANTT</p>
                  </button>
                </div>
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
                    <span>HOÀN TẤT ĐĂNG KÝ TÀI KHOẢN</span>
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
