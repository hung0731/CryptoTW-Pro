/**
 * Performance Optimization Utility
 * 
 * Provides hooks and utilities for optimizing render performance
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * useIntersectionObserver
 * 
 * Hook for implementing lazy loading and visibility detection
 * 
 * @example
 * const ref = useIntersectionObserver((isVisible) => {
 *   if (isVisible) loadData();
 * });
 * 
 * return <div ref={ref}>...</div>
 */
export function useIntersectionObserver(
    callback: (isVisible: boolean) => void,
    options?: IntersectionObserverInit
) {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                callback(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options,
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [callback, options]);

    return elementRef;
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function for scroll/resize events
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
