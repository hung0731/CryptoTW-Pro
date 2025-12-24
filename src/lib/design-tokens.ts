'use client'

/**
 * CryptoTW Pro Design System v2.0
 * 
 * MANDATORY CONSTRAINTS:
 * - Cards: EXACTLY 4 types (primary, secondary, inline, passive)
 * - Colors: Black/White/Gray UI, functional colors data-only
 * - Animations: NONE (no transition-*, no duration-*)
 * - Charts: Unified line hierarchy, mandatory watermark
 * 
 * ALL components MUST use these tokens. No inline styles permitted.
 */

// ================================================
// SURFACE COLORS (Unified Hierarchy)
// ================================================
export const SURFACE = {
    // Level 0: App Background (Deepest)
    app: 'bg-[#050505]',

    // Level 1: Primary Card Background
    cardPrimary: 'bg-[#0A0A0A]',

    // Level 2: Passive/Muted Card Background
    cardPassive: 'bg-[#080808]',

    // Level 3: Tertiary (Section Headers)
    tertiary: 'bg-[#0F0F10]',

    // Level 4: Elevated / Hover State
    elevated: 'bg-[#141414]',

    // Level 5: Highlight / Selected
    highlight: 'bg-[#1A1A1A]',

    // State-based Surfaces
    danger: 'bg-[#1C0F0F]', // Red tint
    success: 'bg-[#0F1C12]', // Green tint

    // Legacy aliases
    card: 'bg-[#0A0A0A]',
    border: 'border-[#1A1A1A]',
    // Level 6: Ghost (Transparent)
    ghost: 'bg-transparent',
} as const

// ================================================
// BORDER SYSTEM
// ================================================
export const BORDER = {
    // Primary border (cards)
    primary: 'border border-[#1A1A1A]',

    // Hover-only border (appears on hover)
    hover: 'hover:border hover:border-[#2A2A2A]',

    // Dashed border (passive cards)
    dashed: 'border border-dashed border-[#1A1A1A]',

    // Left accent (inline data blocks)
    left: 'border-l-2 border-[#1A1A1A]',

    // Divider
    divider: 'border-[#1A1A1A]',

    // Status Borders
    highlight: 'border border-[#333333]',
    danger: 'border border-[#331111]',
    success: 'border border-[#113311]',

    // Ghost (No Border)
    ghost: 'border border-transparent',
} as const

// ================================================
// RADIUS (Only 2 Values Allowed)
// ================================================
export const RADIUS = {
    xl: 'rounded-xl',  // 12px - Primary/Passive cards
    lg: 'rounded-lg',  // 8px - Secondary cards & Generic Elements
    md: 'rounded-md',  // 6px - Small interactive elements
} as const

// ================================================
// SPACING (Strict Rules - NO MAGIC NUMBERS)
// ================================================
export const SPACING = {
    // Global Rhythm
    pageToSection: 16,     // Header -> First Section
    sectionGap: 16,        // Section -> Section
    cardGap: 12,           // Card -> Card

    // Component Internals
    cardPadding: 16,       // Standard Internal Padding
    cardPaddingSmall: 12,  // Small Card Internal Padding

    // Utility Classes
    card: 'p-4',
    cardCompact: 'p-3',
    cardTight: 'p-2',

    // Internal Vertical Rhythm
    cardInternal: {
        tight: 'space-y-2',   // Header -> Body, Footer -> CTA
        normal: 'space-y-3',  // Body -> Main Content
    },

    // Legacy Tailwind Classes (mapped to strict values)
    pageX: 'px-4',
    pageTop: 'pt-6',
    pageBottom: 'pb-24',

    // Helper Maps (for className usage)
    classes: {
        gapCards: 'gap-3',      // 12px
        gapSections: 'gap-4',   // 16px
        mtHeader: 'mt-4',       // 16px
    }
} as const

// ================================================
// LAYOUT CONTAINERS (v1.1)
// ================================================
export const LAYOUT = {
    // Mobile First (Default)
    mobile: 'w-full max-w-[480px] mx-auto',

    // Desktop Dashboard
    desktop: 'w-full max-w-7xl mx-auto',

    // Landing / Marketing
    full: 'w-full',
} as const

