import React, { useState } from 'react';
import { History, Search, RotateCcw, Shield, Clock, User, Filter } from 'lucide-react';
import { AuditLog, AuditActionType } from '../types';
import { formatDateTimeVN } from '../utils/helpers';

interface AuditLogsProps {
  logs: AuditLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [keyword, setKeyword] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const action = log.action || log.hanh_dong;
    const target = log.target || log.doi_tuong;
    const userName = log.userName || log.user_name;
    const details = log.details || log.noi_dung_thay_doi;

    if (filterAction !== 'all' && action !== filterAction) return false;
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      const matchTarget = target?.toLowerCase().includes(q);
      const matchUser = userName?.toLowerCase().includes(q);
      const matchDetails = details?.toLowerCase().includes(q);
      if (!matchTarget && !matchUser && !matchDetails) return false;
    }
    return true;
  });

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'THEM_MOI':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">THÊM MỚI</span>;
      case 'CHINH_SUA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">CHỈNH SỬA</span>;
      case 'XOA_MEM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">XÓA MỀM</span>;
      case 'KHOI_PHUC':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">KHÔI PHỤC</span>;
      case 'XOA_VINH_VIEN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">XÓA VĨNH VIỄN</span>;
      case 'NHAP_EXCEL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">NHẬP EXCEL</span>;
      case 'XUAT_EXCEL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">XUẤT EXCEL</span>;
      case 'DANG_NHAP':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">ĐĂNG NHẬP</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
              NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG (AUDIT LOGS)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
              {filteredLogs.length} sự kiện
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận toàn bộ thao tác thêm, sửa, xóa, xuất/nhập dữ liệu và thời gian của từng cán bộ
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Tìm kiếm nhật ký theo người thực hiện, đối tượng hồ sơ, chi tiết..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
          >
            <option value="all">Tất cả hành động nghiệp vụ</option>
            <option value="THEM_MOI">Thêm mới hồ sơ</option>
            <option value="CHINH_SUA">Chỉnh sửa hồ sơ</option>
            <option value="XOA_MEM">Xóa mềm</option>
            <option value="KHOI_PHUC">Khôi phục hồ sơ</option>
            <option value="XOA_VINH_VIEN">Xóa vĩnh viễn</option>
            <option value="NHAP_EXCEL">Nhập Excel</option>
            <option value="XUAT_EXCEL">Xuất Excel</option>
            <option value="DANG_NHAP">Đăng nhập hệ thống</option>
          </select>

          {(keyword || filterAction !== 'all') && (
            <button
              onClick={() => { setKeyword(''); setFilterAction('all'); }}
              className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-500"
              title="Đặt lại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase">
              <tr>
                <th className="py-3 px-3">Thời gian</th>
                <th className="py-3 px-3">Cán bộ thực hiện</th>
                <th className="py-3 px-3">Vai trò</th>
                <th className="py-3 px-3">Hành động</th>
                <th className="py-3 px-4">Đối tượng tác động</th>
                <th className="py-3 px-4">Chi tiết nội dung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Không có bản ghi nhật ký nào
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const action = log.action || log.hanh_dong;
                  const target = log.target || log.doi_tuong;
                  const userName = log.userName || log.user_name;
                  const userRole = log.userRole || log.user_role;
                  const timestamp = log.timestamp || log.thoi_gian;
                  const details = log.details || log.noi_dung_thay_doi;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">
                        {formatDateTimeVN(timestamp)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {userName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {userRole}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getActionBadge(action)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {target || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {details || '—'}
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
