'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
    targetDate: string;
    className?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
}

function calculateTimeLeft(targetDate: string): TimeLeft {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isPast: false,
    };
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!mounted) {
        return (
            <div className={cn("animate-pulse h-16 bg-[#1A1A1A] rounded-xl", className)} />
        );
    }

    if (timeLeft.isPast) {
        return (
            <div className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]",
                className
            )}>
                <Clock className="w-4 h-4 text-[#666]" />
                <span className="text-sm text-[#888]">活動已開始或已結束</span>
            </div>
        );
    }

    const TimeBlock = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center">
                <span className="text-xl font-bold text-white font-mono">
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="text-[10px] text-[#666] mt-1">{label}</span>
        </div>
    );

    return (
        <div className={cn("", className)}>
            <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-[#888]">距離活動開始</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
                <TimeBlock value={timeLeft.days} label="天" />
                <span className="text-xl text-[#333] font-bold">:</span>
                <TimeBlock value={timeLeft.hours} label="時" />
                <span className="text-xl text-[#333] font-bold">:</span>
                <TimeBlock value={timeLeft.minutes} label="分" />
                <span className="text-xl text-[#333] font-bold">:</span>
                <TimeBlock value={timeLeft.seconds} label="秒" />
            </div>
        </div>
    );
}