// ================================================
// CARD SYSTEM (STRICT TYPES v1.1)
// ================================================
export const CARDS = {
    /**
     * Primary Card (Focus)
     * - Uses: Charts, Conclusions, Main Data
     * - Style: Darkest, Big Padding, Rounded XL
     */
    primary: 'bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-4',

    /**
     * Secondary Card (List Item)
     * - Uses: News, Events, Indicators Lists
     */
    secondary: 'bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-3 transition-colors duration-75 active:bg-[#141414]',

    /**
     * Tertiary / Section Header
     * - Uses: Section Headers, Grouping
     */
    tertiary: 'bg-[#0F0F10] border border-transparent rounded-lg p-3',

    // Aliases
    typeA: 'bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-4',
    typeB: 'bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-3 active:bg-[#141414]',

    // Legacy / specialized
    inline: 'bg-transparent border-l-2 border-[#1A1A1A] pl-3',
    passive: 'bg-[#080808] border border-dashed border-[#1A1A1A] rounded-xl p-4',

    // Lu.ma Style (Ghost/Flat)
    ghost: 'bg-transparent border border-transparent p-0',
} as const

// ================================================
// TYPOGRAPHY SCALE
// ================================================
export const TYPOGRAPHY = {
    // Page Titles (24px)
    pageTitle: 'text-2xl font-bold tracking-tight text-white',

    // Section Headers
    sectionTitle: 'text-base font-bold tracking-tight text-white',
    sectionLabel: 'text-xs font-semibold text-[#808080] uppercase tracking-wider',

    // Card Headers
    cardTitle: 'text-sm font-bold text-white',
    cardSubtitle: 'text-xs font-medium text-[#808080]',

    // Body Text
    bodyLarge: 'text-sm leading-relaxed text-[#A0A0A0]',
    bodyDefault: 'text-xs leading-relaxed text-[#808080]',
    bodySmall: 'text-[11px] leading-relaxed text-[#666666]',

    // Captions & Labels
    caption: 'text-[10px] text-[#666666]',
    micro: 'text-[9px] text-[#525252]',

    // Monospace (Data Display)
    monoXL: 'text-2xl font-mono font-bold text-white tabular-nums',
    monoLarge: 'text-lg font-mono font-bold text-white tabular-nums',
    monoMedium: 'text-sm font-mono font-medium text-white tabular-nums',
    monoSmall: 'text-xs font-mono text-[#A0A0A0] tabular-nums',
    monoMicro: 'text-[10px] font-mono text-[#666666] tabular-nums',
} as const

// ================================================
// TEXT COLORS (UI Only - Black/White/Gray)
// ================================================
export const COLORS = {
    // Text Hierarchy
    textPrimary: 'text-white',
    textSecondary: 'text-[#A0A0A0]',
    textTertiary: 'text-[#666666]',
    textMuted: 'text-[#525252]',

    // Functional Colors (DATA LAYER ONLY)
    positive: 'text-[#22C55E]',  // Green - positive values only
    negative: 'text-[#EF4444]',  // Red - negative values only
    neutral: 'text-[#808080]',   // Gray - unchanged values

    // Comparison Colors (COMPARISON MODE ONLY)
    compareBase: 'text-[#3B82F6]',    // Blue - base/left
    compareAlt: 'text-[#F59E0B]',     // Amber - compare/right
} as const

// ================================================
// CHART COLORS (Functional)
// ================================================
export const CHARTS = {
    primary: '#22C55E', // Green-500
    primaryGradientFrom: '#22C55E',
    primaryGradientTo: '#22C55E', // Usually transparent, handled in component
    secondary: '#3B82F6', // Blue-500
    tertiary: '#F59E0B', // Amber-500
    grid: '#1A1A1A', // Neutral-900 (Border color)
    tooltip: {
        bg: '#0A0A0A',
        border: '#1A1A1A',
        text: '#FFFFFF',
        label: '#A0A0A0'
    },
    axis: '#525252', // Neutral-600
    cursor: '#404040', // Neutral-700
} as const

