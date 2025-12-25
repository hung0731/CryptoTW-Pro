import { LearnLandingClient } from '@/components/learn/LearnLandingClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '加密學院 | Zero to Hero',
    description: '從新手到高手的完整加密貨幣交易課程',
}

export default function LearnPage() {
    return <LearnLandingClient />
}
