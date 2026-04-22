import { NextResponse } from 'next/server'
import { createReservation } from '@/db/queries/reservations'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const result = await createReservation({
            nom: body.nom,
            telephone: body.telephone,
            email: body.email,
            wilaya: body.wilaya,
            departId: body.departId,
            nombrePersonnes: body.nombrePersonnes,
            notes: body.notes,
        })

        return NextResponse.json({ success: true, data: result }, { status: 201 })

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
}
