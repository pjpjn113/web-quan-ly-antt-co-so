import React, { useState } from 'react';
import { ShieldAlert, Plus, Edit2, Trash2, Users, Save, X, AlertCircle, MapPin } from 'lucide-react';
import { ToANTT, DiaBanAp, NhanSu, UserAccount } from '../types';

interface TeamsProps {
  toANTTList: ToANTT[];
  diaBanList: DiaBanAp[];
  members: NhanSu[];
  currentUser: UserAccount;
  onSaveTeam: (team: ToANTT) => void;
  onDeleteTeam: (teamId: string) => void;
  onViewTeamMembers: (teamId: string) => void;
}

export const Teams: React.FC<TeamsProps> = ({
  toANTTList,
  diaBanList,
  members,
  currentUser,
  onSaveTeam,
  onDeleteTeam,
  onViewTeamMembers,
}) => {
  const [editingTeam, setEditingTeam] = useState<Partial<ToANTT> | null>(null);
  const [error, setError] = useState('');

  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
  const apMap = new Map(diaBanList.map(a => [a.id, a.ten_ap]));

  const handleOpenAdd = () => {
    const nextNum = toANTTList.length + 1;
    setEditingTeam({
      ma_to: `TO-ANTT-0${nextNum}`,
      ten_to: `Tổ ANTT Cơ sở Ấp ${diaBanList[0]?.ten_ap.replace('Ấp ', '') || nextNum}`,
      ap_id: diaBanList[0]?.id || '',
      ghi_chu: 'Thành lập theo Luật Lực lượng tham gia bảo vệ ANTT ở cơ sở',
    });
    setError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam?.ten_to?.trim() || !editingTeam?.ma_to?.trim() || !editingTeam?.ap_id) {
      setError('Vui lòng nhập đầy đủ Mã tổ, Tên tổ và chọn Ấp trực thuộc!');
      return;
    }

    const teamToSave: ToANTT = {
      id: editingTeam.id || 'to_' + Date.now(),
      ma_to: editingTeam.ma_to.trim().toUpperCase(),
      ten_to: editingTeam.ten_to.trim(),
      ap_id: editingTeam.ap_id,
      ghi_chu: editingTeam.ghi_chu?.trim() || '',
      trang_thai: editingTeam.trang_thai || 'hoat_dong',
      created_at: editingTeam.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSaveTeam(teamToSave);
    setEditingTeam(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
              QUẢN LÝ TỔ BẢO VỆ ANTT Ở CƠ SỞ
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {toANTTList.length} tổ công tác
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi tổ gồm Tổ trưởng, Tổ phó và các Tổ viên phụ trách từng địa bàn dân cư
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            id="btn-add-team"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>THÀNH LẬP TỔ MỚI</span>
          </button>
        )}
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toANTTList.map(to => {
          const teamMembers = members.filter(m => m.to_antt_id === to.id && m.trang_thai === 'dang_hoat_dong');
          const toTruong = teamMembers.find(m => m.chuc_vu === 'Tổ trưởng');
          const toPho = teamMembers.find(m => m.chuc_vu === 'Tổ phó');
          const thanhVien = teamMembers.filter(m => m.chuc_vu === 'Thành viên');

          return (
            <div
              key={to.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {to.ten_to}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {to.ma_to}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {apMap.get(to.ap_id) || 'Chưa gán ấp'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => setEditingTeam(to)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Chỉnh sửa tổ"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTeam(to.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Giải thể / Xóa tổ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Team Roster details */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                    <span className="text-slate-600 font-semibold">Tổng số thành viên:</span>
                    <span className="font-extrabold text-indigo-700">{teamMembers.length} đồng chí</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tổ trưởng:</span>
                    <span className="font-bold text-red-700">
                      {toTruong ? toTruong.ho_ten : <em className="text-slate-400 font-normal">Chưa phân công</em>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tổ phó:</span>
                    <span className="font-bold text-blue-700">
                      {toPho ? toPho.ho_ten : <em className="text-slate-400 font-normal">Chưa phân công</em>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tổ viên:</span>
                    <span className="font-semibold text-slate-800">
                      {thanhVien.length} đồng chí
                    </span>
                  </div>

                  {to.ghi_chu && (
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-200/60">
                      {to.ghi_chu}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onViewTeamMembers(to.id)}
                  className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Danh sách {teamMembers.length} thành viên</span>
                </button>
                <span className="text-[10px] text-slate-400">Luật số 30/2023/QH15</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Add Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase">
                {editingTeam.id ? 'CHỈNH SỬA TỔ ANTT CƠ SỞ' : 'THÀNH LẬP TỔ ANTT CƠ SỞ MỚI'}
              </h3>
              <button
                onClick={() => setEditingTeam(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã Tổ ANTT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: TO-ANTT-01"
                  value={editingTeam.ma_to || ''}
                  onChange={e => setEditingTeam({ ...editingTeam, ma_to: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Tổ ANTT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tổ ANTT Cơ sở Ấp Long Hòa"
                  value={editingTeam.ten_to || ''}
                  onChange={e => setEditingTeam({ ...editingTeam, ten_to: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa bàn (Ấp) đảm nhiệm <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={editingTeam.ap_id || ''}
                  onChange={e => setEditingTeam({ ...editingTeam, ap_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {diaBanList.map(ap => (
                    <option key={ap.id} value={ap.id}>{ap.ten_ap} ({ap.ma_ap})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú nhiệm vụ
                </label>
                <textarea
                  rows={3}
                  placeholder="Khu vực chốt trực, địa bàn phụ trách..."
                  value={editingTeam.ghi_chu || ''}
                  onChange={e => setEditingTeam({ ...editingTeam, ghi_chu: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Tổ ANTT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
