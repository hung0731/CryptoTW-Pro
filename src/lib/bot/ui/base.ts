import { FlexMessage, FlexBubble, FlexBox } from '@line/bot-sdk'

// Config
const BRAND_COLOR = '#F59E0B' // Amber-500 equivalent for CryptoTW
const BG_COLOR = '#171717' // Neutral-900
const TEXT_COLOR = '#FFFFFF'
const SUBTEXT_COLOR = '#A3A3A3' // Neutral-400
const LOGO_URL = 'https://raw.githubusercontent.com/Hsuan777/assets/main/cryptotw-logo-v2.png' // Placeholder, user to confirm real URL later

export interface FlexMessageOptions {
    title: string
    mainText: string
    subText?: string // Date or secondary info
    heroImageUrl?: string
    actionLabel?: string
    actionUrl?: string
    theme?: 'default' | 'alert' | 'success'
}

export function createBrandedFlexMessage(options: FlexMessageOptions): FlexMessage {
    const { title, mainText, subText, heroImageUrl, actionLabel, actionUrl, theme = 'default' } = options

    const accentColor = theme === 'alert' ? '#EF4444' : theme === 'success' ? '#22C55E' : BRAND_COLOR

    const bubble: FlexBubble = {
        type: 'bubble',
        size: 'giga',
        header: {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: BG_COLOR,
            paddingAll: '15px',
            contents: [
                {
                    type: 'text',
                    text: 'CryptoTW Pro',
                    color: BRAND_COLOR,
                    weight: 'bold',
                    size: 'sm',
                    flex: 1,
                    align: 'start',
                    gravity: 'center'
                },
                // Add a "NEW" or "ALERT" badge if needed
                {
                    type: 'text',
                    text: title,
                    color: TEXT_COLOR,
                    weight: 'bold',
                    size: 'xs',
                    align: 'end',
                    flex: 2,
                    gravity: 'center'
                }
            ]
        },
        hero: heroImageUrl ? {
            type: 'image',
            url: heroImageUrl,
            size: 'full',
            aspectRatio: '20:13',
            aspectMode: 'cover',
        } : undefined,
        body: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: BG_COLOR,
            paddingAll: '20px',
            contents: [
                {
                    type: 'text',
                    text: mainText,
                    color: TEXT_COLOR,
                    size: 'lg',
                    weight: 'bold',
                    wrap: true
                },
                subText ? {
                    type: 'text',
                    text: subText,
                    color: SUBTEXT_COLOR,
                    size: 'sm',
                    wrap: true,
                    margin: 'md'
                } : { type: 'spacer' }
            ]
        },
        footer: actionUrl ? {
            type: 'box',
            layout: 'vertical',
            backgroundColor: BG_COLOR,
            paddingAll: '15px',
            contents: [
                {
                    type: 'button',
                    action: {
                        type: 'uri',
                        label: actionLabel || '查看詳情',
                        uri: actionUrl
                    },
                    color: accentColor,
                    style: 'primary',
                    height: 'sm'
                },
                {
                    type: 'text',
                    text: 'CryptoTW - Your AI Crypto Assistant',
                    color: '#525252',
                    size: 'xxs',
                    align: 'center',
                    margin: 'lg'
                }
            ]
        } : undefined,
        styles: {
            footer: {
                separator: true
            }
        }
    }

    return {
        type: 'flex',
        altText: `${title}: ${mainText.substring(0, 30)}...`,
        contents: bubble
    }
}
