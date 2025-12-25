/**
 * Root Error Boundary
 * 
 * Wrap the entire app to catch any uncaught errors
 * Place in app/layout.tsx or app/error.tsx
 */

'use client';

import { useEffect } from 'react';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { AlertTriangle, Home } from 'lucide-react';

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to monitoring service
        console.error('Root Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <UniversalCard variant="danger" size="L" className="max-w-lg">
                <div className="flex flex-col items-center text-center gap-6">
                    <div className="p-4 bg-red-500/10 rounded-full">
                        <AlertTriangle className="w-12 h-12 text-red-400" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-white mb-3">
                            糟糕！頁面出錯了
                        </h1>
                        <p className="text-neutral-300 mb-2">
                            我們在載入此頁面時遇到問題
                        </p>
                        {process.env.NODE_ENV === 'development' && (
                            <p className="text-xs text-neutral-500 font-mono mt-2">
                                {error.message}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={reset}
                            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                        >
                            重新載入
                        </button>

                        <a
                            href="/"
                            className="flex items-center gap-2 px-6 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            返回首頁
                        </a>
                    </div>

                    {error.digest && (
                        <p className="text-[10px] text-neutral-600 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>
            </UniversalCard>
        </div>
    );
}
