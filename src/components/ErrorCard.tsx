/**
 * Specialized Error Fallback for Cards
 * 
 * Use this for card-level errors to maintain visual consistency
 */

'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { UniversalCard } from '@/components/ui/UniversalCard';

interface ErrorCardProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    size?: 'S' | 'M' | 'L';
}

export function ErrorCard({
    title = '載入失敗',
    message = '此內容暫時無法顯示',
    onRetry,
    size = 'M'
}: ErrorCardProps) {
    return (
        <UniversalCard variant="danger" size={size}>
            <div className="flex flex-col items-center text-center gap-3 py-4">
                <AlertCircle className="w-6 h-6 text-red-400" />

                <div>
                    <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
                    <p className="text-xs text-neutral-400">{message}</p>
                </div>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        重試
                    </button>
                )}
            </div>
        </UniversalCard>
    );
}

/**
 * Mini Error Display for inline errors
 */
export function ErrorInline({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}
