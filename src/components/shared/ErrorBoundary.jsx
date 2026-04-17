import React from 'react';
import { Button } from '../../ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Algo salió mal</h3>
          <p className="text-sm text-red-600 mb-4">Ha ocurrido un error al cargar este componente.</p>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false })}
          >
            Intentar de nuevo
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
