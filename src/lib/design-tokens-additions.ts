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

// ================================================
// ANIMATION SYSTEM (Card System v3.0 - Chapter 12)
// ================================================
export const ANIMATION = {
    // Durations
    micro: 'duration-75',      // 75ms - hover, active states
    standard: 'duration-150',  // 150ms - expand/collapse, modal
    complex: 'duration-300',   // 300ms - page transitions

    // Easings
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',

    // Presets (Common patterns)
    hoverCard: 'transition-colors duration-75',
    hoverBorder: 'transition-border duration-75',
    activePress: 'active:scale-[0.98] transition-transform duration-75',
    expandCollapse: 'transition-all duration-150 ease-out',
    fadeIn: 'transition-opacity duration-150',

    // Micro-interactions
    buttonHover: 'transition-all duration-75 hover:scale-105',
    iconSpin: 'transition-transform duration-150',
} as const

// ================================================
// FOCUS SYSTEM (Accessibility - Chapter 7)
// ================================================
export const FOCUS = {
    // Standard focus ring (blue)
    ring: 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none',

    // Danger focus ring (red)
    ringDanger: 'focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none',

    // Success focus ring (green)
    ringSuccess: 'focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none',

    // Subtle focus (for cards)
    ringSubtle: 'focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none',

    // Skip link focus (high contrast)
    ringHigh: 'focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black outline-none',
} as const
