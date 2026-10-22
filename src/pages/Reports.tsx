import React from 'react';
import { BarChart3, Printer, Users, Award, Smartphone, CreditCard, Shield, MapPin, Clock } from 'lucide-react';
import { NhanSu, DiaBanAp, ToANTT } from '../types';
import { calculateAge, getAgeGroup, getMemberServiceDuration, isThanhVien } from '../utils/helpers';

interface ReportsProps {
  members: NhanSu[];
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
}

export const Reports: React.FC<ReportsProps> = ({
  members,
  diaBanList,
  toANTTList,
}) => {
  const activeMembers = members.filter(m => m.trang_thai !== 'da_xoa');
  const total = activeMembers.length;

  const maleCount = activeMembers.filter(m => m.gioi_tinh === 'Nam').length;
  const femaleCount = activeMembers.filter(m => m.gioi_tinh === 'Nữ').length;
  const dangVienCount = activeMembers.filter(m => m.dang_vien).length;
  const vneidCount = activeMembers.filter(m => m.vneid_muc_2).length;
  const bankCount = activeMembers.filter(m => m.co_tai_khoan).length;

  // Độ tuổi
  const ageGroups: Record<string, number> = {
    '18–30': 0,
    '31–45': 0,
    '46–60': 0,
    '61–70': 0,
    'Trên 70': 0,
  };
  activeMembers.forEach(m => {
    const age = calculateAge(m.ngay_sinh);
    const grp = getAgeGroup(age);
    if (grp !== 'Chưa xác định' && ageGroups[grp] !== undefined) {
      ageGroups[grp]++;
    }
  });

  // Phân loại thâm niên tham gia lực lượng ANTT cơ sở (căn cứ ngày QĐ của UBND xã)
  const seniorityGroups: Record<string, number> = {
    'Dưới 6 tháng': 0,
    'Từ 6 tháng – 1 năm': 0,
    'Từ 1 năm – 2 năm': 0,
    'Từ 2 năm trở lên': 0,
  };
  activeMembers.forEach(m => {
    const dur = getMemberServiceDuration(m);
    if (dur && dur.isValid) {
      const totalMonths = dur.years * 12 + dur.months;
      if (totalMonths < 6) seniorityGroups['Dưới 6 tháng']++;
      else if (totalMonths < 12) seniorityGroups['Từ 6 tháng – 1 năm']++;
      else if (totalMonths < 24) seniorityGroups['Từ 1 năm – 2 năm']++;
      else seniorityGroups['Từ 2 năm trở lên']++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
            BÁO CÁO THỐNG KÊ TỔNG HỢP QUÂN SỐ ANTT CƠ SỞ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phục vụ công tác chỉ đạo, điều hành của Ban Chỉ huy Công an xã và UBND xã Lai Vung
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>In Báo Cáo Thống Kê</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Tổng quân số ANTT</span>
          <div className="text-2xl font-black text-red-600 mt-1">{total} đồng chí</div>
          <div className="text-[11px] text-slate-400 mt-1">100% biên chế bố trí</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Tỷ lệ Đảng viên</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {dangVienCount} <span className="text-xs text-slate-400">({total > 0 ? Math.round((dangVienCount / total) * 100) : 0}%)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Hạt nhân nòng cốt chính trị</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Định danh VNeID Mức 2</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {vneidCount} <span className="text-xs text-slate-400">({total > 0 ? Math.round((vneidCount / total) * 100) : 0}%)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Đạt chuẩn Đề án 06/CP</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Tài khoản chi trả phụ cấp</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {bankCount} <span className="text-xs text-slate-400">({total > 0 ? Math.round((bankCount / total) * 100) : 0}%)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Nhận trợ cấp qua thẻ ATM</div>
        </div>
      </div>

      {/* Age Groups Analysis */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
          Phân bổ cơ cấu theo độ tuổi tham gia lực lượng
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {Object.entries(ageGroups).map(([group, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={group} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 font-semibold">{group} tuổi</span>
                <div className="text-lg font-black text-slate-900 mt-1">
                  {count} <span className="text-xs font-normal text-slate-400">({pct}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-red-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seniority & Service Duration Analysis */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Thống kê thâm niên tham gia lực lượng ANTT cơ sở (Căn cứ ngày QĐ của UBND xã)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Tự động tính số ngày, tháng, năm
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {Object.entries(seniorityGroups).map(([group, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={group} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80">
                <span className="text-xs text-amber-900 font-bold">{group}</span>
                <div className="text-lg font-black text-slate-900 mt-1">
                  {count} <span className="text-xs font-normal text-slate-500">({pct}%)</span>
                </div>
                <div className="w-full bg-amber-200/60 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed village table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Bảng thống kê quân số chi tiết theo từng ấp thuộc xã Lai Vung
          </h3>
          <span className="text-[11px] text-slate-300">Đơn vị tính: Đồng chí</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="py-3 px-4">Tên Ấp</th>
                <th className="py-3 px-3 text-center">Tổng quân số</th>
                <th className="py-3 px-3 text-center">Nam</th>
                <th className="py-3 px-3 text-center">Nữ</th>
                <th className="py-3 px-3 text-center">Tổ trưởng</th>
                <th className="py-3 px-3 text-center">Tổ phó</th>
                <th className="py-3 px-3 text-center">Thành viên</th>
                <th className="py-3 px-3 text-center">Đảng viên</th>
                <th className="py-3 px-3 text-center">VNeID M2</th>
                <th className="py-3 px-3 text-center">Có TK Ngân hàng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {diaBanList.map(ap => {
                const list = activeMembers.filter(m => m.ap_id === ap.id);
                return (
                  <tr key={ap.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{ap.ten_ap}</td>
                    <td className="py-3 px-3 text-center font-black text-red-600">{list.length}</td>
                    <td className="py-3 px-3 text-center">{list.filter(m => m.gioi_tinh === 'Nam').length}</td>
                    <td className="py-3 px-3 text-center">{list.filter(m => m.gioi_tinh === 'Nữ').length}</td>
                    <td className="py-3 px-3 text-center font-semibold text-red-700">{list.filter(m => m.chuc_vu === 'Tổ trưởng').length}</td>
                    <td className="py-3 px-3 text-center font-semibold text-blue-700">{list.filter(m => m.chuc_vu === 'Tổ phó').length}</td>
                    <td className="py-3 px-3 text-center font-semibold text-emerald-700">{list.filter(m => isThanhVien(m.chuc_vu)).length}</td>
                    <td className="py-3 px-3 text-center font-semibold text-amber-700">{list.filter(m => m.dang_vien).length}</td>
                    <td className="py-3 px-3 text-center text-emerald-700 font-bold">{list.filter(m => m.vneid_muc_2).length}</td>
                    <td className="py-3 px-3 text-center text-blue-700 font-bold">{list.filter(m => m.co_tai_khoan).length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
