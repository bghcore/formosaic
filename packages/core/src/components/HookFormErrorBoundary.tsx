import React from "react";

interface IHookFormErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, resetError: () => void) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface IHookFormErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class HookFormErrorBoundary extends React.Component<
  IHookFormErrorBoundaryProps,
  IHookFormErrorBoundaryState
> {
  constructor(props: IHookFormErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): IHookFormErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }
      return (
        <div className="hook-form-error-boundary" role="alert">
          <span className="error-boundary-message">
            Something went wrong: {this.state.error.message}
          </span>
          <button
            className="error-boundary-retry"
            onClick={this.resetError}
            type="button"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
