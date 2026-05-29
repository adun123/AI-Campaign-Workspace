"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="mx-auto mt-20 max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-error" />
          <h2 className="mt-4 text-lg font-semibold text-text-primary">Something went wrong</h2>
          <p className="mt-2 text-sm text-text-muted">{this.state.error?.message ?? "An unexpected error occurred."}</p>
          <Button className="mt-6" onClick={() => this.setState({ hasError: false, error: null })}>
            <RefreshCcw className="h-4 w-4" /> Try again
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}
