'use client'

/**
 * CryptoTW Pro Design System
 * 
 * A unified design language for premium dark UI.
 * Use these tokens across all components for consistency.
 */

// ================================================
// TYPOGRAPHY SCALE
// ================================================
export const TYPOGRAPHY = {
    // Page Titles (24px)
    pageTitle: 'text-2xl font-bold tracking-tight',

    // Section Headers
    sectionTitle: 'text-base font-bold tracking-tight',     // 16px - Main sections
    sectionSubtitle: 'text-sm font-semibold',               // 14px - Subsections
    sectionLabel: 'text-xs font-semibold text-neutral-400 uppercase tracking-wider', // 12px - Labels

    // Card Headers
    cardTitle: 'text-sm font-bold',                         // 14px
    cardSubtitle: 'text-xs font-medium',                    // 12px

    // Body Text
    bodyLarge: 'text-sm leading-relaxed',                   // 14px
    bodyDefault: 'text-xs leading-relaxed',                 // 12px
    bodySmall: 'text-[11px] leading-relaxed',               // 11px

    // Captions & Labels
    caption: 'text-[10px]',                                 // 10px
    micro: 'text-[9px]',                                    // 9px

    // Monospace (Data Display)
    monoXL: 'text-2xl font-mono font-bold',                 // 24px
    monoLarge: 'text-lg font-mono font-bold',               // 18px
    monoMedium: 'text-sm font-mono font-medium',            // 14px
    monoSmall: 'text-xs font-mono',                         // 12px
    monoMicro: 'text-[10px] font-mono',                     // 10px
} as const

// ================================================
// COLOR PALETTE
// ================================================
export const SURFACE = {
    // Level 1: App Background (Deepest)
    app: 'bg-[#050505]',

    // Level 2: Card Background (Base)
    card: 'bg-[#0E0E0F]',

    // Level 3: Elevated / Interactive (Hover, Selected)
    highlight: 'bg-[#1A1A1A]',

    // Level 4: Borders / Dividers / Outlines
    border: 'border-[#2A2A2A]',
} as const

export const COLORS = {
    // Text Hierarchy
    textPrimary: 'text-white',           // Numbers / Primary focus only
    textSecondary: 'text-[#A0A0A0]',    // Labels / Dates / Secondary info
    textTertiary: 'text-[#666666]',     // Meta / Disabled

    // Functional Colors (Strictly Limited)
    positive: 'text-[#4ADE80]',         // Green
    negative: 'text-[#F87171]',         // Red
    neutral: 'text-[#A0A0A0]',          // Gray

    // The only allowed "Brand/Focus" accent
    accent: 'text-white',
} as const

// ================================================
// CARD STYLES
// ================================================
export const CARDS = {
    // Type A: Hero / Focus Card
    // - Taller, Primary Border, 1.2x Height visual weight
    typeA: 'bg-[#0E0E0F] border border-[#2A2A2A] rounded-xl relative overflow-hidden',

    // Type B: Comparison / History
    // - No Border, relying on Background distinction
    typeB: 'bg-[#0E0E0F] hover:bg-[#1A1A1A] hover:outline hover:outline-1 hover:outline-[#2A2A2A] transition-all rounded-lg',

    // Type C: Info / Stats
    // - Text block + divider style (minimal container)
    typeC: 'bg-transparent border-l border-[#2A2A2A] pl-4',

    // Legacy support (mapped to new system)
    base: 'bg-[#0E0E0F] border border-[#2A2A2A] rounded-xl',
    interactive: 'bg-[#0E0E0F] hover:bg-[#1A1A1A] border border-[#2A2A2A] transition-all rounded-xl',
} as const

// ================================================
// SECTION HEADER STYLES (NO decorative bars)
// ================================================
export const SECTION = {
    // Container
    header: 'flex items-center justify-between',
    headerTight: 'flex items-center justify-between mb-3',
    headerLoose: 'flex items-center justify-between mb-4',

    // Title styles
    titlePrimary: 'text-base font-bold text-white tracking-tight',
    titleSecondary: 'text-xs font-semibold text-neutral-400 uppercase tracking-wider',

    // Badge for auxiliary info
    badge: 'text-[10px] text-neutral-500 bg-neutral-800/50 px-2 py-0.5 rounded-full',
    badgeActive: 'text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20',
} as const

// ================================================
// SPACING
// ================================================
export const SPACING = {
    // Page-level
    pageX: 'px-4',
    pageY: 'py-4',
    page: 'p-4',

    // Section-level
    sectionGap: 'space-y-6',
    cardGap: 'space-y-4',

    // Card-level
    cardPadding: 'p-4',
    cardPaddingCompact: 'p-3',
    cardPaddingTight: 'p-2',
} as const

// ================================================
// BADGE STYLES
// ================================================
export const BADGES = {
    // Neutral (default)
    neutral: 'text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700',

    // Status badges
    success: 'text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20',
    warning: 'text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    danger: 'text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20',

    // Grade badges
    gradeS: 'text-[9px] px-1.5 py-0 h-4 font-mono bg-neutral-800 text-neutral-300 border border-neutral-700',
    gradeA: 'text-[9px] px-1.5 py-0 h-4 font-mono bg-neutral-800 text-neutral-400 border border-neutral-700',
    gradeB: 'text-[9px] px-1.5 py-0 h-4 font-mono bg-neutral-800 text-neutral-500 border border-neutral-700',
} as const

// ================================================
// BUTTON STYLES
// ================================================
export const BUTTONS = {
    // Primary action
    primary: 'px-4 py-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors',

    // Secondary action
    secondary: 'px-4 py-2 rounded-lg bg-neutral-800 text-white font-medium text-sm border border-white/10 hover:bg-neutral-700 transition-colors',

    // Ghost button
    ghost: 'px-4 py-2 rounded-lg text-neutral-400 font-medium text-sm hover:bg-white/5 hover:text-white transition-colors',

    // Icon button
    icon: 'w-9 h-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors',
} as const

// ================================================
// HELPER: Generate section header without bars
// ================================================
export function sectionHeader(title: string, subtitle?: string) {
    return {
        title,
        subtitle,
        className: SECTION.header,
        titleClassName: subtitle ? SECTION.titleSecondary : SECTION.titlePrimary,
    }
}
