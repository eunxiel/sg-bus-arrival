"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { getStoredLanguage, translate } from "@/lib/i18n";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const lang = getStoredLanguage();
      return (
        <div
          role="alert"
          className="glass-card flex flex-col items-center gap-4 p-8 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-500" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {this.props.fallbackTitle ?? translate(lang, "errorBoundary.defaultTitle")}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {this.state.error?.message ?? translate(lang, "errorBoundary.defaultMessage")}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="btn-glass px-5 py-2.5 text-sm"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {translate(lang, "errorBoundary.retry")}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
