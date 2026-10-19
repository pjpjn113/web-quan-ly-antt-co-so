import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

function RecoveryScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Chưa thể mở ứng dụng</h1>
        <p className="mt-3 text-slate-600">Ứng dụng gặp lỗi khi tải. Hãy thử tải lại trang. Nếu lỗi tiếp tục, gửi ảnh thông báo lỗi trong Console cho người hỗ trợ.</p>
        <p className="mt-3 text-sm text-slate-500">Thao tác tải lại không xóa dữ liệu đã lưu.</p>
        <button className="mt-6 rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white" onClick={() => window.location.reload()}>Tải lại trang</button>
      </section>
    </main>
  );
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Lỗi hiển thị ứng dụng ANTT:', error, info.componentStack);
  }
  render() { return this.state.failed ? <RecoveryScreen /> : this.props.children; }
}

const root = createRoot(document.getElementById('root')!);
// Tách tải module để lỗi khởi tạo dịch vụ cũng được hiển thị, không để trắng trang.
import('./App.tsx').then(({ default: App }) => {
  root.render(<StrictMode><AppErrorBoundary><App /></AppErrorBoundary></StrictMode>);
}).catch((error) => {
  console.error('Lỗi khởi động ứng dụng ANTT:', error);
  root.render(<RecoveryScreen />);
});
