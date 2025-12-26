'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
    targetDate: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function CountdownTimer({ targetDate, className, size = 'sm' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
                setIsExpired(false);
            } else {
                setIsExpired(true);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (isExpired) {
        return (
            <div className={cn("text-neutral-500 font-mono flex items-center gap-1", className)}>
                <Clock className="w-3 h-3" />
                <span>已結束</span>
            </div>
        );
    }

    const TimeBlock = ({ value, label }: { value: number, label: string }) => (
        <div className="flex flex-col items-center min-w-[20px]">
            <span className={cn("font-bold font-mono leading-none",
                size === 'sm' ? "text-xs" :
                    size === 'md' ? "text-sm" : "text-base"
            )}>
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-[8px] text-neutral-500 uppercase leading-none mt-0.5">{label}</span>
        </div>
    );

    const Separator = () => (
        <span className={cn("font-bold text-neutral-600 mb-1.5",
            size === 'sm' ? "text-xs px-0.5" : "text-sm px-1"
        )}>:</span>
    );

    return (
        <div className={cn("flex items-end bg-neutral-900/50 rounded-md py-1 px-2 border border-white/5", className)}>
            <TimeBlock value={timeLeft.days} label="d" />
            <Separator />
            <TimeBlock value={timeLeft.hours} label="h" />
            <Separator />
            <TimeBlock value={timeLeft.minutes} label="m" />
            {size !== 'sm' && (
                <>
                    <Separator />
                    <TimeBlock value={timeLeft.seconds} label="s" />
                </>
            )}
        </div>
    );
}
