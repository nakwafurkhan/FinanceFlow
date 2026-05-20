/**
 * components/ErrorBoundary.jsx
 * --------------------------------------------------------------
 * Catches render-time errors in the wrapped tree and shows a
 * friendly fallback instead of a blank screen.
 *
 * React's error boundary API requires a class component — there is
 * no hook equivalent. This is the only class component in the app.
 *
 * Future hook-up (Phase 8 follow-up): swap the no-op logger for
 * Sentry / your real observability provider.
 */

import { Component } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Real observability provider would receive this. For now, console.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-coral-100 text-coral-600 shadow-glow-coral dark:bg-coral-900/40 dark:text-coral-300">
            <AlertTriangle size={32} />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
            We hit an unexpected error on this page. Reload to try again, or
            head back to the dashboard.
          </p>

          {this.state.error?.message && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-2xl border border-ink-200 bg-ink-50 p-3 text-left text-xs text-ink-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300">
              {this.state.error.message}
            </pre>
          )}

          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              <RefreshCw size={16} />
              Reload page
            </button>
            <Link to="/app/dashboard" onClick={this.reset} className="btn-ghost">
              <Home size={16} />
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
