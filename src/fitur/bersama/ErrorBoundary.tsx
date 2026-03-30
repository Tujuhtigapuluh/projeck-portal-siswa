import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps> {
  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep log for debugging unexpected runtime errors in production.
    console.error('Unexpected runtime error:', error, info);
  }

  render() {
    return this.props.children;
  }
}
