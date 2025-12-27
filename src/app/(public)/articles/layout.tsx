import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '深度文章',
    description: 'CryptoTW Pro 深度分析專欄。涵蓋市場分析、鏈上數據解讀、總體經濟趨勢與項目研究報告。',
    keywords: ['加密貨幣分析', '比特幣研究', '鏈上數據', 'Crypto Research', 'Market Analysis'],
    alternates: {
        canonical: '/articles',
    }
}

export default function ArticlesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
