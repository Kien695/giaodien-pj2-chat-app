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
        className="app-page flex min-h-screen items-center justify-center px-4"
        role="alert"
      >
        <section className="app-card w-full max-w-md rounded-2xl border p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold">Ứng dụng gặp sự cố</h1>
          <p className="app-muted mt-3 text-sm leading-6">
            Dữ liệu của bạn vẫn được giữ an toàn. Hãy tải lại trang để tiếp tục.
          </p>
          <button
            className="app-primary-button mt-6 rounded-lg px-5 py-2.5 font-medium"
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
