import { db } from '@/db'
import { clients, reservations, departs, circuits } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function createReservation(data: {
    nom: string
    telephone: string
    email?: string
    wilaya: string
    departId: string
    nombrePersonnes: number
    notes?: string
}) {
    // 1. Créer le client
    const [client] = await db
        .insert(clients)
        .values({
            nom: data.nom,
            telephone: data.telephone,
            email: data.email,
            wilaya: data.wilaya,
        })
        .returning()

    // 2. Créer la réservation
    const [reservation] = await db
        .insert(reservations)
        .values({
            clientId: client.id,
            departId: data.departId,
            nombrePersonnes: data.nombrePersonnes,
            notes: data.notes,
            statut: 'en_attente',
        })
        .returning()

    return { client, reservation }
}


export async function getAllReservations() {
    return await db
        .select({
            reservation: reservations,
            depart: departs,
            circuit: circuits,
        })
        .from(reservations)
        .leftJoin(departs, eq(reservations.departId, departs.id))
        .leftJoin(circuits, eq(departs.circuitId, circuits.id))
        .orderBy(reservations.createdAt)
}

// Changer le statut d'une réservation
export async function updateStatut(id: string, statut: string) {
    return await db
        .update(reservations)
        .set({ statut })
        .where(eq(reservations.id, id))
        .returning()
}
