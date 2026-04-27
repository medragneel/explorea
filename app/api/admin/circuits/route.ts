// app/api/admin/circuits/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { circuits } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

// ── GET all circuits ──────────────────────────────────────────────────────
export async function GET() {
    try {
        const all = await db.select().from(circuits).orderBy(circuits.createdAt)
        return NextResponse.json({ success: true, data: all })
    } catch (error) {
        console.error('GET /api/admin/circuits error:', error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}

// ── POST create circuit ───────────────────────────────────────────────────
export async function POST(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
        }

        const body = await request.json()
        console.log('📥 Create circuit body:', body)

        // Validate required fields
        const required = ['nom', 'description', 'prix', 'duree', 'region']
        for (const field of required) {
            if (!body[field] && body[field] !== 0) {
                return NextResponse.json(
                    { success: false, error: `Champ requis manquant: ${field}` },
                    { status: 400 }
                )
            }
        }

        const [circuit] = await db
            .insert(circuits)
            .values({
                nom: body.nom,
                description: body.description,
                prix: Number(body.prix),
                duree: Number(body.duree),
                region: body.region,
                image: body.image || null,
                actif: body.actif ?? true,
            })
            .returning()

        console.log('✅ Circuit created:', circuit.id)
        return NextResponse.json({ success: true, data: circuit }, { status: 201 })

    } catch (error) {
        console.error('POST /api/admin/circuits error:', error)
        // ✅ Log full error details
        console.error(error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}

// ── PATCH update circuit ──────────────────────────────────────────────────
export async function PATCH(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
        }

        const body = await request.json()
        if (!body.id) {
            return NextResponse.json({ success: false, error: 'ID manquant' }, { status: 400 })
        }

        const { id, ...updates } = body

        const [updated] = await db
            .update(circuits)
            .set({
                ...(updates.nom && { nom: updates.nom }),
                ...(updates.description && { description: updates.description }),
                ...(updates.prix !== undefined && { prix: Number(updates.prix) }),
                ...(updates.duree !== undefined && { duree: Number(updates.duree) }),
                ...(updates.region && { region: updates.region }),
                ...(updates.image !== undefined && { image: updates.image }),
                ...(updates.actif !== undefined && { actif: updates.actif }),
            })
            .where(eq(circuits.id, id))
            .returning()

        return NextResponse.json({ success: true, data: updated })

    } catch (error) {
        console.error('PATCH /api/admin/circuits error:', error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}

// ── DELETE circuit ────────────────────────────────────────────────────────
export async function DELETE(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID manquant' }, { status: 400 })
        }

        await db.delete(circuits).where(eq(circuits.id, id))
        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('DELETE /api/admin/circuits error:', error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
