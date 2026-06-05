// app/api/admin/departs/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { departs } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
    try {
        const all = await db.select().from(departs).orderBy(departs.date)
        return NextResponse.json({ success: true, data: all })
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        if (!body.circuitId || !body.date || !body.placesMax) {
            return NextResponse.json(
                { success: false, error: 'Champs requis: circuitId, date, placesMax' },
                { status: 400 }
            )
        }

        const [depart] = await db
            .insert(departs)
            .values({
                circuitId:       body.circuitId,
                date:            new Date(body.date),
                placesMax:       Number(body.placesMax),
                placesRestantes: Number(body.placesRestantes ?? body.placesMax),
                prixSpecial:     body.prixSpecial ? Number(body.prixSpecial) : null,
                notes:           body.notes || null,
            })
            .returning()

        return NextResponse.json({ success: true, data: depart }, { status: 201 })
    } catch (error) {
        console.error('POST departs error:', error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { id, ...updates } = body

        if (!id) return NextResponse.json({ success: false, error: 'ID manquant' }, { status: 400 })

        const [updated] = await db
            .update(departs)
            .set({
                ...(updates.circuitId        !== undefined && { circuitId:       updates.circuitId }),
                ...(updates.date             !== undefined && { date:            new Date(updates.date) }),
                ...(updates.placesMax        !== undefined && { placesMax:       Number(updates.placesMax) }),
                ...(updates.placesRestantes  !== undefined && { placesRestantes: Number(updates.placesRestantes) }),
                ...(updates.prixSpecial      !== undefined && { prixSpecial:     updates.prixSpecial ? Number(updates.prixSpecial) : null }),
                ...(updates.notes            !== undefined && { notes:           updates.notes }),
            })
            .where(eq(departs.id, id))
            .returning()

        return NextResponse.json({ success: true, data: updated })
    } catch (error) {
        console.error('PATCH departs error:', error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ success: false, error: 'ID manquant' }, { status: 400 })
        await db.delete(departs).where(eq(departs.id, id))
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
