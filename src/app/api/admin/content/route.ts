import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ content: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { title, body: contentBody, type, access_level, is_published } = body

        if (!title || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('content')
            .insert({
                title,
                body: contentBody,
                type,
                access_level: access_level || 'free',
                is_published: is_published || false
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ content: data })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, title, body: contentBody, type, access_level, is_published } = body

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('content')
            .update({
                title,
                body: contentBody,
                type,
                access_level,
                is_published,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ content: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const supabase = createAdminClient()
        const { error } = await supabase
            .from('content')
            .delete()
            .eq('id', id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
