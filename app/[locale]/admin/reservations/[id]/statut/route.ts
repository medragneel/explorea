// app/api/reservations/[id]/statut/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { reservations } from '@/db/schema'
import { eq } from 'drizzle-orm'

const VALID_STATUTS = ['en_attente', 'confirme', 'annule'] as const
type Statut = typeof VALID_STATUTS[number]

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { statut } = body as { statut: Statut }

        // Validate
        if (!VALID_STATUTS.includes(statut)) {
            return NextResponse.json(
                { success: false, error: 'Statut invalide' },
                { status: 400 }
            )
        }

        // Update in DB
        const [updated] = await db
            .update(reservations)
            .set({ statut })
            .where(eq(reservations.id, params.id))
            .returning()

        if (!updated) {
            return NextResponse.json(
                { success: false, error: 'Réservation introuvable' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: updated })

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
