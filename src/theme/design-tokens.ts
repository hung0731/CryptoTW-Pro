export const tokens = {
    colors: {
        bg: {
            base: 'var(--bg-base)',       // App Background
            surface1: 'var(--bg-surface-1)', // Card Default
            surface2: 'var(--bg-surface-2)', // Card Hover / Highlight
            overlay: 'var(--bg-overlay)',    // Modals
        },
        text: {
            primary: 'var(--text-primary)',   // Titles, Data
            secondary: 'var(--text-secondary)', // Body, Explanations
            tertiary: 'var(--text-tertiary)',   // Meta, Timestamp
            inverse: 'var(--text-inverse)',     // Text on Signals
        },
        border: {
            subtle: 'var(--border-subtle)', // Default Card Border
            strong: 'var(--border-strong)', // Active Inputs, Dividers
        },
        signal: {
            bull: 'var(--signal-bull)',
            bear: 'var(--signal-bear)',
            warn: 'var(--signal-warn)',
            neutral: 'var(--signal-neutral)',
            critical: 'var(--signal-critical)', // Emergency/War Room
        }
    },
    spacing: {
        1: '4px',
        2: '8px',
        3: '12px', // Mobile Gap
        4: '16px', // Desktop Gap / Padding
        6: '24px', // Section Gap
        8: '32px', // Page Gap
    },
    radius: {
        sm: '4px',   // Badges
        md: '8px',   // Cards (Small)
        lg: '12px',  // Cards (Large)
        full: '9999px', // Pills
    },
    layout: {
        maxWidth: '1200px',
        headerHeight: '64px',
        mobilePadding: '16px',
        templates: {
            dashboard: 'min-h-screen pb-20 md:pb-8',
            feed: 'max-w-md mx-auto',
            catalog: 'grid grid-cols-1 md:grid-cols-3 gap-4',
        }
    }
} as const;

// Helper to ensure consistency
export type SignalType = 'bull' | 'bear' | 'warn' | 'neutral' | 'critical';
export type CardPadding = 's' | 'm';
export type CardVariant = 'default' | 'subtle' | 'highlight' | 'danger';
