import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    // params: ?title=...&subtitle=...&type=...
    const title = searchParams.get('title') || 'CryptoTW Pro';
    const subtitle = searchParams.get('subtitle') || '你的 Web3 數據中心';
    const type = searchParams.get('type') || 'default'; // default, indicator, article
    const value = searchParams.get('value') || ''; // e.g. "82 (Extreme Greed)"

    // Colors
    const bg = '#000000';
    const accent = '#F59E0B'; // Amber-500

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: bg,
                    backgroundImage: 'linear-gradient(to bottom right, #000000, #111111)',
                    position: 'relative',
                }}
            >
                {/* Background Grid Accent */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `radial-gradient(circle at 25px 25px, #222 2%, transparent 0%), radial-gradient(circle at 75px 75px, #222 2%, transparent 0%)`,
                        backgroundSize: '100px 100px',
                        opacity: 0.3,
                    }}
                />

                {/* Logo Area */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
                    {/* Simplified Logo representation */}
                    <div style={{
                        width: 50,
                        height: 50,
                        background: accent,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 20
                    }}>
                        <div style={{ color: '#000', fontSize: 24, fontWeight: 900 }}>CW</div>
                    </div>
                    <div style={{ fontSize: 32, color: 'white', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        CryptoTW Pro
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 60px', textAlign: 'center' }}>
                    <div style={{
                        fontSize: 64,
                        fontWeight: 900,
                        lineHeight: 1.1,
                        marginBottom: 20,
                        backgroundImage: `linear-gradient(to bottom, #ffffff, #aaaaaa)`,
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}>
                        {title}
                    </div>

                    <div style={{ fontSize: 32, color: '#888', fontWeight: 400, maxWidth: 900 }}>
                        {subtitle}
                    </div>

                    {/* Dynamic Badge for Value */}
                    {value && (
                        <div style={{
                            marginTop: 40,
                            padding: '12px 32px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: 100,
                            color: accent,
                            fontSize: 28,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            {value}
                        </div>
                    )}
                </div>

                {/* Footer Decor */}
                <div style={{
                    position: 'absolute',
                    bottom: 40,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    color: '#444',
                    fontSize: 20
                }}>
                    pro.cryptotw.com
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}
