'use client';

import { useParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import IndicatorStoryPage from '@/components/IndicatorStoryPage';
import { getIndicatorStory, getZoneFromValue, ZONE_LABELS, IndicatorStory } from '@/lib/indicator-stories';

interface LiveData {
    fearGreed?: { value: string; classification: string };
}

function generatePositionHeadline(value: number, classification: string): string {
    return `${classification}（指數 ${value}）`;
}

function generatePositionRationale(value: number): string {
    if (value >= 75) {
        return '過去當指數超過 75 時，市場短期出現較大波動的機率明顯上升。這不代表會立即下跌，但風險正在累積。';
    } else if (value >= 50) {
        return '市場情緒偏向樂觀，但尚未進入極端區間。可持續觀察是否進一步升溫。';
    } else if (value >= 25) {
        return '市場情緒偏向謹慎，可能存在未被充分定價的機會。';
    } else {
        return '市場處於極度恐懼狀態，歷史上這類時期往往伴隨長期買入機會，但短期波動仍然劇烈。';
    }
}

export default function IndicatorPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [liveData, setLiveData] = useState<LiveData | null>(null);
    const [loading, setLoading] = useState(true);

    const baseStory = getIndicatorStory(slug);

    useEffect(() => {
        if (slug === 'fear-greed') {
            fetch('/api/market')
                .then(res => res.json())
                .then(data => {
                    setLiveData({ fearGreed: data.fearGreed });
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [slug]);

    if (!baseStory) {
        notFound();
    }

    // 構建帶有真實數據的 story
    let story: IndicatorStory = baseStory;

    if (slug === 'fear-greed' && liveData?.fearGreed) {
        const value = parseInt(liveData.fearGreed.value);
        const classification = liveData.fearGreed.classification;
        const zone = getZoneFromValue(value);

        story = {
            ...baseStory,
            currentValue: value,
            zone,
            positionHeadline: generatePositionHeadline(value, classification),
            positionRationale: generatePositionRationale(value),
        };
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-neutral-500 text-sm">載入中...</div>
            </main>
        );
    }

    return <IndicatorStoryPage story={story} />;
}
