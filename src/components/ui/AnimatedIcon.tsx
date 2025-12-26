'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'
import { LucideIcon, LucideProps } from 'lucide-react'
import { cn } from '@/lib/utils'

// Animation Variants
const shake: Variants = {
    hover: {
        rotate: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
    }
}

const pulse: Variants = {
    hover: {
        scale: [1, 1.1, 1],
        transition: { duration: 0.5, repeat: Infinity }
    }
}

const spin: Variants = {
    hover: {
        rotate: 360,
        transition: { duration: 1, ease: "linear", repeat: Infinity }
    }
}

const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
            pathLength: { duration: 1, bounce: 0 },
            opacity: { duration: 0.01 }
        }
    }
}

interface AnimatedIconProps extends Omit<LucideProps, 'ref'> {
    icon: LucideIcon
    animation?: 'shake' | 'pulse' | 'spin' | 'draw' | 'none'
    weight?: 'thin' | 'normal' | 'bold'
    variant?: 'solid' | 'duotone' | 'outline'
}

export function AnimatedIcon({
    icon: Icon,
    animation = 'none',
    weight = 'normal',
    variant = 'outline',
    className,
    color,
    ...props
}: AnimatedIconProps) {

    // Map weights to stroke widths
    const strokeWidth = weight === 'thin' ? 1.5 : weight === 'bold' ? 2.5 : 2

    // Resolve Animation
    const getAnimationProps = () => {
        if (animation === 'none') return {}
        if (animation === 'draw') return {
            initial: "hidden",
            animate: "visible",
            variants: draw
        }
        return {
            whileHover: "hover",
            variants: animation === 'shake' ? shake : animation === 'pulse' ? pulse : spin
        }
    }

    const animProps = getAnimationProps()

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>

            {/* DUOTONE LAYER (Background opacity) */}
            {variant === 'duotone' && (
                <Icon
                    {...props}
                    strokeWidth={0}
                    fill="currentColor"
                    // User requested purple background for the icons
                    className="absolute inset-0 opacity-25 text-purple-500"
                />
            )}

            {/* MAIN ICON LAYER (Strokes) */}
            <motion.div {...animProps} className="flex items-center justify-center">
                <Icon
                    {...props}
                    strokeWidth={strokeWidth}
                    className={cn("relative z-10")}
                />
            </motion.div>
        </div>
    )
}
