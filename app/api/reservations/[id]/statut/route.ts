// app/api/reservations/[id]/statut/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { reservations, departs } from '@/db/schema'
import { eq } from 'drizzle-orm'

const VALID_STATUTS = ['en_attente', 'confirme', 'annule'] as const
type Statut = typeof VALID_STATUTS[number]

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { statut } = body as { statut: Statut }

        if (!VALID_STATUTS.includes(statut)) {
            return NextResponse.json(
                { success: false, error: 'Statut invalide' },
                { status: 400 }
            )
        }

        // ── 1. Get current reservation ──────────────────────────────────
        const current = await db.query.reservations.findFirst({
            where: eq(reservations.id, id),
        })

        if (!current) {
            return NextResponse.json(
                { success: false, error: 'Réservation introuvable' },
                { status: 404 }
            )
        }

        const previousStatut = current.statut as Statut
        const departId = current.departId
        const nombrePersonnes = current.nombrePersonnes

        // No-op if status hasn't actually changed
        if (previousStatut === statut) {
            return NextResponse.json({ success: true, data: current })
        }

        const wasConfirmed = previousStatut === 'confirme'
        const isConfirmed = statut === 'confirme'

        let seatDelta = 0
        if (!wasConfirmed && isConfirmed) seatDelta = -nombrePersonnes  // taking seats
        if (wasConfirmed && !isConfirmed) seatDelta = +nombrePersonnes  // releasing seats

        let depart: typeof departs.$inferSelect | undefined

        if (departId && seatDelta !== 0) {
            depart = await db.query.departs.findFirst({
                where: eq(departs.id, departId),
            })

            // ── 2. ✅ Check BEFORE updating anything — prevent overbooking ──
            if (depart && seatDelta < 0 && depart.placesRestantes < nombrePersonnes) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Places insuffisantes : ${depart.placesRestantes} place(s) restante(s) pour ${nombrePersonnes} demandée(s)`,
                    },
                    { status: 409 } // Conflict
                )
            }
        }

        // ── 3. Update the reservation status (only after the check passes) ──
        const [updated] = await db
            .update(reservations)
            .set({ statut })
            .where(eq(reservations.id, id))
            .returning()

        // ── 4. Adjust seats on the depart ────────────────────────────────
        if (depart && seatDelta !== 0) {
            const newPlaces = Math.max(
                0,
                Math.min(depart.placesMax, depart.placesRestantes + seatDelta)
            )

            await db
                .update(departs)
                .set({ placesRestantes: newPlaces })
                .where(eq(departs.id, depart.id))

            console.log(
                `🔄 Seats adjusted for depart ${depart.id}: ` +
                `${depart.placesRestantes} → ${newPlaces} (delta: ${seatDelta})`
            )
        }

        return NextResponse.json({ success: true, data: updated })

    } catch (error) {
        console.error('PATCH statut error:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
