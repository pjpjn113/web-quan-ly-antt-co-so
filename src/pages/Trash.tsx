import React from 'react';
import { Trash2, RotateCcw, AlertTriangle, ShieldCheck, UserX } from 'lucide-react';
import { NhanSu, DiaBanAp, ToANTT, UserAccount } from '../types';
import { formatDateVN } from '../utils/helpers';
import { maskCCCD } from '../utils/security';

interface TrashProps {
  members: NhanSu[];
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  currentUser: UserAccount;
  onRestore: (m: NhanSu) => void;
  onPermanentDelete: (m: NhanSu) => void;
  onEmptyTrash: () => void;
}

export const Trash: React.FC<TrashProps> = ({
  members,
  diaBanList,
  toANTTList,
  currentUser,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
}) => {
  const apMap = new Map(diaBanList.map(a => [a.id, a.ten_ap]));
  const toMap = new Map(toANTTList.map(t => [t.id, t.ten_to]));

  // Lọc các thành viên đã xóa mềm
  const deletedMembers = members.filter(m => m.trang_thai === 'da_xoa');
  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
              THÙNG RÁC HỒ SƠ NHÂN SỰ (LƯU TRỮ XÓA MỀM)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
              {deletedMembers.length} hồ sơ đã xóa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cơ chế xóa mềm (Soft delete) an toàn, ngăn ngừa thao tác nhầm lẫn và cho phép khôi phục nguyên trạng
          </p>
        </div>

        {deletedMembers.length > 0 && isAdmin && (
          <button
            type="button"
            onClick={onEmptyTrash}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>DỌN SẠCH THÙNG RÁC</span>
          </button>
        )}
      </div>

      {deletedMembers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Thùng rác đang trống</h3>
          <p className="text-xs text-slate-500 mt-1">
            Không có hồ sơ nhân sự nào bị xóa mềm trong cơ sở dữ liệu.
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
                  <th className="py-3 px-3">Số CCCD</th>
                  <th className="py-3 px-3">Chức vụ cũ</th>
                  <th className="py-3 px-3">Địa bàn (Ấp)</th>
                  <th className="py-3 px-3">Thời gian xóa</th>
                  <th className="py-3 px-3 text-center">Thao tác xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deletedMembers.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-600">{member.ma_nhan_su}</td>
                    <td className="py-3 px-4 font-bold text-slate-700 line-through uppercase">
                      {member.ho_ten}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{maskCCCD(member.so_cccd)}</td>
                    <td className="py-3 px-3 text-slate-600">{member.chuc_vu}</td>
                    <td className="py-3 px-3 text-slate-600">{apMap.get(member.ap_id)}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDateVN(member.updated_at)}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => onRestore(member)}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                            title="Khôi phục hồ sơ về danh sách hoạt động"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Khôi phục</span>
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onPermanentDelete(member)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            title="Xóa vĩnh viễn khỏi cơ sở dữ liệu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa hẳn</span>
                          </button>
                        )}
                      </div>
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
