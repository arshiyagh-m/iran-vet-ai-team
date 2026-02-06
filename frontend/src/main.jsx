import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// 👇👇👇 اصلاح مهم: کلاس ErrorBoundary را آوردم بالا تا قبل از استفاده تعریف شده باشد
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', direction: 'ltr', backgroundColor: '#fff0f0', color: '#333' }}>
          <h1 style={{ color: '#d32f2f' }}>Something went wrong.</h1>
          <p>Please refresh the page or contact support.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px', color: '#555' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
// 👆👆👆 پایان کلاس ErrorBoundary

// پیدا کردن المنت روت
const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<h1 style="color:red; padding:20px;">خطا: المنت root در فایل index.html پیدا نشد!</h1>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
           {/* الان چون کلاس بالا تعریف شده، اینجا خطا نمی‌دهد */}
           <ErrorBoundary>
              <App />
           </ErrorBoundary>
        </BrowserRouter>
      </React.StrictMode>,
    );
  } catch (error) {
    document.body.innerHTML = `<div style="color:red; padding:20px; font-size:18px;">
      <h1>CRITICAL ERROR:</h1>
      <pre>${error.message}</pre>
    </div>`;
  }
}
