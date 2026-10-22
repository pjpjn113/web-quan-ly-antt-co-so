import React, { useState } from 'react';
import { Search, RotateCcw, Users, Eye, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { NhanSu, DiaBanAp, ToANTT } from '../types';
import { calculateAge, getAgeGroup, formatDateVN, getMemberServiceDuration, isThanhVien } from '../utils/helpers';
import { maskCCCD } from '../utils/security';

interface AdvancedSearchProps {
  members: NhanSu[];
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  onViewMember: (m: NhanSu) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  members,
  diaBanList,
  toANTTList,
  onViewMember,
}) => {
  const [keyword, setKeyword] = useState('');
  const [apId, setApId] = useState('all');
  const [toId, setToId] = useState('all');
  const [chucVu, setChucVu] = useState('all');
  const [gioiTinh, setGioiTinh] = useState('all');
  const [ageGroup, setAgeGroup] = useState('all');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [danToc, setDanToc] = useState('all');
  const [bietTiengDanToc, setBietTiengDanToc] = useState('all');
  const [dangVien, setDangVien] = useState('all');
  const [vneid, setVneid] = useState('all');
  const [coTaiKhoan, setCoTaiKhoan] = useState('all');
  const [hocVan, setHocVan] = useState('all');
  const [chuyenMon, setChuyenMon] = useState('all');
  const [kiemNhiem, setKiemNhiem] = useState('all');
  const [thamNien, setThamNien] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'dang_hoat_dong' | 'da_thoi_viec'>('all');

  const apMap = new Map(diaBanList.map(a => [a.id, a.ten_ap]));
  const toMap = new Map(toANTTList.map(t => [t.id, t.ten_to]));

  // Lọc nâng cao
  const results = members
    .filter(m => m.trang_thai !== 'da_xoa')
    .filter(m => {
      if (statusFilter !== 'all' && m.trang_thai !== statusFilter) return false;
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const match = 
          m.ho_ten.toLowerCase().includes(q) ||
          m.so_cccd.includes(q) ||
          m.so_dien_thoai.includes(q) ||
          m.ma_nhan_su.toLowerCase().includes(q) ||
          m.noi_o_hien_nay.toLowerCase().includes(q) ||
          (m.chuyen_nganh && m.chuyen_nganh.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (apId !== 'all' && m.ap_id !== apId) return false;
      if (toId !== 'all' && m.to_antt_id !== toId) return false;
      if (chucVu !== 'all') {
        if (chucVu === 'Thành viên' || chucVu === 'Tổ viên') {
          if (!isThanhVien(m.chuc_vu)) return false;
        } else if (m.chuc_vu !== chucVu) {
          return false;
        }
      }

      if (kiemNhiem !== 'all') {
        if (kiemNhiem === 'has_any') {
          if (!m.chuc_vu_kiem_nhiem || m.chuc_vu_kiem_nhiem === 'Không kiêm nhiệm') return false;
        } else if (kiemNhiem === 'none') {
          if (m.chuc_vu_kiem_nhiem && m.chuc_vu_kiem_nhiem !== 'Không kiêm nhiệm') return false;
        } else {
          if (m.chuc_vu_kiem_nhiem !== kiemNhiem) return false;
        }
      }

      if (gioiTinh !== 'all' && m.gioi_tinh !== gioiTinh) return false;
      if (danToc !== 'all' && m.dan_toc !== danToc) return false;
      if (hocVan !== 'all' && m.trinh_do_hoc_van !== hocVan) return false;
      if (chuyenMon !== 'all' && m.trinh_do_chuyen_mon !== chuyenMon) return false;

      if (bietTiengDanToc !== 'all') {
        const has = bietTiengDanToc === 'yes';
        if (!!m.biet_tieng_dan_toc !== has) return false;
      }

      if (dangVien !== 'all') {
        const isDV = dangVien === 'yes';
        if (m.dang_vien !== isDV) return false;
      }

      if (vneid !== 'all') {
        const isV = vneid === 'yes';
        if (m.vneid_muc_2 !== isV) return false;
      }

      if (coTaiKhoan !== 'all') {
        const hasBank = coTaiKhoan === 'yes';
        if (m.co_tai_khoan !== hasBank) return false;
      }

      const age = calculateAge(m.ngay_sinh);
      if (ageGroup !== 'all') {
        const grp = getAgeGroup(age);
        if (grp !== ageGroup) return false;
      }

      if (minAge && age !== null && age < Number(minAge)) return false;
      if (maxAge && age !== null && age > Number(maxAge)) return false;

      if (thamNien !== 'all') {
        const dur = getMemberServiceDuration(m);
        if (!dur || !dur.isValid) return false;
        const totalMonths = dur.years * 12 + dur.months;
        if (thamNien === '<6m' && totalMonths >= 6) return false;
        if (thamNien === '6m-1y' && (totalMonths < 6 || totalMonths >= 12)) return false;
        if (thamNien === '1y-2y' && (totalMonths < 12 || totalMonths >= 24)) return false;
        if (thamNien === '>=2y' && totalMonths < 24) return false;
      }

      return true;
    });

  const handleReset = () => {
    setKeyword('');
    setApId('all');
    setToId('all');
    setChucVu('all');
    setGioiTinh('all');
    setAgeGroup('all');
    setMinAge('');
    setMaxAge('');
    setDanToc('all');
    setBietTiengDanToc('all');
    setDangVien('all');
    setVneid('all');
    setCoTaiKhoan('all');
    setHocVan('all');
    setChuyenMon('all');
    setKiemNhiem('all');
    setThamNien('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
            TÌM KIẾM & TRA CỨU HỒ SƠ NÂNG CAO
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lọc kết hợp đa tiêu chí về chính trị, trình độ, độ tuổi, định danh và tài khoản phụ cấp
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* Filter Parameters Form */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Main keyword */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Từ khóa tra cứu tự do (Họ tên, CCCD, Số điện thoại, Mã nhân sự, Địa chỉ...)
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Nhập tên cán bộ, CCCD, số điện thoại..."
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Địa bàn (Ấp)</label>
            <select
              value={apId}
              onChange={e => setApId(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả ấp</option>
              {diaBanList.map(a => (
                <option key={a.id} value={a.id}>{a.ten_ap}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tổ ANTT</label>
            <select
              value={toId}
              onChange={e => setToId(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả tổ</option>
              {toANTTList.map(t => (
                <option key={t.id} value={t.id}>{t.ten_to}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Chức vụ ANTT</label>
            <select
              value={chucVu}
              onChange={e => setChucVu(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả chức vụ</option>
              <option value="Tổ trưởng">Tổ trưởng</option>
              <option value="Tổ phó">Tổ phó</option>
              <option value="Thành viên">Thành viên (Tổ viên)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Chức vụ kiêm nhiệm</label>
            <select
              value={kiemNhiem}
              onChange={e => setKiemNhiem(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
            >
              <option value="all">Tất cả kiêm nhiệm</option>
              <option value="has_any">Có kiêm nhiệm</option>
              <option value="none">Không kiêm nhiệm</option>
              <option value="Tổ trưởng dân phòng">Tổ trưởng dân phòng</option>
              <option value="Tổ phó dân phòng">Tổ phó dân phòng</option>
              <option value="Bí thư chi bộ ấp">Bí thư chi bộ ấp</option>
              <option value="Phó Bí thư chi bộ ấp">Phó Bí thư chi bộ ấp</option>
              <option value="Phó Trưởng ấp">Phó Trưởng ấp</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Giới tính</label>
            <select
              value={gioiTinh}
              onChange={e => setGioiTinh(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nhóm tuổi</label>
            <select
              value={ageGroup}
              onChange={e => setAgeGroup(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả nhóm tuổi</option>
              <option value="18–30">18–30 tuổi</option>
              <option value="31–45">31–45 tuổi</option>
              <option value="46–60">46–60 tuổi</option>
              <option value="61–70">61–70 tuổi</option>
              <option value="Trên 70">Trên 70 tuổi</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Khoảng tuổi cụ thể</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Từ"
                value={minAge}
                onChange={e => setMinAge(e.target.value)}
                className="w-1/2 p-1.5 text-xs border border-slate-300 rounded-lg"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Đến"
                value={maxAge}
                onChange={e => setMaxAge(e.target.value)}
                className="w-1/2 p-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Đảng viên</label>
            <select
              value={dangVien}
              onChange={e => setDangVien(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="yes">Là Đảng viên</option>
              <option value="no">Chưa vào Đảng</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">VNeID Mức 2</label>
            <select
              value={vneid}
              onChange={e => setVneid(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="yes">Đã kích hoạt</option>
              <option value="no">Chưa kích hoạt</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">TK Ngân hàng</label>
            <select
              value={coTaiKhoan}
              onChange={e => setCoTaiKhoan(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="yes">Đã có tài khoản</option>
              <option value="no">Chưa có tài khoản</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Học vấn</label>
            <select
              value={hocVan}
              onChange={e => setHocVan(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="THPT">THPT</option>
              <option value="THCS">THCS</option>
              <option value="Tiểu học">Tiểu học</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Chuyên môn</label>
            <select
              value={chuyenMon}
              onChange={e => setChuyenMon(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="Chưa qua đào tạo">Chưa qua đào tạo</option>
              <option value="Sơ cấp">Sơ cấp</option>
              <option value="Trung cấp">Trung cấp</option>
              <option value="Cao đẳng">Cao đẳng</option>
              <option value="Đại học">Đại học</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tiếng dân tộc</label>
            <select
              value={bietTiengDanToc}
              onChange={e => setBietTiengDanToc(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="yes">Biết tiếng DT</option>
              <option value="no">Không</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-red-600" />
              <span>Thâm niên ANTT</span>
            </label>
            <select
              value={thamNien}
              onChange={e => setThamNien(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800"
            >
              <option value="all">Tất cả thâm niên</option>
              <option value="<6m">Dưới 6 tháng</option>
              <option value="6m-1y">Từ 6 tháng – 1 năm</option>
              <option value="1y-2y">Từ 1 năm – 2 năm</option>
              <option value=">=2y">Từ 2 năm trở lên</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Tìm thấy <strong className="text-red-600 font-extrabold">{results.length}</strong> kết quả phù hợp
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Mã NS</th>
                <th className="py-2.5 px-4">Họ và Tên</th>
                <th className="py-2.5 px-3">Năm sinh (Tuổi)</th>
                <th className="py-2.5 px-3">Giới tính</th>
                <th className="py-2.5 px-3">Số CCCD</th>
                <th className="py-2.5 px-3">Chức vụ</th>
                <th className="py-2.5 px-3 text-amber-300 whitespace-nowrap">Thâm niên (Thời gian tham gia)</th>
                <th className="py-2.5 px-3">Ấp phụ trách</th>
                <th className="py-2.5 px-3">Đảng viên</th>
                <th className="py-2.5 px-3">VNeID</th>
                <th className="py-2.5 px-3">TK Ngân hàng</th>
                <th className="py-2.5 px-3 text-center">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400">
                    Không tìm thấy thành viên nào thỏa mãn tiêu chí lọc
                  </td>
                </tr>
              ) : (
                results.map((m, idx) => {
                  const age = calculateAge(m.ngay_sinh);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-red-700">{m.ma_nhan_su}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 uppercase">
                        <div className="flex items-center gap-2">
                          <div 
                            onClick={() => onViewMember(m)}
                            className="w-7 h-9 rounded overflow-hidden bg-slate-100 border border-slate-300 shrink-0 shadow-2xs flex items-center justify-center cursor-pointer hover:border-red-500 transition"
                            title="Xem hồ sơ & ảnh 4x6"
                          >
                            {m.anh_chan_dung ? (
                              <img
                                src={m.anh_chan_dung}
                                alt={m.ho_ten}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500">
                                {m.ho_ten.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span>{m.ho_ten}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {formatDateVN(m.ngay_sinh)} ({age}t)
                      </td>
                      <td className="py-2.5 px-3">{m.gioi_tinh}</td>
                      <td className="py-2.5 px-3 font-mono">{maskCCCD(m.so_cccd)}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-bold text-slate-700">{m.chuc_vu}</span>
                          {m.chuc_vu_kiem_nhiem && m.chuc_vu_kiem_nhiem !== 'Không kiêm nhiệm' && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Kiêm: {m.chuc_vu_kiem_nhiem}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {(() => {
                          const dur = getMemberServiceDuration(m);
                          if (!dur || !dur.isValid) return <span className="text-slate-400">—</span>;
                          return (
                            <div>
                              <span className="font-bold text-amber-950 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                                {dur.formattedText}
                              </span>
                              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                                ({dur.totalDays.toLocaleString('vi-VN')} ngày)
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-2.5 px-3">{apMap.get(m.ap_id)}</td>
                      <td className="py-2.5 px-3">
                        {m.dang_vien ? <span className="text-amber-700 font-bold">Đảng viên</span> : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        {m.vneid_muc_2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                      </td>
                      <td className="py-2.5 px-3">
                        {m.co_tai_khoan ? <span className="text-emerald-700 font-semibold">{m.loai_ngan_hang}</span> : <span className="text-slate-400">Chưa có</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onViewMember(m)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Xem hồ sơ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
