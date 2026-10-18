import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  FileCheck,
  Info
} from 'lucide-react';
import { NhanSu, DiaBanAp, ToANTT, ExcelImportResult } from '../types';
import { excelService } from '../services/excelService';

interface ImportExcelProps {
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  existingMembers: NhanSu[];
  onImportSuccess: (importedMembers: NhanSu[]) => void;
}

export const ImportExcel: React.FC<ImportExcelProps> = ({
  diaBanList,
  toANTTList,
  existingMembers,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const result = await excelService.parseAndValidateExcel(
        selectedFile,
        diaBanList,
        toANTTList,
        existingMembers
      );
      setImportResult(result);
    } catch (err: any) {
      setErrorMessage('Lỗi đọc file Excel: ' + (err?.message || 'Định dạng không hợp lệ hoặc tệp bị lỗi!'));
      setImportResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    excelService.downloadTemplate();
  };

  const handleCommitImport = () => {
    if (!importResult || importResult.validMembers.length === 0) return;
    onImportSuccess(importResult.validMembers);
    setFile(null);
    setImportResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
            NHẬP DỮ LIỆU NHÂN SỰ TỪ EXCEL (.XLSX)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải mẫu biểu chuẩn hóa, kiểm tra trùng lặp CCCD và thêm nhanh danh sách quân số
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>TẢI FILE EXCEL MẪU (.XLSX)</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Upload Zone (Drag and Drop + Click) */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
          isDragOver
            ? 'border-red-500 bg-red-50/50'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
          }}
        />

        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-xs">
          <FileSpreadsheet className="w-8 h-8" />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800">
            {file ? file.name : 'Kéo thả file Excel vào đây hoặc nhấp để chọn file từ máy tính'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Hỗ trợ định dạng .xlsx theo cấu trúc chuẩn của Công an tỉnh Đồng Tháp – Công an xã Lai Vung
          </p>
        </div>

        <button
          type="button"
          className="mt-2 px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
        >
          Chọn file từ máy
        </button>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="p-6 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-red-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">Đang đọc và thẩm định dữ liệu file Excel...</p>
        </div>
      )}

      {/* Import Validation Results */}
      {importResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Tổng số dòng đọc được:</span>
              <div className="text-xl font-black text-slate-900 mt-1">{importResult.totalRows} dòng</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Hồ sơ hợp lệ sẵn sàng nạp:</span>
              </div>
              <div className="text-xl font-black text-emerald-700 mt-1">
                {importResult.validMembers.length} hồ sơ
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-1.5 text-xs text-rose-700 font-bold">
                <XCircle className="w-4 h-4" />
                <span>Hồ sơ lỗi / Trùng CCCD:</span>
              </div>
              <div className="text-xl font-black text-rose-700 mt-1">
                {importResult.errors.length} lỗi
              </div>
            </div>
          </div>

          {/* Error Details List */}
          {importResult.errors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-2">
              <h4 className="font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Chi tiết các dòng bị lỗi (Hệ thống sẽ bỏ qua các dòng này):
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-rose-100">
                {importResult.errors.map((err: { row: number; ho_ten: string; reason: string }, i: number) => (
                  <div key={i} className="pt-1 text-rose-700">
                    <strong>Dòng {err.row}</strong> ({err.ho_ten || 'Không tên'}): {err.reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview of Valid Records */}
          {importResult.validMembers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Xem trước {Math.min(importResult.validMembers.length, 5)} hồ sơ hợp lệ:
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="py-2 px-3">Họ tên</th>
                      <th className="py-2 px-3">Ngày sinh</th>
                      <th className="py-2 px-3">Giới tính</th>
                      <th className="py-2 px-3">CCCD</th>
                      <th className="py-2 px-3">Chức vụ</th>
                      <th className="py-2 px-3">Ấp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importResult.validMembers.slice(0, 5).map((m: NhanSu, i: number) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900 uppercase">{m.ho_ten}</td>
                        <td className="py-2 px-3">{m.ngay_sinh}</td>
                        <td className="py-2 px-3">{m.gioi_tinh}</td>
                        <td className="py-2 px-3 font-mono">{m.so_cccd}</td>
                        <td className="py-2 px-3">{m.chuc_vu}</td>
                        <td className="py-2 px-3">{diaBanList.find(a => a.id === m.ap_id)?.ten_ap || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Button */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setFile(null); setImportResult(null); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy thao tác
                </button>

                <button
                  type="button"
                  id="btn-confirm-import"
                  onClick={handleCommitImport}
                  className="px-6 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>XÁC NHẬN NẠP {importResult.validMembers.length} HỒ SƠ VÀO HỆ THỐNG</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guidelines Accordion */}
      <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-2">
        <h4 className="font-bold flex items-center gap-1.5 text-blue-800">
          <Info className="w-4 h-4" />
          Quy tắc chuẩn hóa dữ liệu khi nhập file Excel:
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
          <li>Cột <strong>Họ tên</strong>, <strong>Ngày sinh (YYYY-MM-DD)</strong>, <strong>Số CCCD (12 chữ số)</strong> là bắt buộc.</li>
          <li>Hệ thống tự động tính tuổi và phân nhóm độ tuổi, không cần nhập tuổi.</li>
          <li>Số CCCD nếu trùng với hồ sơ đã có trên hệ thống hoặc trùng lặp trong file Excel sẽ bị báo lỗi và từ chối nạp.</li>
          <li>Tên Ấp và Tổ ANTT nếu chưa khớp chính xác sẽ tự động được gán vào ấp/tổ đầu tiên trên địa bàn để cán bộ chuẩn hóa sau.</li>
        </ul>
      </div>
    </div>
  );
};
