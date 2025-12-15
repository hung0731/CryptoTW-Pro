'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { type RiskLevel, getRiskColor, getRiskBgColor } from '@/lib/indicator-knowledge'

interface StatusBadgeProps {
    /** 狀態文字 (e.g., '偏高', '過熱', '正常') */
    status: string
    /** 風險等級 */
    riskLevel: RiskLevel
    /** 風險提示文字 (e.g., '避免追價', '需注意') */
    hint?: string
    /** 額外的 className */
    className?: string
    /** 尺寸 */
    size?: 'sm' | 'md'
}

/**
 * 狀態標籤元件
 * 
 * 顯示：🟢 正常｜可接受
 *      🟡 偏高｜需注意
 *      🔴 過熱｜避免追價
 * 
 * 核心目的：讓交易者一眼知道「現在這個數字是不是正常」
 */
export function StatusBadge({
    status,
    riskLevel,
    hint,
    className,
    size = 'sm'
}: StatusBadgeProps) {
    const color = getRiskColor(riskLevel)
    const bgColor = getRiskBgColor(riskLevel)

    const sizeClasses = size === 'sm'
        ? 'text-xs px-2 py-0.5'
        : 'text-sm px-2.5 py-1'

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full font-medium',
                sizeClasses,
                className
            )}
            style={{
                color,
                backgroundColor: bgColor
            }}
        >
            {/* 風險點 */}
            <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
            />
            {/* 狀態文字 */}
            <span>{status}</span>
            {/* 分隔線 + 提示（可選） */}
            {hint && (
                <>
                    <span className="opacity-50">｜</span>
                    <span className="opacity-80">{hint}</span>
                </>
            )}
        </span>
    )
}

/**
 * 指標狀態標籤 - 自動根據知識庫計算狀態
 */
interface IndicatorStatusBadgeProps {
    /** 指標 ID (e.g., 'fundingRate', 'longShortRatio') */
    indicatorId: string
    /** 當前數值 */
    value: number
    /** 是否顯示提示 */
    showHint?: boolean
    /** 額外的 className */
    className?: string
    /** 尺寸 */
    size?: 'sm' | 'md'
}

export function IndicatorStatusBadge({
    indicatorId,
    value,
    showHint = true,
    className,
    size = 'sm'
}: IndicatorStatusBadgeProps) {
    // 動態載入知識庫以避免循環依賴
    const { INDICATOR_KNOWLEDGE } = require('@/lib/indicator-knowledge')
    const knowledge = INDICATOR_KNOWLEDGE[indicatorId]

    if (!knowledge) {
        return null
    }

    const riskLevel = knowledge.getRiskLevel(value)
    const status = knowledge.getStatusLabel(value)
    const hint = showHint ? knowledge.riskHints[riskLevel] : undefined

    return (
        <StatusBadge
            status={status}
            riskLevel={riskLevel}
            hint={hint}
            className={className}
            size={size}
        />
    )
}
