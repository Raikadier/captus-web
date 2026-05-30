import React from 'react';
import { Button } from '../../ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to error tracking service in production
    if (import.meta.env.PROD) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (fallback) return fallback;

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="p-8 bg-red-50 border border-red-200 rounded-xl text-center max-w-md mx-auto mt-12"
        >
          <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Algo salió mal
          </h2>
          <p className="text-sm text-red-600 mb-6">
            Ha ocurrido un error inesperado. Por favor intenta de nuevo o
            recarga la página.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              Intentar de nuevo
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </Button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-4 text-left text-xs text-red-500">
              <summary className="cursor-pointer mb-1">Detalles del error</summary>
              <pre className="overflow-auto p-2 bg-red-100 rounded">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
