import { QuizShell } from '@/components/quiz/QuizShell'
import { PageShell } from '@/components/layout/PageShell'

export default function QuizPage() {
    return (
        <PageShell className="flex items-center justify-center py-10">
            <QuizShell />
        </PageShell>
    )
}
