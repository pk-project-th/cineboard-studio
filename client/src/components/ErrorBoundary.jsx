import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c0c0e] text-[#ece5d8] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400 mb-4 text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white mb-2">เกิดข้อผิดพลาดในการโหลดหน้าจอ</h2>
          <p className="text-xs font-mono text-stone-400 max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || 'เกิดข้อผิดพลาดในการเรนเดอร์'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-[#F71C25] hover:bg-lime-300 text-stone-950 font-bold text-xs transition-all shadow-lg"
          >
            รีเฟรชหน้าต่าง (Reload)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
