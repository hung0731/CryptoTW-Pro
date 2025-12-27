import React from 'react'
import { ZoomIn, RotateCcw } from 'lucide-react'

interface HistoryChartControlsProps {
    viewMode: 'standard' | 'focus'
    setViewMode: (mode: 'standard' | 'focus') => void
    focusWindow?: [number, number]
}

export const HistoryChartControls: React.FC<HistoryChartControlsProps> = ({ viewMode, setViewMode, focusWindow }) => {
    if (!focusWindow) return null

    return (
        <div className="absolute top-2 right-2 z-20 flex gap-1 bg-[#0F0F10]/60 backdrop-blur-xl p-1 rounded-xl border border-white/10 shadow-lg">
            <button
                onClick={() => setViewMode('standard')}
                className={`p-1.5 rounded ${viewMode === 'standard' ? 'bg-[#1A1A1A] text-white' : 'text-[#666666] hover:text-[#A0A0A0]'}`}
                title="全域視角"
            >
                <RotateCcw className="w-3 h-3" />
            </button>
            <button
                onClick={() => setViewMode('focus')}
                className={`p-1.5 rounded ${viewMode === 'focus' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#666666] hover:text-[#A0A0A0]'}`}
                title="重點視角"
            >
                <ZoomIn className="w-3 h-3" />
            </button>
        </div>
    )
}
