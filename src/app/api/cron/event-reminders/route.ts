import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// This endpoint should be called by a cron job every hour
// GET /api/cron/event-reminders - Send LINE reminders for upcoming events
export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();
        const now = new Date();

        // Find bookmarks where event is starting within the notify window
        // and reminder hasn't been sent yet
        const { data: bookmarks, error } = await supabase
            .from('event_bookmarks')
            .select(`
                id,
                user_id,
                event_id,
                notify_before_hours,
                events (
                    id,
                    title,
                    slug,
                    start_date,
                    venue_name,
                    city,
                    location_type,
                    registration_url
                ),
                users (
                    id,
                    line_user_id,
                    display_name
                )
            `)
            .is('reminder_sent_at', null);

        if (error) {
            logger.error('Failed to fetch bookmarks for reminders', error, { feature: 'event-reminders' });
            return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
        }

        const remindersToSend: Array<{
            bookmarkId: string;
            lineUserId: string;
            event: any;
            userName: string;
        }> = [];

        for (const bookmark of bookmarks || []) {
            const event = (bookmark as any).events;
            const user = (bookmark as any).users;

            if (!event || !user?.line_user_id) continue;

            const eventStart = new Date(event.start_date);
            const hoursUntilEvent = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);

            // Check if within reminder window (e.g., 24 hours before, but not less than 1 hour)
            const notifyHours = bookmark.notify_before_hours || 24;
            if (hoursUntilEvent <= notifyHours && hoursUntilEvent > 1) {
                remindersToSend.push({
                    bookmarkId: bookmark.id,
                    lineUserId: user.line_user_id,
                    event,
                    userName: user.display_name || '用戶'
                });
            }
        }

        // Send LINE messages
        const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
        const sentReminders: string[] = [];

        for (const reminder of remindersToSend) {
            try {
                const eventStart = new Date(reminder.event.start_date);
                const location = reminder.event.location_type === 'online'
                    ? '線上活動'
                    : [reminder.event.venue_name, reminder.event.city].filter(Boolean).join('・');

                const message = {
                    type: 'flex',
                    altText: `🔔 活動提醒：${reminder.event.title}`,
                    contents: {
                        type: 'bubble',
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: '🔔 活動提醒',
                                    weight: 'bold',
                                    size: 'sm',
                                    color: '#1DB446'
                                },
                                {
                                    type: 'text',
                                    text: reminder.event.title,
                                    weight: 'bold',
                                    size: 'lg',
                                    margin: 'md',
                                    wrap: true
                                },
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    margin: 'lg',
                                    spacing: 'sm',
                                    contents: [
                                        {
                                            type: 'box',
                                            layout: 'baseline',
                                            spacing: 'sm',
                                            contents: [
                                                { type: 'text', text: '📅', size: 'sm', flex: 1 },
                                                { type: 'text', text: eventStart.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' }), size: 'sm', flex: 5, wrap: true }
                                            ]
                                        },
                                        {
                                            type: 'box',
                                            layout: 'baseline',
                                            spacing: 'sm',
                                            contents: [
                                                { type: 'text', text: '🕐', size: 'sm', flex: 1 },
                                                { type: 'text', text: eventStart.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }), size: 'sm', flex: 5 }
                                            ]
                                        },
                                        {
                                            type: 'box',
                                            layout: 'baseline',
                                            spacing: 'sm',
                                            contents: [
                                                { type: 'text', text: '📍', size: 'sm', flex: 1 },
                                                { type: 'text', text: location || '待定', size: 'sm', flex: 5, wrap: true }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        footer: {
                            type: 'box',
                            layout: 'vertical',
                            spacing: 'sm',
                            contents: [
                                {
                                    type: 'button',
                                    style: 'primary',
                                    action: {
                                        type: 'uri',
                                        label: '查看活動',
                                        uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://cryptotw.pro'}/events/${reminder.event.slug}`
                                    }
                                },
                                ...(reminder.event.registration_url ? [{
                                    type: 'button',
                                    action: {
                                        type: 'uri',
                                        label: '前往報名',
                                        uri: reminder.event.registration_url
                                    }
                                }] : [])
                            ]
                        }
                    }
                };

                // Send via LINE Messaging API
                if (channelAccessToken) {
                    const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${channelAccessToken}`
                        },
                        body: JSON.stringify({
                            to: reminder.lineUserId,
                            messages: [message]
                        })
                    });

                    if (lineRes.ok) {
                        // Mark reminder as sent
                        await supabase
                            .from('event_bookmarks')
                            .update({ reminder_sent_at: new Date().toISOString() })
                            .eq('id', reminder.bookmarkId);

                        sentReminders.push(reminder.event.title);
                    }
                }
            } catch (e) {
                logger.error('Failed to send reminder', e, {
                    feature: 'event-reminders',
                    eventId: reminder.event.id
                });
            }
        }

        logger.info('Event reminders job completed', {
            feature: 'event-reminders',
            checked: bookmarks?.length || 0,
            sent: sentReminders.length
        });

        return NextResponse.json({
            message: `Sent ${sentReminders.length} reminders`,
            sent: sentReminders
        });
    } catch (error) {
        logger.error('Error in event reminders cron', error, { feature: 'event-reminders' });
        return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
    }
}
