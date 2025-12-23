'use client'

import React from 'react'
import { UniversalCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/UniversalCard'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { PageHeader } from '@/components/PageHeader'
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

export default function DesignSystemPage() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader title="Design System Showcase" showLogo={false} backHref="/admin" backLabel="Admin" />

            <div className={cn("max-w-3xl mx-auto", SPACING.pageX, SPACING.pageTop)}>

                {/* Intro */}
                <div className={cn(SPACING.sectionGap)}>
                    <SectionHeaderCard
                        title="UniversalCard Variants"
                        description="Strict enforcement of variant='default' | 'subtle' | 'highlight' | 'danger'"
                    />

                    <div className={cn("grid grid-cols-1 md:grid-cols-2", SPACING.classes.gapCards)}>
                        {/* Default */}
                        <UniversalCard variant="default">
                            <CardHeader>
                                <CardTitle>Default Card</CardTitle>
                                <CardDescription>Most common surface.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-12 bg-white/5 rounded flex items-center justify-center text-xs text-neutral-500">
                                    Content Area
                                </div>
                            </CardContent>
                            <CardFooter>
                                <span>Updated 5m ago</span>
                                <span className="text-white font-medium">Read More &rarr;</span>
                            </CardFooter>
                        </UniversalCard>

                        {/* Highlight */}
                        <UniversalCard variant="highlight">
                            <CardHeader>
                                <CardTitle>Highlight Card</CardTitle>
                                <CardDescription>For active states or featured items.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className={TYPOGRAPHY.bodyDefault}>
                                    This surface is slightly lighter and uses a brighter border.
                                </p>
                            </CardContent>
                        </UniversalCard>

                        {/* Subtle */}
                        <UniversalCard variant="subtle">
                            <CardHeader>
                                <CardTitle>Subtle Card</CardTitle>
                                <CardDescription>Secondary info / grouping.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className={TYPOGRAPHY.bodySmall}>
                                    Uses a dashed border and lower contrast background.
                                </p>
                            </CardContent>
                        </UniversalCard>

                        {/* Danger */}
                        <UniversalCard variant="danger">
                            <CardHeader>
                                <CardTitle className="text-red-400">Danger Card</CardTitle>
                                <CardDescription className="text-red-400/70">Critical alerts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className={cn(TYPOGRAPHY.bodyDefault, "text-red-200")}>
                                    Something went wrong or requires immediate attention.
                                </p>
                            </CardContent>
                        </UniversalCard>
                    </div>
                </div>

                {/* Sizes */}
                <div className={cn(SPACING.sectionGap)}>
                    <SectionHeaderCard
                        title="Card Sizes"
                        description="size='S' | 'M' | 'L' controls padding and radius"
                    />

                    <div className="space-y-4">
                        {/* Size L */}
                        <UniversalCard size="L">
                            <CardHeader>
                                <CardTitle>Large (L)</CardTitle>
                                <CardDescription>Radius XL, Padding 20px</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className={TYPOGRAPHY.bodyLarge}>Used for primary charts and detailed analysis.</p>
                            </CardContent>
                        </UniversalCard>

                        {/* Size M */}
                        <UniversalCard size="M">
                            <CardHeader>
                                <CardTitle>Medium (M)</CardTitle>
                                <CardDescription>Radius XL, Padding 16px</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className={TYPOGRAPHY.bodyDefault}>Standard feed item.</p>
                            </CardContent>
                        </UniversalCard>

                        {/* Size S */}
                        <div className="grid grid-cols-2 gap-3">
                            <UniversalCard size="S" className="flex items-center justify-between">
                                <span className={TYPOGRAPHY.cardTitle}>Small (S)</span>
                                <span className={TYPOGRAPHY.monoMedium}>$64,000</span>
                            </UniversalCard>
                            <UniversalCard size="S" className="flex items-center justify-between">
                                <span className={TYPOGRAPHY.cardTitle}>Small (S)</span>
                                <span className="text-green-500 font-mono text-sm">+5.2%</span>
                            </UniversalCard>
                        </div>
                    </div>
                </div>

                {/* Section Headers */}
                <div className={cn(SPACING.sectionGap)}>
                    <SectionHeaderCard
                        title="Section Headers"
                        description="With interactive elements"
                        rightElement={
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded bg-white/10 text-[10px]">Filter</span>
                                <span className="px-2 py-1 rounded bg-white/10 text-[10px]">Sort</span>
                            </div>
                        }
                    />
                    <UniversalCard>
                        <CardContent className="h-24 flex items-center justify-center text-neutral-600">
                            Section Content
                        </CardContent>
                    </UniversalCard>
                </div>

            </div>
        </main>
    )
}
