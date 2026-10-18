import React, { useState } from 'react';
import { Shield, User, KeyRound, AlertCircle, ArrowRight, ShieldCheck, PhoneCall, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types';
import { storageService, SYSTEM_MANAGER_INFO } from '../services/storage';

interface LoginProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('Tuan@123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = storageService.getUsers();
      const cleanUser = username.trim().toLowerCase();
      const user = users.find(u => u.username.toLowerCase() === cleanUser);

      // Kiểm tra mật khẩu (hỗ trợ Tuan@123 cho Admin, 123456 hoặc passwordHash)
      const isMatch = user && (
        password === 'Tuan@123' ||
        password === '123456' || 
        user.passwordHash === password ||
        user.passwordHash === '123456_hashed_secure'
      );

      if (user && isMatch) {
        const updatedUser: UserAccount = {
          ...user,
          lastLoginAt: new Date().toISOString(),
        };

        // Lưu người dùng đăng nhập
        storageService.setCurrentUser(updatedUser);

        // Ghi nhật ký đăng nhập
        storageService.addAuditLog(
          updatedUser,
          'DANG_NHAP',
          `Tài khoản: ${updatedUser.username} (${updatedUser.fullName})`,
          `Đăng nhập thành công với vai trò ${updatedUser.role}`
        );

        setIsLoading(false);
        onLoginSuccess(updatedUser);
      } else {
        setIsLoading(false);
        setError('Tên đăng nhập hoặc mật khẩu không chính xác! Vui lòng thử lại.');
      }
    }, 200);
  };

  const handleQuickLogin = (uname: string, pwd = '123456') => {
    setUsername(uname);
    setPassword(pwd);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2faee] via-[#edf7e5] to-[#dff1d3] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Police Grid Pattern & Ambient Glow with Young Rice Leaf Tones */}
      <div className="absolute inset-0 bg-[radial-gradient(#4d7c0f_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-lime-400/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 text-white">
        {/* Police Insignia */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-800">
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
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên tài khoản
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
                placeholder="Nhập tên đăng nhập (vd: Admin)"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mật khẩu đăng nhập
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (vd: Tuan@123)"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-submit-login"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>ĐĂNG NHẬP HỆ THỐNG</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Login Selector */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
            Chọn nhanh vai trò đăng nhập
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              id="demo-login-admin"
              onClick={() => handleQuickLogin('Admin', 'Tuan@123')}
              className={`p-2 rounded-lg border text-left transition ${
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
              className={`p-2 rounded-lg border text-left transition ${
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
              className={`p-2 rounded-lg border text-left transition ${
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

      <div className="mt-6 text-center text-xs text-slate-400 z-10 space-y-1">
        <div>© 2026 CÔNG AN XÃ LAI VUNG – HUYỆN LAI VUNG – TỈNH ĐỒNG THÁP</div>
        <div className="text-[11px] text-slate-500">
          Phụ trách quản trị hệ thống: Đồng chí Trung tá Trần Thanh Tuấn (0913344189)
        </div>
      </div>
    </div>
  );
};
