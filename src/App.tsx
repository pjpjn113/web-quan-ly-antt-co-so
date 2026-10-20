import React, { useState, useEffect, useCallback } from 'react';
import { 
  NhanSu, 
  DiaBanAp, 
  ToANTT, 
  UserAccount, 
  ToastNotification, 
  FilterParams,
  DismissMemberData
} from './types';
import { storageService } from './services/storage';
import { sessionDataCache } from './services/sessionDataCache';
import { supabase, SUPABASE_TABLES } from './services/supabaseClient';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { ConfirmModal } from './components/common/ConfirmModal';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Territories } from './pages/Territories';
import { Teams } from './pages/Teams';
import { AdvancedSearch } from './pages/AdvancedSearch';
import { ImportExcel } from './pages/ImportExcel';
import { ExportData } from './pages/ExportData';
import { Reports } from './pages/Reports';
import { ProfilesNeedUpdate } from './pages/ProfilesNeedUpdate';
import { Trash } from './pages/Trash';
import { AuditLogs } from './pages/AuditLogs';
import { BackupRestore } from './pages/BackupRestore';
import { PatrolManagement } from './pages/PatrolManagement';
import { TrainingManagement } from './pages/TrainingManagement';
import { AwardsManagement } from './pages/AwardsManagement';
import { MemberFormModal } from './pages/MemberFormModal';
import { MemberDetailModal } from './pages/MemberDetailModal';
import { DismissMemberModal } from './components/members/DismissMemberModal';
import { DismissalDecisionModal } from './components/members/DismissalDecisionModal';
import { findMissingFields } from './utils/helpers';

