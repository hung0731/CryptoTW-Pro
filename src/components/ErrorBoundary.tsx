'use client';

import React, { Component, ReactNode } from 'react';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    resetKeys?: Array<string | number>;
    level?: 'page' | 'section' | 'component';
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in child component tree and displays fallback UI
 * 
 * @example
 * <ErrorBoundary fallback={<ErrorCard />}>
 *   <DangerousComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Log to monitoring service
        logger.error('React Error Boundary', error, {
            feature: 'error-boundary',
            componentStack: errorInfo.componentStack,
        });

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        this.setState({
            errorInfo,
        });
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        // Reset error state when resetKeys change
        if (this.state.hasError && this.props.resetKeys) {
            if (prevProps.resetKeys?.some((key, index) => key !== this.props.resetKeys?.[index])) {
                this.reset();
            }
        }
    }

    reset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback based on level
            const { level = 'component' } = this.props;

            return (
                <ErrorFallback
                    error={this.state.error}
                    reset={this.reset}
                    level={level}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Default Error Fallback UI
 */
interface ErrorFallbackProps {
    error: Error | null;
    reset: () => void;
    level: 'page' | 'section' | 'component';
}

function ErrorFallback({ error, reset, level }: ErrorFallbackProps) {
    const getSize = () => {
        switch (level) {
            case 'page':
                return 'min-h-screen';
            case 'section':
                return 'min-h-[400px]';
            case 'component':
            default:
                return 'min-h-[200px]';
        }
    };

    const getMessage = () => {
        if (process.env.NODE_ENV === 'development' && error) {
            return error.message;
        }

        switch (level) {
            case 'page':
                return '頁面載入時發生錯誤';
            case 'section':
                return '此區塊暫時無法顯示';
            case 'component':
            default:
                return '載入失敗';
        }
    };

    return (
        <div className={`flex items-center justify-center ${getSize()}`}>
            <UniversalCard variant="danger" size="L" className="max-w-md">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {level === 'page' ? '糟糕！' : '載入錯誤'}
                        </h3>
                        <p className="text-sm text-neutral-300">
                            {getMessage()}
                        </p>
                    </div>

                    {process.env.NODE_ENV === 'development' && error && (
                        <pre className="text-[10px] text-left bg-black/50 p-3 rounded-lg w-full overflow-auto max-h-32 text-red-300 font-mono">
                            {error.stack}
                        </pre>
                    )}

                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-neutral-200 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        重新載入
                    </button>

                    {level === 'page' && (
                        <a
                            href="/"
                            className="text-xs text-neutral-500 hover:text-white transition-colors"
                        >
                            返回首頁
                        </a>
                    )}
                </div>
            </UniversalCard>
        </div>
    );
}

/**
 * Hook for creating error boundaries with custom fallbacks
 */
export function useErrorHandler(onError?: (error: Error) => void) {
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        if (error) {
            onError?.(error);
            throw error; // Re-throw to be caught by ErrorBoundary
        }
    }, [error, onError]);

    return setError;
}
