import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database'
import { LearnLevel, LearnChapter } from '@/lib/learn-data'

// Interface for what we store in metadata->learn_progress
export interface LearnProgressData {
    completedChapters: string[] // Array of chapter IDs 'l0-c1', etc.
    lastActiveLevel: string
    quizScores: Record<string, number> // 'q-l0-c1': 100
    wrongQuestions: Record<string, string[]> // 'q-l0-c1': ['q1', 'q3']
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies()

        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                },
            }
        )
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('metadata')
            .eq('id', session.user.id)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const userData = user as any
        const metadata = userData?.metadata
        const progress = metadata?.learn_progress || {
            completedChapters: [],
            lastActiveLevel: 'level-0',
            quizScores: {}
        }

        return NextResponse.json({ progress })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()

        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                },
            }
        )
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { completed, level, quizId, score, prevWrongQuestions } = body

        // Fetch current metadata first
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('metadata')
            .eq('id', session.user.id)
            .single()

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 })
        }

        const userData = user as any
        const currentMetadata = (userData?.metadata) || {}
        const currentProgress = currentMetadata.learn_progress || {
            completedChapters: [],
            lastActiveLevel: 'level-0',
            quizScores: {}
        }

        // Update Logic
        const newProgress: LearnProgressData = { ...currentProgress }

        // 1. Mark Chapter Complete
        if (completed && !newProgress.completedChapters.includes(completed)) {
            newProgress.completedChapters.push(completed)
        }

        // 2. Update Quiz Score (if better)
        if (quizId && typeof score === 'number') {
            const currentScore = newProgress.quizScores[quizId] || 0
            if (score > currentScore) {
                newProgress.quizScores[quizId] = score
                if (score > currentScore) {
                    newProgress.quizScores[quizId] = score
                }
            }

            // 3. Update Wrong Questions
            if (quizId && prevWrongQuestions && Array.isArray(prevWrongQuestions)) {
                // Overwrite or Merge? Usually we want to track current wrong state.
                // If user retries and gets right, we might want to remove it?
                // For simple "Notebook", let's accumulating them OR just set what was wrong in this attempt.
                // Let's implement ADDITIVE logic for now: if wrong, add to list. 
                // TO DO: Remove if answered correctly later? For now just log all historical wrongs could be noisy.
                // Better: 'Current Wrong List'. If answered correctly, remove from list.
                // Assumption: client sends the list of WRONG questions for this specific quiz attempt.

                const existing = newProgress.wrongQuestions || {}
                // If passing 'wrongQuestions' in body, it should probably represent the *result of this attempt*.

                if (!newProgress.wrongQuestions) newProgress.wrongQuestions = {}

                // Merging logic: Add new wrongs, keep old wrongs (unless we implement 'fix' logic)
                // Simpler: Just save the latest wrong questions for this quiz? 
                // But we want a "Notebook" of ALL wrong questions ever?
                // Let's just UNION them.
                const currentWrongs = new Set(existing[quizId] || [])
                prevWrongQuestions.forEach((qId: string) => currentWrongs.add(qId))
                newProgress.wrongQuestions[quizId] = Array.from(currentWrongs)
            }
        }

        // 3. Update Level (if provided)
        if (level) {
            newProgress.lastActiveLevel = level
        }

        // Save back to DB
        const { error: updateError } = await supabase
            .from('users')
            .update({
                metadata: {
                    ...currentMetadata,
                    learn_progress: newProgress
                } as any // Bypass strict typing for JSONB
            })
            .eq('id', session.user.id)

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, progress: newProgress })

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
