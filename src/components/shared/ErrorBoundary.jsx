import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('DEVK InternCore runtime error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f5f7fc', color: '#172b4d', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <section style={{ maxWidth: 560, width: '100%', padding: 28, background: '#fff', border: '1px solid #e6ebf4', borderRadius: 18, boxShadow: '0 12px 40px rgba(24,48,86,.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.4, color: '#326ce5' }}>DEVK INTERNCORE</div>
            <h1 style={{ fontSize: 26, margin: '12px 0' }}>Something went wrong</h1>
            <p style={{ lineHeight: 1.7, color: '#71819c' }}>The page encountered an unexpected error. Refresh to try again. If the issue continues, open the browser console and share the first red error message.</p>
            <button onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 10, padding: '11px 16px', background: '#326ce5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Refresh application</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