export default function App() {
  // Current logged in user
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Main data states
  const [members, setMembers] = useState<NhanSu[]>([]);
  const [diaBanList, setDiaBanList] = useState<DiaBanAp[]>([]);
  const [toANTTList, setToANTTList] = useState<ToANTT[]>([]);
  const [auditLogs, setAuditLogs] = useState(storageService.getAuditLogs());

  // Navigation & layout states
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [memberFilter, setMemberFilter] = useState<Partial<FilterParams> | undefined>(undefined);

  // Modals & UI states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<NhanSu | null>(null);
  const [viewingMember, setViewingMember] = useState<NhanSu | null>(null);
  const [appDismissMember, setAppDismissMember] = useState<NhanSu | null>(null);
  const [appDecisionMember, setAppDecisionMember] = useState<NhanSu | null>(null);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    secondaryConfirmLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
    onSecondaryConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Load / Reload all data from localStorage
  const loadData = useCallback(() => {
    setMembers(storageService.getMembers());
    setDiaBanList(storageService.getDiaBan());
    setToANTTList(storageService.getToANTT());
    setAuditLogs(storageService.getAuditLogs());
    const storedUser = storageService.getCurrentUser();
    if (storedUser) {
      setCurrentUser(prev => {
        if (
          prev &&
          prev.id === storedUser.id &&
          prev.username === storedUser.username &&
          prev.email === storedUser.email &&
          prev.fullName === storedUser.fullName &&
          prev.role === storedUser.role &&
          prev.chucVu === storedUser.chucVu &&
          prev.donVi === storedUser.donVi &&
          prev.soDienThoai === storedUser.soDienThoai &&
          prev.createdAt === storedUser.createdAt
        ) {
          return prev;
        }
        return storedUser;
      });
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    const unsub = storageService.subscribeDataRefresh(loadData);

    // Đồng bộ phiên đăng nhập từ Supabase Auth
    const syncAuthSession = async () => {
      try {
        const generation = sessionDataCache.generation;
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (disposed || generation !== sessionDataCache.generation) return;
        const session = !authError && authData.user ? { user: authData.user } : null;
        if (session?.user) {
          const { data: profile } = await supabase
            .from(SUPABASE_TABLES.USERS)
            .select('id, username, full_name, role, chuc_vu, don_vi, so_dien_thoai, created_at, raw_data')
            .eq('id', session.user.id)
            .maybeSingle();

          if (disposed || generation !== sessionDataCache.generation) return;
          if (profile) {
            const existingUser = storageService.getCurrentUser();
            const user = storageService.fromUserRow(profile, {
              id: session.user.id,
              username: session.user.email?.split('@')[0] || existingUser?.username || 'canbo',
              email: session.user.email || existingUser?.email,
              fullName: session.user.user_metadata?.full_name || existingUser?.fullName || 'Cán bộ Công an',
              role: 'VIEWER',
              chucVu: existingUser?.chucVu || 'Cán bộ Công an xã',
              donVi: existingUser?.donVi || 'Công an xã Lai Vung',
              soDienThoai: existingUser?.soDienThoai || '',
              createdAt: session.user.created_at || existingUser?.createdAt || '',
              lastLoginAt: existingUser?.lastLoginAt || new Date().toISOString(),
            });
            storageService.setCurrentUser(user);
            setCurrentUser(prev => {
              if (
                prev &&
                prev.id === user.id &&
                prev.username === user.username &&
                prev.email === user.email &&
                prev.fullName === user.fullName &&
                prev.role === user.role &&
                prev.chucVu === user.chucVu &&
                prev.donVi === user.donVi &&
                prev.soDienThoai === user.soDienThoai &&
                prev.createdAt === user.createdAt
              ) {
                return prev;
              }
              return user;
            });
          }
        }
      } catch (err) {
        console.warn('Không thể đồng bộ phiên Supabase Auth:', err);
      }
      if (!disposed && storageService.getCurrentUser()) {
        await storageService.pullFromSupabase();
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        storageService.clearSessionData();
        setCurrentUser(null);
        setEditingMember(null);
        setViewingMember(null);
        setIsFormModalOpen(false);
        setAppDismissMember(null);
        setAppDecisionMember(null);
      } else if (event === 'SIGNED_IN') {
        // Do not await Supabase calls inside its auth callback.
        setTimeout(() => { if (!disposed) void syncAuthSession(); }, 0);
      }
    });
    void syncAuthSession();
    return () => { disposed = true; unsub(); subscription.unsubscribe(); };
  }, [loadData]);

  // Toast Helper
  const showToast = useCallback((
    title: string, 
    message?: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastNotification = { id, title, message, type, duration: 4000 };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    loadData();
    void storageService.pullFromSupabase();
    showToast('Đăng nhập thành công', `Chào mừng ${user.fullName} (${user.role}) làm việc với hệ thống.`);
  };

  const handleLogout = async () => {
    if (currentUser) {
      await storageService.addAuditLog(
        currentUser,
        'DANG_XUAT',
        currentUser.username,
        'Cán bộ đăng xuất khỏi hệ thống'
      );
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showToast('Chưa đăng xuất được', 'Vui lòng kiểm tra mạng và thử lại.', 'error');
        return;
      }
    } catch (err) {
      console.warn('Lỗi đăng xuất Supabase Auth:', err);
      showToast('Chưa đăng xuất được', 'Vui lòng thử lại.', 'error');
      return;
    }
    storageService.clearSessionData();
    setCurrentUser(null);
    setCurrentTab('dashboard');
    setEditingMember(null);
    setViewingMember(null);
    setIsFormModalOpen(false);
    showToast('Đã đăng xuất', 'Phiên làm việc an toàn đã kết thúc.', 'info');
  };

  // Navigation from dashboard cards with filter
  const handleNavigateWithFilter = (tab: NavTab, filters?: Partial<FilterParams>) => {
    setMemberFilter(filters);
    setCurrentTab(tab);
  };

  // Personnel CRUD
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditMember = (member: NhanSu) => {
    setEditingMember(member);
    setIsFormModalOpen(true);
  };

  const handleSaveMember = (member: NhanSu) => {
    if (!currentUser) return;
    const isEdit = members.some(m => m.id === member.id);

    storageService.saveMember(member);
    storageService.addAuditLog(
      currentUser,
      isEdit ? 'CHINH_SUA' : 'THEM_MOI',
      `Hồ sơ: ${member.ho_ten} (${member.ma_nhan_su})`,
      `${isEdit ? 'Cập nhật' : 'Thêm mới'} thành viên chức vụ ${member.chuc_vu}`
    );

    loadData();
    setIsFormModalOpen(false);
    setEditingMember(null);
    showToast(
      isEdit ? 'Cập nhật thành công' : 'Thêm mới thành công',
      `Hồ sơ của đồng chí ${member.ho_ten} đã được lưu an toàn.`
    );
  };

  // Delete Member (offers both Soft Delete to Trash and Permanent Delete from Supabase)
  const handleDeleteMember = (member: NhanSu) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa hồ sơ nhân sự',
      message: `Bạn muốn xử lý hồ sơ đồng chí "${member.ho_ten}" (${member.ma_nhan_su}) như thế nào?\n\n• Chuyển vào Thùng rác: Ẩn khỏi danh sách quân số nhưng có thể khôi phục lại.\n• Xóa vĩnh viễn: Xóa hoàn toàn khỏi trang web và cơ sở dữ liệu Supabase.`,
      confirmLabel: 'Chuyển vào Thùng rác',
      secondaryConfirmLabel: 'Xóa vĩnh viễn',
      variant: 'warning',
      onConfirm: () => {
        if (!currentUser) return;
        storageService.softDeleteMember(member.id);
        storageService.addAuditLog(
          currentUser,
          'XOA_MEM',
          `Hồ sơ: ${member.ho_ten} (${member.ma_nhan_su})`,
          'Chuyển hồ sơ vào thùng rác xóa mềm'
        );
        loadData();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Đã chuyển vào Thùng rác', `Hồ sơ ${member.ho_ten} đã được chuyển vào Thùng rác.`, 'warning');
      },
      onSecondaryConfirm: () => {
        if (!currentUser) return;
        storageService.permanentDeleteMember(member.id);
        storageService.addAuditLog(
          currentUser,
          'XOA_VINH_VIEN',
          `Hồ sơ: ${member.ho_ten} (${member.ma_nhan_su})`,
          'Xóa vĩnh viễn hồ sơ khỏi hệ thống và Supabase'
        );
        loadData();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Đã xóa vĩnh viễn', `Hồ sơ ${member.ho_ten} đã được xóa hoàn toàn khỏi hệ thống và Supabase.`, 'error');
      },
    });
  };

  // Restore Soft Deleted Member
  const handleRestoreMember = (member: NhanSu) => {
    if (!currentUser) return;
    storageService.restoreMember(member.id);
    storageService.addAuditLog(
      currentUser,
      'KHOI_PHUC',
      `Hồ sơ: ${member.ho_ten} (${member.ma_nhan_su})`,
      'Khôi phục hồ sơ từ thùng rác về trạng thái đang hoạt động'
    );
    loadData();
    showToast('Khôi phục thành công', `Hồ sơ ${member.ho_ten} đã hoạt động trở lại.`);
  };

  // Permanent Delete Member
  const handlePermanentDelete = (member: NhanSu) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa vĩnh viễn hồ sơ nhân sự',
      message: `CẢNH BÁO NGUY HIỂM: Hành động này sẽ xóa hoàn toàn hồ sơ đồng chí "${member.ho_ten}" (${member.ma_nhan_su}) khỏi cơ sở dữ liệu và không thể hoàn tác!\n\nBạn có chắc chắn muốn tiếp tục?`,
      variant: 'danger',
      onConfirm: () => {
        if (!currentUser) return;
        storageService.permanentDeleteMember(member.id);
        storageService.addAuditLog(
          currentUser,
          'XOA_VINH_VIEN',
          `Hồ sơ: ${member.ho_ten} (${member.ma_nhan_su})`,
          'Xóa vĩnh viễn hồ sơ khỏi hệ thống'
        );
        loadData();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Đã xóa vĩnh viễn', `Hồ sơ ${member.ho_ten} đã được xóa hoàn toàn.`, 'error');
      },
    });
  };

  // Empty Trash
  const handleEmptyTrash = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Dọn sạch toàn bộ thùng rác',
      message: 'Bạn có chắc chắn muốn xóa vĩnh viễn tất cả các hồ sơ đang lưu trong thùng rác không? Thao tác này không thể hoàn tác!',
      variant: 'danger',
      onConfirm: () => {
        if (!currentUser) return;
        const deletedCount = storageService.emptyTrash();
        storageService.addAuditLog(
          currentUser,
          'XOA_VINH_VIEN',
          'Toàn bộ thùng rác',
          `Xóa sạch ${deletedCount} hồ sơ trong thùng rác`
        );
        loadData();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Đã dọn sạch thùng rác', `Đã xóa vĩnh viễn ${deletedCount} hồ sơ khỏi hệ thống và Supabase.`, 'info');
      },
    });
  };

  // Excel Import Success
  const handleImportSuccess = (imported: NhanSu[]) => {
    if (!currentUser) return;
    storageService.bulkSaveMembers(imported);
    storageService.addAuditLog(
      currentUser,
      'NHAP_EXCEL',
      `Nhập danh sách: ${imported.length} hồ sơ`,
      'Nhập và chuẩn hóa dữ liệu từ file Excel vào hệ thống'
    );
    loadData();
    setCurrentTab('members');
    showToast(
      'Nhập dữ liệu thành công',
      `Đã nạp thành công ${imported.length} thành viên vào danh sách quân số xã Lai Vung!`
    );
  };

  // Territories & Teams Handlers
  const handleSaveAp = (ap: DiaBanAp) => {
    if (!currentUser) return;
    storageService.saveDiaBan(ap);
    storageService.addAuditLog(
      currentUser,
      'CHINH_SUA',
      `Địa bàn: ${ap.ten_ap}`,
      `Lưu thông tin ấp ${ap.ten_ap}`
    );
    loadData();
    showToast('Lưu địa bàn thành công', `Đã cập nhật thông tin ${ap.ten_ap}.`);
  };

  const handleDeleteAp = (apId: string) => {
    const ap = diaBanList.find(a => a.id === apId);
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa địa bàn (Ấp)',
      message: `Bạn có chắc chắn muốn xóa địa bàn "${ap?.ten_ap}"? Các thành viên thuộc ấp này sẽ cần được phân bổ lại.`,
      variant: 'danger',
      onConfirm: () => {
        if (!currentUser) return;
        storageService.deleteDiaBan(apId);
        storageService.addAuditLog(
          currentUser,
          'CHINH_SUA',
          `Địa bàn: ${ap?.ten_ap}`,
          'Xóa địa bàn ấp'
        );
        loadData();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Đã xóa ấp', `Địa bàn ${ap?.ten_ap} đã được xóa.`, 'info');
      },
    });
  };

  const handleSaveTeam = (team: ToANTT) => {
    if (!currentUser) return;
    storageService.saveToANTT(team);
    storageService.addAuditLog(
      currentUser,
      'CHINH_SUA',
      `Tổ ANTT: ${team.ten_to}`,
      `Lưu thông tin tổ ANTT ${team.ten_to}`
    );
    loadData();
    showToast('Lưu Tổ ANTT thành công', `Đã cập nhật thông tin ${team.ten_to}.`);
  };

  const handleDeleteTeam = (teamId: string) => {
    const team = toANTTList.find(t => t.id === teamId);
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận giải thể / xóa Tổ ANTT',
      message: `Bạn có chắc chắn muốn xóa "${team?.ten_to}" khỏi danh mục quản lý?`,
      variant: 'danger',
      onConfirm: () => {
        if (!currentUser) return;
        storageService.deleteToANTT(teamId);
        storageService.addAuditLog(
          currentUser,
          'CHINH_SUA',
          `Tổ ANTT: ${team?.ten_to}`,
          'Giải thể/xóa tổ ANTT'
        );
        loadData();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Đã xóa tổ', `Tổ ${team?.ten_to} đã được giải thể.`, 'info');
      },
    });
  };

  // Calculation of badges
  const activeWorkingMembers = members.filter(m => m.trang_thai === 'dang_hoat_dong');
  const dismissedMembers = members.filter(m => m.trang_thai === 'da_thoi_viec');
  const activeMembers = members.filter(m => m.trang_thai !== 'da_xoa');
  const trashCount = members.filter(m => m.trang_thai === 'da_xoa').length;
  const needUpdateCount = activeWorkingMembers.filter(m => findMissingFields(m).length > 0).length;

  // Render Login page if not authenticated
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2faee] via-[#edf7e5] to-[#e1f1d6] flex flex-col text-slate-900 font-sans selection:bg-emerald-700 selection:text-white">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        secondaryConfirmLabel={confirmModal.secondaryConfirmLabel}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onSecondaryConfirm={confirmModal.onSecondaryConfirm}
        onCancel={() =>
          setConfirmModal(prev => ({
            ...prev,
            isOpen: false,
            confirmLabel: undefined,
            secondaryConfirmLabel: undefined,
            onSecondaryConfirm: undefined,
          }))
        }
      />

      {/* Member Form Modal (Add / Edit) */}
      <MemberFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        initialData={editingMember}
        diaBanList={diaBanList}
        toANTTList={toANTTList}
        existingMembers={members}
      />

      {/* Member Detail Dossier Modal */}
      <MemberDetailModal
        isOpen={!!viewingMember}
        onClose={() => setViewingMember(null)}
        member={viewingMember}
        diaBanList={diaBanList}
        toANTTList={toANTTList}
        canEdit={currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER'}
        onEdit={(m) => {
          setViewingMember(null);
          handleOpenEditMember(m);
        }}
        onDismiss={(m) => {
          setViewingMember(null);
          setAppDismissMember(m);
        }}
        onViewDecision={(m) => {
          setViewingMember(null);
          setAppDecisionMember(m);
        }}
        onReactivate={(m) => {
          setViewingMember(null);
          handleRestoreMember(m);
        }}
      />

      {/* Modal Ban hành / Chỉnh sửa QĐ cho thôi tham gia (từ Hồ sơ chi tiết) */}
      <DismissMemberModal
        isOpen={!!appDismissMember}
        member={appDismissMember}
        diaBanList={diaBanList}
        toANTTList={toANTTList}
        onClose={() => setAppDismissMember(null)}
        onConfirm={(memberId, data) => {
          if (!currentUser) return;
          storageService.dismissMember(memberId, data, currentUser);
          setAppDismissMember(null);
          loadData();
          showToast('Ban hành Quyết định thành công', `Đã cập nhật QĐ số ${data.so_quyet_dinh_thoi_viec || '.../QĐ-UBND'} cho thôi việc.`);
        }}
      />

      {/* Modal Xem & In Trích lục Quyết định của UBND xã (từ Hồ sơ chi tiết) */}
      <DismissalDecisionModal
        isOpen={!!appDecisionMember}
        member={appDecisionMember}
        diaBanList={diaBanList}
        toANTTList={toANTTList}
        onClose={() => setAppDecisionMember(null)}
        onEditDecision={(m) => {
          setAppDecisionMember(null);
          setAppDismissMember(m);
        }}
      />

      {/* Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsOpenMobile(prev => !prev)}
        needUpdateCount={needUpdateCount}
        onOpenSupabaseConfig={() => setCurrentTab('backup')}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setMemberFilter(undefined);
            setCurrentTab(tab);
          }}
          isOpenMobile={isOpenMobile}
          onCloseMobile={() => setIsOpenMobile(false)}
          userRole={currentUser.role}
          needUpdateCount={needUpdateCount}
          trashCount={trashCount}
          totalMembersCount={activeWorkingMembers.length}
          dismissedMembersCount={dismissedMembers.length}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <Dashboard
                members={members}
                diaBanList={diaBanList}
                toANTTList={toANTTList}
                onNavigateWithFilter={handleNavigateWithFilter}
              />
            )}

            {(currentTab === 'members' || currentTab === 'dismissed-members') && (
              <Members
                key={currentTab}
                members={members}
                diaBanList={diaBanList}
                toANTTList={toANTTList}
                currentUser={currentUser}
                onAddMember={handleOpenAddMember}
                onEditMember={handleOpenEditMember}
                onDeleteMember={handleDeleteMember}
                onViewMember={(m) => setViewingMember(m)}
                initialFilter={memberFilter}
                initialStatusTab={currentTab === 'dismissed-members' ? 'da_thoi_viec' : 'dang_hoat_dong'}
                onNavigateToImport={() => setCurrentTab('import')}
                onNavigateToExport={() => setCurrentTab('export')}
                onReloadData={loadData}
                onShowToast={showToast}
              />
            )}

            {currentTab === 'patrols' && (
              <PatrolManagement
                currentUser={currentUser}
                members={activeMembers}
                diaBanList={diaBanList}
                onShowToast={(t) => showToast(t.title, t.message, t.type)}
              />
            )}

            {currentTab === 'training' && (
              <TrainingManagement
                currentUser={currentUser}
                members={activeMembers}
                onShowToast={(t) => showToast(t.title, t.message, t.type)}
              />
            )}

            {currentTab === 'awards' && (
              <AwardsManagement
                currentUser={currentUser}
                members={activeMembers}
                onShowToast={(t) => showToast(t.title, t.message, t.type)}
              />
            )}

            {currentTab === 'territories' && (
              <Territories
                diaBanList={diaBanList}
                members={members}
                currentUser={currentUser}
                onSaveAp={handleSaveAp}
                onDeleteAp={handleDeleteAp}
                onViewApMembers={(apId) => handleNavigateWithFilter('members', { ap_id: apId })}
              />
            )}

            {currentTab === 'teams' && (
              <Teams
                toANTTList={toANTTList}
                diaBanList={diaBanList}
                members={members}
                currentUser={currentUser}
                onSaveTeam={handleSaveTeam}
                onDeleteTeam={handleDeleteTeam}
                onViewTeamMembers={(toId) => handleNavigateWithFilter('members', { to_antt_id: toId })}
              />
            )}

            {currentTab === 'search' && (
              <AdvancedSearch
                members={members}
                diaBanList={diaBanList}
                toANTTList={toANTTList}
                onViewMember={(m) => setViewingMember(m)}
              />
            )}

            {currentTab === 'import' && (
              <ImportExcel
                diaBanList={diaBanList}
                toANTTList={toANTTList}
                existingMembers={members}
                onImportSuccess={handleImportSuccess}
              />
            )}

            {currentTab === 'export' && (
              <ExportData
                members={members}
                diaBanList={diaBanList}
                toANTTList={toANTTList}
              />
            )}

            {currentTab === 'reports' && (
              <Reports
                members={members}
                diaBanList={diaBanList}
                toANTTList={toANTTList}
              />
            )}

            {currentTab === 'need-update' && (
              <ProfilesNeedUpdate
                members={members}
                diaBanList={diaBanList}
                toANTTList={toANTTList}
                currentUser={currentUser}
                onEditMember={handleOpenEditMember}
              />
            )}

            {currentTab === 'trash' && (
              <Trash
                members={members}
                diaBanList={diaBanList}
                toANTTList={toANTTList}
                currentUser={currentUser}
                onRestore={handleRestoreMember}
                onPermanentDelete={handlePermanentDelete}
                onEmptyTrash={handleEmptyTrash}
              />
            )}

            {currentTab === 'audit' && (
              <AuditLogs logs={auditLogs} />
            )}

            {currentTab === 'backup' && (
              <BackupRestore
                currentUser={currentUser}
                onRefreshData={loadData}
                onShowToast={showToast}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
