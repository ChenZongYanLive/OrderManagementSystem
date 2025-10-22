import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ color: '#e53e3e', marginBottom: '20px' }}>發生錯誤</h1>
            <p style={{ color: '#718096', marginBottom: '30px' }}>
              很抱歉，應用程式遇到了一個錯誤。
            </p>

            {this.state.error && (
              <div style={{
                backgroundColor: '#fed7d7',
                padding: '15px',
                borderRadius: '4px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <strong>錯誤訊息：</strong>
                <pre style={{
                  marginTop: '10px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  color: '#742a2a'
                }}>
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            <button
              onClick={this.handleReset}
              style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              返回首頁
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