// ================================================
// CHART TOKENS (Unified Visual Language)
// ================================================
export const CHART = {
    // Line Hierarchy
    linePrimary: { stroke: '#E0E0E0', strokeWidth: 2 },
    lineSecondary: { stroke: '#A0A0A0', strokeWidth: 1.5, opacity: 0.8 },
    lineHistorical: { stroke: '#666666', strokeWidth: 1, opacity: 0.6 },
    lineAverage: { stroke: '#808080', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 },

    // Comparison Mode
    lineBase: { stroke: '#3B82F6', strokeWidth: 2 },      // Blue
    lineCompare: { stroke: '#F59E0B', strokeWidth: 2 },   // Amber

    // Area Fills
    areaPrimary: { fill: '#E0E0E0', fillOpacity: 0.15 },
    areaBase: { fill: '#3B82F6', fillOpacity: 0.15 },
    areaCompare: { fill: '#F59E0B', fillOpacity: 0.15 },

    // Grid & Axes
    grid: { stroke: '#111111', strokeDasharray: '3 3' },
    axis: { fontSize: 10, fill: '#525252' },

    // Reference Lines
    referenceD0: { stroke: '#EF4444', strokeDasharray: '3 3', opacity: 0.8 },
    referenceBounds: { stroke: '#FFFFFF', opacity: 0.1 },
    referenceEvent: { stroke: '#FFFFFF', strokeDasharray: '3 3', opacity: 0.4 },

    // Tooltip (Unified)
    tooltip: {
        container: 'bg-[#0A0A0A]/95 border border-[#1A1A1A] rounded-lg shadow-xl p-2',
        date: 'text-[10px] text-[#666666] mb-1',
        value: 'text-xs font-mono font-bold text-white',
        label: 'text-[10px] text-[#808080]',
    },

    // Watermark (MANDATORY)
    watermark: {
        src: '/logo.svg',
        className: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.03] w-48 h-48 grayscale',
    },

    // Dimensions (v1.1)
    heightDefault: 'h-[300px]',
    heightSmall: 'h-[200px]',
    heightMini: 'h-[120px]',
} as const

// ================================================
// BADGE STYLES
// ================================================
export const BADGES = {
    // Neutral (default)
    neutral: 'text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#A0A0A0] border border-[#2A2A2A]',

    // Status badges (DATA LAYER ONLY)
    success: 'text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20',
    warning: 'text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
    danger: 'text-[10px] px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20',

    // Comparison badges (COMPARISON MODE ONLY)
    base: 'text-[10px] px-2 py-0.5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6]',
    compare: 'text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B]',
} as const

// ================================================
// BUTTON STYLES (No transition-colors)
// ================================================
export const BUTTONS = {
    // Primary action (max 1 per screen)
    primary: 'px-4 py-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-[#E0E0E0]',

    // Secondary action
    secondary: 'px-4 py-2 rounded-lg bg-[#1A1A1A] text-white font-medium text-sm border border-[#2A2A2A] hover:bg-[#2A2A2A]',

    // Ghost button
    ghost: 'px-4 py-2 rounded-lg text-[#808080] font-medium text-sm hover:bg-[#1A1A1A] hover:text-white',

    // Icon button
    icon: 'w-9 h-9 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A]',
} as const

// ================================================
// SECTION HEADER STYLES
// ================================================
export const SECTION = {
    header: 'flex items-center justify-between',
    headerWithGap: 'flex items-center justify-between mb-4',

    titlePrimary: 'text-base font-bold text-white tracking-tight',
    titleSecondary: 'text-xs font-semibold text-[#808080] uppercase tracking-wider',

    badge: 'text-[10px] text-[#666666] bg-[#1A1A1A] px-2 py-0.5 rounded-full',
} as const

// ================================================
// HELPER: Chart Tooltip Component Props
// ================================================
export const chartTooltipProps = {
    contentStyle: {
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        border: '1px solid #1A1A1A',
        borderRadius: '8px',
        padding: '8px',
    },
    labelStyle: { color: '#666666', fontSize: '10px' },
    itemStyle: { color: '#FFFFFF', fontSize: '12px', fontFamily: 'monospace' },
}
