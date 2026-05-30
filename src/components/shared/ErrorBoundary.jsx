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
          className="p-8 bg-destructive/10 border border-destructive/30 rounded-xl text-center max-w-md mx-auto mt-12"
        >
          <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Algo salió mal
          </h2>
          <p className="text-sm text-destructive mb-6">
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
              <pre className="overflow-auto p-2 bg-destructive/10 rounded">
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
