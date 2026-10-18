import React, { useState, useMemo } from 'react';
import { MapPin, Plus, Edit2, Trash2, Users, Save, X, AlertCircle, Search, Layers } from 'lucide-react';
import { DiaBanAp, NhanSu, UserAccount } from '../types';

interface TerritoriesProps {
  diaBanList: DiaBanAp[];
  members: NhanSu[];
  currentUser: UserAccount;
  onSaveAp: (ap: DiaBanAp) => void;
  onDeleteAp: (apId: string) => void;
  onViewApMembers: (apId: string) => void;
}

export const Territories: React.FC<TerritoriesProps> = ({
  diaBanList,
  members,
  currentUser,
  onSaveAp,
  onDeleteAp,
  onViewApMembers,
}) => {
  const [editingAp, setEditingAp] = useState<Partial<DiaBanAp> | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<'ALL' | 'AN' | 'TAN'>('ALL');

  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  const filteredDiaBan = useMemo(() => {
    return diaBanList.filter(ap => {
      const matchSearch =
        searchTerm.trim() === '' ||
        ap.ten_ap.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        ap.ma_ap.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (ap.mo_ta && ap.mo_ta.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      if (!matchSearch) return false;

      if (filterGroup === 'AN') {
        return ap.ten_ap.toLowerCase().includes('an ');
      }
      if (filterGroup === 'TAN') {
        return ap.ten_ap.toLowerCase().includes('tân ');
      }
      return true;
    });
  }, [diaBanList, searchTerm, filterGroup]);

  const handleOpenAdd = () => {
    const nextNum = diaBanList.length + 1;
    setEditingAp({
      ma_ap: `AP-LV-0${nextNum}`,
      ten_ap: '',
      ghi_chu: 'Địa bàn phụ trách ANTT xã Lai Vung',
    });
    setError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAp?.ten_ap?.trim() || !editingAp?.ma_ap?.trim()) {
      setError('Vui lòng nhập Mã ấp và Tên ấp!');
      return;
    }

    const apToSave: DiaBanAp = {
      id: editingAp.id || 'ap_' + Date.now(),
      ma_ap: editingAp.ma_ap.trim().toUpperCase(),
      ten_ap: editingAp.ten_ap.trim(),
      ghi_chu: editingAp.ghi_chu?.trim() || '',
      trang_thai: editingAp.trang_thai || 'hoat_dong',
      created_at: editingAp.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSaveAp(apToSave);
    setEditingAp(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
              QUẢN LÝ ĐỊA BÀN (ẤP) – XÃ LAI VUNG
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {diaBanList.length} địa bàn
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh mục các ấp trực thuộc xã Lai Vung phân bổ lực lượng bảo vệ an ninh trật tự
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            id="btn-add-ap"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>THÊM ẤP MỚI</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterGroup('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterGroup === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tất cả 19 Ấp</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterGroup('AN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterGroup === 'AN'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <span>Cụm Ấp An (8 ấp)</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterGroup('TAN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterGroup === 'TAN'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>Cụm Ấp Tân (11 ấp)</span>
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên ấp, mã ấp..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Grid Cards of Territories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDiaBan.map(ap => {
          const apMembers = members.filter(m => m.ap_id === ap.id && m.trang_thai !== 'da_xoa');
          const toTruong = apMembers.find(m => m.chuc_vu === 'Tổ trưởng');

          return (
            <div
              key={ap.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {ap.ten_ap}
                      </h3>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {ap.ma_ap}
                      </span>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => setEditingAp(ap)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Sửa tên ấp"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAp(ap.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xóa ấp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Quân số ANTT tại ấp:</span>
                    <span className="font-extrabold text-slate-900">{apMembers.length} đồng chí</span>
                  </div>

                  {toTruong && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tổ trưởng phụ trách:</span>
                      <span className="font-bold text-red-700 truncate max-w-[140px]">{toTruong.ho_ten}</span>
                    </div>
                  )}

                  {ap.ghi_chu && (
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-200/60">
                      {ap.ghi_chu}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onViewApMembers(ap.id)}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Xem {apMembers.length} thành viên</span>
                </button>
                <span className="text-[10px] text-slate-400">Xã Lai Vung</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Add Modal */}
      {editingAp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase">
                {editingAp.id ? 'CHỈNH SỬA ĐỊA BÀN (ẤP)' : 'THÊM MỚI ĐỊA BÀN (ẤP)'}
              </h3>
              <button
                onClick={() => setEditingAp(null)}
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
                  Mã địa bàn (Mã ấp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: AP-LV-01"
                  value={editingAp.ma_ap || ''}
                  onChange={e => setEditingAp({ ...editingAp, ma_ap: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên địa bàn (Tên ấp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ấp Long Hòa"
                  value={editingAp.ten_ap || ''}
                  onChange={e => setEditingAp({ ...editingAp, ten_ap: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú đặc điểm địa bàn
                </label>
                <textarea
                  rows={3}
                  placeholder="Vị trí, ranh giới hoặc đặc điểm an ninh..."
                  value={editingAp.ghi_chu || ''}
                  onChange={e => setEditingAp({ ...editingAp, ghi_chu: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu địa bàn</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
