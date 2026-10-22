import React, { useState, useEffect, useRef } from 'react';
import { X, Save, AlertCircle, Calendar, ShieldCheck, User, Camera, Upload, Trash2, Image as ImageIcon, Sparkles, Clock } from 'lucide-react';
import { 
  NhanSu, 
  DiaBanAp, 
  ToANTT, 
  Gender, 
  PositionANTT, 
  EducationLevel, 
  ProfessionalLevel,
  MemberStatus 
} from '../types';
import { calculateAge, getAgeGroup, calculateServiceDuration } from '../utils/helpers';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: NhanSu) => void;
  initialData?: NhanSu | null;
  diaBanList: DiaBanAp[];
  toANTTList: ToANTT[];
  existingMembers: NhanSu[];
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  diaBanList,
  toANTTList,
  existingMembers,
}) => {
  const [formData, setFormData] = useState<Partial<NhanSu>>({
    gioi_tinh: 'Nam',
    dan_toc: 'Kinh',
    dan_toc_khac: '',
    biet_tieng_dan_toc: false,
    tieng_dan_toc: '',
    chuc_vu: 'Thành viên',
    chuc_vu_kiem_nhiem: 'Không kiêm nhiệm',
    trinh_do_hoc_van: 'THPT',
    trinh_do_chuyen_mon: 'Chưa qua đào tạo',
    chuyen_nganh: '',
    dang_vien: false,
    co_tai_khoan: false,
    vneid_muc_2: true,
    trang_thai: 'dang_hoat_dong',
    ap_id: diaBanList[0]?.id || '',
    to_antt_id: toANTTList[0]?.id || '',
    ngay_tham_gia_antt: new Date().toISOString().split('T')[0],
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isCustomKiemNhiem, setIsCustomKiemNhiem] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý nạp ảnh chân dung 4x6 chuẩn hồ sơ
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Định dạng tệp không hợp lệ! Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Dung lượng ảnh vượt quá 10MB! Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Tỷ lệ chuẩn 4x6 (2:3) -> 320px x 480px tối ưu tốc độ tải và lưu trữ đám mây
        const targetWidth = 320;
        const targetHeight = 480;
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const targetRatio = targetWidth / targetHeight; // 2/3
          const imgRatio = img.width / img.height;
          let sWidth = img.width;
          let sHeight = img.height;
          let sx = 0;
          let sy = 0;

          if (imgRatio > targetRatio) {
            // Ảnh rộng hơn tỉ lệ 4:6 -> cắt 2 bên đều
            sWidth = img.height * targetRatio;
            sx = (img.width - sWidth) / 2;
          } else {
            // Ảnh cao hơn tỉ lệ 4:6 -> giữ phần trên nhiều hơn để lấy trọn mặt/chân dung
            sHeight = img.width / targetRatio;
            sy = Math.max(0, (img.height - sHeight) * 0.15);
          }

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
          setFormData(prev => ({ ...prev, anh_chan_dung: dataUrl }));
          setErrorMessage('');
        }
      };
      img.onerror = () => {
        setErrorMessage('Không thể đọc dữ liệu ảnh. Vui lòng thử lại với tệp khác.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, anh_chan_dung: undefined }));
  };

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      const standardList = [
        'Không kiêm nhiệm',
        'Tổ trưởng dân phòng',
        'Tổ phó dân phòng',
        'Bí thư chi bộ ấp',
        'Phó Bí thư chi bộ ấp',
        'Phó Trưởng ấp'
      ];
      if (initialData.chuc_vu_kiem_nhiem && !standardList.includes(initialData.chuc_vu_kiem_nhiem)) {
        setIsCustomKiemNhiem(true);
      } else {
        setIsCustomKiemNhiem(false);
      }
    } else {
      // Auto generate code
      const randNum = Math.floor(100 + Math.random() * 900);
      setFormData({
        ma_nhan_su: `ANTT-LV-${randNum}`,
        ho_ten: '',
        ngay_sinh: '',
        gioi_tinh: 'Nam',
        dan_toc: 'Kinh',
        dan_toc_khac: '',
        biet_tieng_dan_toc: false,
        tieng_dan_toc: '',
        que_quan: 'Xã Lai Vung, Tỉnh Đồng Tháp',
        noi_o_hien_nay: '',
        ap_id: diaBanList[0]?.id || '',
        dia_chi_chi_tiet: '',
        to_antt_id: toANTTList[0]?.id || '',
        chuc_vu: 'Thành viên',
        chuc_vu_kiem_nhiem: 'Không kiêm nhiệm',
        trinh_do_hoc_van: 'THPT',
        trinh_do_chuyen_mon: 'Chưa qua đào tạo',
        chuyen_nganh: '',
        so_cccd: '',
        ngay_cap_cccd: '',
        dang_vien: false,
        ngay_vao_dang_du_bi: '',
        ngay_chinh_thuc: '',
        ngay_tham_gia_antt: '2024-07-01',
        so_quyet_dinh: '124/QĐ-UBND',
        so_tai_khoan: '',
        loai_ngan_hang: 'Agribank - Chi nhánh Lai Vung',
        co_tai_khoan: false,
        vneid_muc_2: true,
        so_dien_thoai: '',
        ma_bhyt: '',
        anh_chan_dung: undefined,
        ghi_chu: '',
        trang_thai: 'dang_hoat_dong',
      });
      setIsCustomKiemNhiem(false);
    }
    setErrorMessage('');
  }, [initialData, isOpen, diaBanList, toANTTList]);

  if (!isOpen) return null;

  // Tính tuổi tự động từ ngày sinh
  const age = calculateAge(formData.ngay_sinh);
  const ageGroup = getAgeGroup(age);

  // Tính thâm niên tham gia tự động từ ngày Quyết định của UBND xã
  const serviceDuration = calculateServiceDuration(
    formData.ngay_tham_gia_antt,
    formData.trang_thai === 'da_thoi_viec' ? (formData.ngay_thoi_viec || formData.ngay_quyet_dinh_thoi_viec) : undefined,
    formData.trang_thai === 'da_thoi_viec'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Validation họ tên
    if (!formData.ho_ten || formData.ho_ten.trim() === '') {
      setErrorMessage('Vui lòng nhập Họ và tên thành viên.');
      return;
    }

    // 2. Validation ngày sinh & tuổi
    if (!formData.ngay_sinh) {
      setErrorMessage('Vui lòng chọn ngày tháng năm sinh.');
      return;
    }
    if (age === null || age < 18) {
      setErrorMessage('Thành viên tham gia lực lượng ANTT ở cơ sở phải từ đủ 18 tuổi trở lên!');
      return;
    }

    // 3. Validation CCCD không được trùng
    if (!formData.so_cccd || formData.so_cccd.trim() === '') {
      setErrorMessage('Vui lòng nhập số Căn cước công dân (CCCD).');
      return;
    }
    const cleanCCCD = formData.so_cccd.trim().replace(/\D/g, '');
    if (cleanCCCD.length !== 12 && cleanCCCD.length !== 9) {
      setErrorMessage('Số CCCD phải gồm 12 chữ số (hoặc 9 số với CMND cũ).');
      return;
    }

    const duplicate = existingMembers.find(
      m => m.id !== formData.id && m.trang_thai !== 'da_xoa' && m.so_cccd?.trim() === cleanCCCD
    );
    if (duplicate) {
      setErrorMessage(`Số CCCD "${cleanCCCD}" đã tồn tại trên hồ sơ của "${duplicate.ho_ten}" (${duplicate.ma_nhan_su})! Không được phép trùng lặp CCCD.`);
      return;
    }

    // 4. Validation Đảng viên
    if (formData.dang_vien && (!formData.ngay_vao_dang_du_bi || !formData.ngay_chinh_thuc)) {
      setErrorMessage('Là Đảng viên thì phải nhập đầy đủ ngày vào Đảng dự bị và ngày chính thức.');
      return;
    }

    // 5. Validation Ngân hàng
    if (formData.co_tai_khoan && (!formData.so_tai_khoan || !formData.loai_ngan_hang)) {
      setErrorMessage('Vui lòng nhập tên Ngân hàng và Số tài khoản nhận phụ cấp.');
      return;
    }

    // 6. Dân tộc khác
    if (formData.dan_toc === 'Khác' && !formData.dan_toc_khac?.trim()) {
      setErrorMessage('Vui lòng ghi rõ tên dân tộc khác.');
      return;
    }

    // 7. Biết tiếng dân tộc
    if (formData.biet_tieng_dan_toc && !formData.tieng_dan_toc?.trim()) {
      setErrorMessage('Vui lòng ghi rõ tiếng dân tộc thiểu số mà thành viên biết.');
      return;
    }

    const memberToSave: NhanSu = {
      ...(formData as NhanSu),
      id: formData.id || 'ns_' + Date.now(),
      stt: formData.stt || 0,
      so_cccd: cleanCCCD,
      created_at: formData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(memberToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        id="member-form-modal"
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/30 border border-red-500/40 text-amber-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                {initialData ? 'CHỈNH SỬA HỒ SƠ NHÂN SỰ ANTT' : 'THÊM MỚI THÀNH VIÊN LỰC LƯỢNG ANTT CƠ SỞ'}
              </h3>
              <p className="text-xs text-slate-300">
                Công an tỉnh Đồng Tháp – Công an xã Lai Vung
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Thông tin cá nhân cơ bản
              </h4>
            </div>

            {/* Khung tải ảnh chân dung 4x6 chuẩn hồ sơ ANTT */}
            <div className="bg-gradient-to-r from-slate-50 via-slate-50 to-emerald-50/40 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* 4x6 Frame Preview */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative group w-32 h-[192px] shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                    formData.anh_chan_dung
                      ? 'border-emerald-500 shadow-md bg-white ring-2 ring-emerald-500/20'
                      : isDragging
                      ? 'border-red-500 bg-red-50/50 scale-[1.02]'
                      : 'border-dashed border-slate-300 hover:border-red-500 bg-white hover:bg-slate-50 shadow-2xs'
                  }`}
                  title="Nhấn hoặc kéo thả để tải ảnh chân dung 4x6"
                >
                  {formData.anh_chan_dung ? (
                    <>
                      <img
                        src={formData.anh_chan_dung}
                        alt="Ảnh thẻ 4x6"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity gap-1.5 p-2 text-center">
                        <Camera className="w-6 h-6 text-amber-300" />
                        <span className="text-[10px] font-bold">Thay ảnh 4x6 khác</span>
                      </div>
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-extrabold text-amber-300 border border-white/20">
                        4x6 CM
                      </span>
                    </>
                  ) : (
                    <div className="p-3 text-center flex flex-col items-center justify-center gap-1.5 text-slate-400 group-hover:text-red-600 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-red-50 flex items-center justify-center text-slate-500 group-hover:text-red-600 transition-colors shadow-2xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Tải ảnh 4x6</span>
                      <span className="text-[10px] text-slate-400 leading-tight">Nhấn hoặc kéo thả tệp ảnh vào đây</span>
                      <span className="mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                        Tỷ lệ 2:3
                      </span>
                    </div>
                  )}
                </div>

                {/* Hướng dẫn và Nút bấm */}
                <div className="flex-1 flex flex-col justify-between self-stretch text-xs space-y-2.5 text-center sm:text-left">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h5 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-700" />
                        Ảnh chân dung thành viên (Tiêu chuẩn 4x6)
                      </h5>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Quy chuẩn hồ sơ ANTT
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                      Phục vụ quản lý hồ sơ nhân sự, in trích lục lý lịch, cấp thẻ thành viên lực lượng ANTT cơ sở và nhận diện phục vụ tuần tra.
                    </p>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>Định dạng: JPG, PNG, WEBP (tối đa 10MB)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>Tự động căn giữa chuẩn 4x6 (400x600 px)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>Tự nén dung lượng, lưu trữ mượt mà không nặng máy</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>Chụp thẳng, trang phục chỉnh tề hoặc đồng phục ANTT</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.anh_chan_dung ? 'Tải ảnh khác thay thế' : 'Chọn ảnh chân dung 4x6 từ máy'}</span>
                    </button>

                    {formData.anh_chan_dung && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3.5 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa ảnh</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Họ tên */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Hùng"
                  value={formData.ho_ten || ''}
                  onChange={e => setFormData({ ...formData, ho_ten: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Mã nhân sự */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã nhân sự
                </label>
                <input
                  type="text"
                  value={formData.ma_nhan_su || ''}
                  onChange={e => setFormData({ ...formData, ma_nhan_su: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-600 font-mono"
                />
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gioi_tinh || 'Nam'}
                  onChange={e => setFormData({ ...formData, gioi_tinh: e.target.value as Gender })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.ngay_sinh || ''}
                  onChange={e => setFormData({ ...formData, ngay_sinh: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-red-500"
                />
              </div>

              {/* Tự động tính tuổi & Phân nhóm tuổi (READ ONLY) */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tuổi tự động (Hệ thống tính)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-red-600">
                    {age !== null ? `${age} tuổi` : '—'}
                  </span>
                  {age !== null && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 text-red-800">
                      Nhóm: {ageGroup}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">Không cho nhập tuổi thủ công</span>
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại liên lạc
                </label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 0918123456"
                  value={formData.so_dien_thoai || ''}
                  onChange={e => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* Số CCCD */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số CCCD (12 chữ số) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={12}
                  required
                  placeholder="0870XXXXXXXX"
                  value={formData.so_cccd || ''}
                  onChange={e => setFormData({ ...formData, so_cccd: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">Kiểm tra không trùng CCCD toàn hệ thống</span>
              </div>

              {/* Ngày cấp CCCD */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày cấp CCCD
                </label>
                <input
                  type="date"
                  value={formData.ngay_cap_cccd || ''}
                  onChange={e => setFormData({ ...formData, ngay_cap_cccd: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* VNeID mức 2 */}
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.vneid_muc_2}
                    onChange={e => setFormData({ ...formData, vneid_muc_2: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Đã kích hoạt VNeID Mức 2
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Dân tộc & Ngôn ngữ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Dân tộc và Ngôn ngữ
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dân tộc
                </label>
                <select
                  value={formData.dan_toc || 'Kinh'}
                  onChange={e => setFormData({ ...formData, dan_toc: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Kinh">Kinh</option>
                  <option value="Khmer">Khmer</option>
                  <option value="Hoa">Hoa</option>
                  <option value="Chăm">Chăm</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Hiển thị trường Dân tộc khác nếu chọn Khác */}
              {formData.dan_toc === 'Khác' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên dân tộc khác <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên dân tộc cụ thể"
                    value={formData.dan_toc_khac || ''}
                    onChange={e => setFormData({ ...formData, dan_toc_khac: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-amber-300 bg-amber-50/40 rounded-lg"
                  />
                </div>
              )}

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.biet_tieng_dan_toc}
                    onChange={e => setFormData({ ...formData, biet_tieng_dan_toc: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Biết tiếng dân tộc thiểu số
                  </span>
                </label>
              </div>

              {/* Hiển thị tên tiếng dân tộc nếu có */}
              {formData.biet_tieng_dan_toc && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên tiếng dân tộc cụ thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Tiếng Khmer, Tiếng Hoa..."
                    value={formData.tieng_dan_toc || ''}
                    onChange={e => setFormData({ ...formData, tieng_dan_toc: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-blue-300 bg-blue-50/40 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Địa bàn cư trú & Phân công công tác */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Địa bàn cư trú và Phân công Tổ ANTT
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Thuộc Ấp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa bàn (Ấp) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ap_id || ''}
                  onChange={e => setFormData({ ...formData, ap_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {diaBanList.map(ap => (
                    <option key={ap.id} value={ap.id}>
                      {ap.ten_ap} ({ap.ma_ap})
                    </option>
                  ))}
                </select>
              </div>

              {/* Thuộc Tổ ANTT */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tổ ANTT cơ sở <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.to_antt_id || ''}
                  onChange={e => setFormData({ ...formData, to_antt_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {toANTTList.map(to => (
                    <option key={to.id} value={to.id}>
                      {to.ten_to} ({to.ma_to})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chức vụ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chức vụ ANTT <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.chuc_vu || 'Thành viên'}
                  onChange={e => setFormData({ ...formData, chuc_vu: e.target.value as PositionANTT })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-bold text-slate-800"
                >
                  <option value="Tổ trưởng">Tổ trưởng</option>
                  <option value="Tổ phó">Tổ phó</option>
                  <option value="Thành viên">Thành viên (Tổ viên)</option>
                  <option value="Tổ viên">Tổ viên</option>
                </select>
              </div>

              {/* Chức vụ kiêm nhiệm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Chức vụ kiêm nhiệm</span>
                  <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                    Dân phòng / Chi bộ / Ấp
                  </span>
                </label>
                <select
                  value={
                    isCustomKiemNhiem
                      ? 'Khác'
                      : (formData.chuc_vu_kiem_nhiem || 'Không kiêm nhiệm')
                  }
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'Khác') {
                      setIsCustomKiemNhiem(true);
                      setFormData({ ...formData, chuc_vu_kiem_nhiem: '' });
                    } else {
                      setIsCustomKiemNhiem(false);
                      setFormData({ ...formData, chuc_vu_kiem_nhiem: val });
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Không kiêm nhiệm">-- Không kiêm nhiệm --</option>
                  <option value="Tổ trưởng dân phòng">Tổ trưởng dân phòng</option>
                  <option value="Tổ phó dân phòng">Tổ phó dân phòng</option>
                  <option value="Bí thư chi bộ ấp">Bí thư chi bộ ấp</option>
                  <option value="Phó Bí thư chi bộ ấp">Phó Bí thư chi bộ ấp</option>
                  <option value="Phó Trưởng ấp">Phó Trưởng ấp</option>
                  <option value="Khác">Chức vụ kiêm nhiệm khác...</option>
                </select>
              </div>

              {/* Nếu chọn chức vụ kiêm nhiệm khác */}
              {isCustomKiemNhiem && (
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ghi rõ chức vụ kiêm nhiệm khác <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Bí thư Chi đoàn ấp, Chi hội trưởng CCB..."
                    value={formData.chuc_vu_kiem_nhiem === 'Không kiêm nhiệm' ? '' : (formData.chuc_vu_kiem_nhiem || '')}
                    onChange={e => setFormData({ ...formData, chuc_vu_kiem_nhiem: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-indigo-300 bg-indigo-50/40 rounded-lg font-medium text-slate-900 focus:bg-white"
                  />
                </div>
              )}

              {/* Quê quán */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quê quán
                </label>
                <input
                  type="text"
                  value={formData.que_quan || ''}
                  onChange={e => setFormData({ ...formData, que_quan: e.target.value })}
                  placeholder="Xã Lai Vung, Tỉnh Đồng Tháp"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* Nơi ở hiện nay */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nơi ở hiện nay
                </label>
                <input
                  type="text"
                  value={formData.noi_o_hien_nay || ''}
                  onChange={e => setFormData({ ...formData, noi_o_hien_nay: e.target.value })}
                  placeholder="Ví dụ: Tổ 3, Ấp An Bình, Xã Lai Vung"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* Địa chỉ chi tiết */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ chi tiết (Số nhà, đường, ngõ)
                </label>
                <input
                  type="text"
                  value={formData.dia_chi_chi_tiet || ''}
                  onChange={e => setFormData({ ...formData, dia_chi_chi_tiet: e.target.value })}
                  placeholder="Số nhà, hẻm, mốc dễ tìm"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* Quyết định thành lập / tham gia */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày QĐ tham gia ANTT cơ sở (UBND xã)
                </label>
                <input
                  type="date"
                  value={formData.ngay_tham_gia_antt || ''}
                  onChange={e => setFormData({ ...formData, ngay_tham_gia_antt: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <span className="text-[10px] text-slate-400">Căn cứ tính thâm niên công tác</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số Quyết định của UBND xã
                </label>
                <input
                  type="text"
                  value={formData.so_quyet_dinh || ''}
                  onChange={e => setFormData({ ...formData, so_quyet_dinh: e.target.value })}
                  placeholder="124/QĐ-UBND"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-medium"
                />
                <span className="text-[10px] text-slate-400">Dạng: .../QĐ-UBND</span>
              </div>

              {/* Tự động tính thâm niên tham gia */}
              <div className="sm:col-span-2 md:col-span-1 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Thời gian tham gia (Hệ thống tự tính)</span>
                </label>
                {serviceDuration && serviceDuration.isValid ? (
                  <div>
                    <div className="text-xs font-black text-red-700">
                      {serviceDuration.formattedText}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">
                      Tổng số ngày: <strong className="font-mono text-slate-800">{serviceDuration.totalDays.toLocaleString('vi-VN')} ngày</strong>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">
                    {formData.ngay_tham_gia_antt ? 'Ngày QĐ không hợp lệ' : 'Chọn ngày để tự động tính số ngày, tháng, năm'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Trình độ & Chuyên môn */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                4. Trình độ học vấn & Chuyên môn
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trình độ học vấn
                </label>
                <select
                  value={formData.trinh_do_hoc_van || 'THPT'}
                  onChange={e => setFormData({ ...formData, trinh_do_hoc_van: e.target.value as EducationLevel })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="THPT">THPT (12/12)</option>
                  <option value="THCS">THCS (9/12)</option>
                  <option value="Tiểu học">Tiểu học</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trình độ chuyên môn
                </label>
                <select
                  value={formData.trinh_do_chuyen_mon || 'Chưa qua đào tạo'}
                  onChange={e => setFormData({ ...formData, trinh_do_chuyen_mon: e.target.value as ProfessionalLevel })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Chưa qua đào tạo">Chưa qua đào tạo</option>
                  <option value="Sơ cấp">Sơ cấp</option>
                  <option value="Trung cấp">Trung cấp</option>
                  <option value="Cao đẳng">Cao đẳng</option>
                  <option value="Đại học">Đại học</option>
                  <option value="Sau đại học">Sau đại học</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chuyên ngành đào tạo
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Quân sự, Luật, CNTT, Nông nghiệp..."
                  value={formData.chuyen_nganh || ''}
                  onChange={e => setFormData({ ...formData, chuyen_nganh: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Thông tin Đảng viên */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  5. Thông tin Đảng viên
                </h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.dang_vien}
                  onChange={e => setFormData({ ...formData, dang_vien: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-amber-700">Là Đảng viên</span>
              </label>
            </div>

            {/* Nếu Đảng viên = Có thì hiển thị ngày dự bị và ngày chính thức */}
            {formData.dang_vien && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày vào Đảng dự bị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.ngay_vao_dang_du_bi || ''}
                    onChange={e => setFormData({ ...formData, ngay_vao_dang_du_bi: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày vào Đảng chính thức <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.ngay_chinh_thuc || ''}
                    onChange={e => setFormData({ ...formData, ngay_chinh_thuc: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Tài khoản ngân hàng chi trả phụ cấp */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  6. Tài khoản ngân hàng nhận phụ cấp hằng tháng
                </h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.co_tai_khoan}
                  onChange={e => setFormData({ ...formData, co_tai_khoan: e.target.checked })}
                  className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500"
                />
                <span className="text-xs font-bold text-cyan-800">Có tài khoản ngân hàng</span>
              </label>
            </div>

            {/* Nếu Có tài khoản = Có thì hiển thị ngân hàng và số tài khoản */}
            {formData.co_tai_khoan && (
              <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên ngân hàng / Chi nhánh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Agribank Chi nhánh Lai Vung"
                    value={formData.loai_ngan_hang || ''}
                    onChange={e => setFormData({ ...formData, loai_ngan_hang: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-cyan-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số tài khoản ngân hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập số tài khoản chính chủ"
                    value={formData.so_tai_khoan || ''}
                    onChange={e => setFormData({ ...formData, so_tai_khoan: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-cyan-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Mã Bảo hiểm y tế */}
            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã số thẻ Bảo hiểm y tế (BHYT)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: BA 4828720101437, GD 4828723011489..."
                value={formData.ma_bhyt || ''}
                onChange={e => setFormData({ ...formData, ma_bhyt: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono uppercase"
              />
              <span className="text-[10px] text-slate-400">Mã thẻ BHYT được cấp phục vụ chế độ chính sách theo Luật Lực lượng tham gia bảo vệ ANTT ở cơ sở</span>
            </div>
          </div>

          {/* Ghi chú & Trạng thái */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú đặc điểm nhân thân / nhiệm vụ
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm về thành viên..."
                  value={formData.ghi_chu || ''}
                  onChange={e => setFormData({ ...formData, ghi_chu: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trạng thái hồ sơ
                </label>
                <select
                  value={formData.trang_thai || 'dang_hoat_dong'}
                  onChange={e => setFormData({ ...formData, trang_thai: e.target.value as MemberStatus })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="dang_hoat_dong">Đang hoạt động</option>
                  <option value="tam_nghi">Tạm nghỉ</option>
                  <option value="da_thoi_viec">Đã thôi việc (Có QĐ UBND xã)</option>
                </select>
              </div>
            </div>

            {/* Khối thông tin Quyết định thôi việc nếu trạng thái là Đã thôi việc */}
            {formData.trang_thai === 'da_thoi_viec' && (
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-red-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <h5 className="text-xs font-bold text-red-900 uppercase tracking-wide">
                    Quyết định cho thôi tham gia lực lượng ANTT cơ sở (UBND cấp xã)
                  </h5>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Số Quyết định nghỉ <span className="text-red-600">*</span>
                    </label>
                    <div className="flex items-center rounded-lg border border-red-300 bg-white overflow-hidden shadow-2xs">
                      <input
                        type="text"
                        placeholder="VD: 45 hoặc 45/2024"
                        value={formData.so_quyet_dinh_thoi_viec?.replace(/\/QĐ-UBND$/i, '') || ''}
                        onChange={e => {
                          const val = e.target.value.trim();
                          setFormData({ 
                            ...formData, 
                            so_quyet_dinh_thoi_viec: val ? `${val}/QĐ-UBND` : '' 
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs outline-none font-semibold text-slate-900"
                      />
                      <span className="px-2 py-1.5 bg-red-100 text-red-800 text-[10px] font-extrabold border-l border-red-200">
                        /QĐ-UBND
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Ngày ký ban hành QĐ
                    </label>
                    <input
                      type="date"
                      value={formData.ngay_quyet_dinh_thoi_viec || ''}
                      onChange={e => setFormData({ ...formData, ngay_quyet_dinh_thoi_viec: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-red-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Ngày chính thức thôi việc
                    </label>
                    <input
                      type="date"
                      value={formData.ngay_thoi_viec || ''}
                      onChange={e => setFormData({ ...formData, ngay_thoi_viec: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-red-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Cơ quan ban hành
                    </label>
                    <input
                      type="text"
                      value={formData.co_quan_ban_hanh_thoi_viec || 'UBND xã Lai Vung'}
                      onChange={e => setFormData({ ...formData, co_quan_ban_hanh_thoi_viec: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-red-300 rounded-lg bg-white"
                      placeholder="UBND xã Lai Vung"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Lý do cho thôi tham gia theo quyết định
                  </label>
                  <input
                    type="text"
                    value={formData.ly_do_thoi_viec || ''}
                    onChange={e => setFormData({ ...formData, ly_do_thoi_viec: e.target.value })}
                    placeholder="VD: Có đơn xin thôi tham gia theo nguyện vọng cá nhân; chuyển nơi cư trú..."
                    className="w-full px-3 py-1.5 text-xs border border-red-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            (*) Các trường bắt buộc phải nhập đúng quy định
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              id="btn-save-member"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'CẬP NHẬT HỒ SƠ' : 'LƯU HỒ SƠ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
