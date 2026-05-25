// app/api/reservations/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { clients, reservations } from '@/db/schema'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
    try {
        const { userId } = await auth()
        const body = await request.json()

        console.log('📥 Reservation body:', JSON.stringify(body, null, 2))

        // ── Validate required fields ──────────────────────────────────
        const required = ['nom', 'telephone', 'country', 'city', 'departId']
        for (const field of required) {
            if (!body[field]) {
                return NextResponse.json(
                    { success: false, error: `Champ requis manquant: ${field}` },
                    { status: 400 }
                )
            }
        }

        // ── 1. Create client ──────────────────────────────────────────
        const [client] = await db
            .insert(clients)
            .values({
                nom: body.nom,
                telephone: body.telephone,
                email: body.email || null,
                country: body.country,     // ✅ ISO country code e.g. 'FR', 'DZ'
                city: body.city,         // ✅ free text city
            })
            .returning()

        console.log('✅ Client created:', client.id)

        // ── 2. Create reservation ─────────────────────────────────────
        const [reservation] = await db
            .insert(reservations)
            .values({
                departId: body.departId,
                clientId: client.id,
                clerkUserId: userId ?? 'guest',  // ✅ allow guest bookings
                nombrePersonnes: Number(body.nombrePersonnes) || 1,
                statut: 'en_attente',
                notes: body.notes || null,
            })
            .returning()

        console.log('✅ Reservation created:', reservation.id)

        return NextResponse.json(
            { success: true, data: { client, reservation } },
            { status: 201 }
        )

    } catch (error) {
        console.error('❌ Reservation error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur serveur'
            },
            { status: 500 }
        )
    }
}
