import React from 'react';

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}

export function Sparkline({
    data,
    width = 100,
    height = 30,
    color = '#3b82f6',
    className
}: SparklineProps) {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Calculate points
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height; // Invert Y because SVG coordinates
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            preserveAspectRatio="none"
        >
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
