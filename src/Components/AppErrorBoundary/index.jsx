import { Component } from "react";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Application render failed", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main
        className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900"
        role="alert"
      >
        <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold">Ứng dụng gặp sự cố</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Dữ liệu của bạn vẫn được giữ an toàn. Hãy tải lại trang để tiếp tục.
          </p>
          <button
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={this.handleReload}
            type="button"
          >
            Tải lại trang
          </button>
        </section>
      </main>
    );
  }
}

export default AppErrorBoundary;
