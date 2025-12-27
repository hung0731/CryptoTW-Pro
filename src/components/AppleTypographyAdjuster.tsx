'use client';

import { useEffect } from 'react';

export function AppleTypographyAdjuster() {
    useEffect(() => {
        // Detect if user is on macOS or iOS
        const isApple = /Mac|iPod|iPhone|iPad/.test(navigator.platform) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad Pro

        if (isApple) {
            document.documentElement.setAttribute('data-platform', 'apple');
        }
    }, []);

    return null;
}
