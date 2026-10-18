import React from 'react';
import { AlertTriangle, Edit2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { NhanSu, DiaBanAp, ToANTT, UserAccount } from '../types';
import { findMissingFields } from '../utils/helpers';
import { maskCCCD } from '../utils/security';

interface ProfilesNeedUpdateProps {
  members: NhanSu[];
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  currentUser: UserAccount;
  onEditMember: (m: NhanSu) => void;
}

export const ProfilesNeedUpdate: React.FC<ProfilesNeedUpdateProps> = ({
  members,
  diaBanList,
  toANTTList,
  currentUser,
  onEditMember,
}) => {
  const apMap = new Map(diaBanList.map(a => [a.id, a.ten_ap]));
  const toMap = new Map(toANTTList.map(t => [t.id, t.ten_to]));

  // Lọc các thành viên đang hoạt động có trường còn thiếu
  const needUpdateList = members
    .filter(m => m.trang_thai === 'dang_hoat_dong')
    .map(m => {
      const missing = findMissingFields(m);
      return { member: m, missing };
    })
    .filter(item => item.missing.length > 0);

  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
              DANH SÁCH HỒ SƠ CẦN BỔ SUNG & CẬP NHẬT THÔNG TIN
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {needUpdateList.length} hồ sơ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Các hồ sơ còn thiếu thông tin số CCCD, tài khoản ngân hàng chi trả trợ cấp, định danh VNeID hoặc thông tin Đảng viên
          </p>
        </div>
      </div>

      {needUpdateList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">100% Hồ sơ đã được hoàn thiện!</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tất cả các thành viên lực lượng ANTT xã Lai Vung đều đã đầy đủ thông tin chuẩn hóa.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-3">STT</th>
                  <th className="py-3 px-3">Mã NS</th>
                  <th className="py-3 px-4">Họ và Tên</th>
                  <th className="py-3 px-3">Chức vụ</th>
                  <th className="py-3 px-3">Ấp quản lý</th>
                  <th className="py-3 px-4">Các thông tin còn thiếu cần bổ sung</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {needUpdateList.map(({ member, missing }, idx) => (
                  <tr key={member.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-3 font-semibold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-red-700">{member.ma_nhan_su}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 uppercase">
                      {member.ho_ten}
                      <div className="text-[10px] text-slate-400 font-normal">
                        CCCD: {maskCCCD(member.so_cccd)}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700">{member.chuc_vu}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {apMap.get(member.ap_id) || 'Chưa gán'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {missing.map((field, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>{field}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => onEditMember(member)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 mx-auto transition shadow-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Bổ sung ngay</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
