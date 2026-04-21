import { db } from '@/db'
import { clients, reservations, departs } from '@/db/schema'
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

// Toutes les réservations pour l'admin
export async function getAllReservations() {
    return await db.query.reservations.findMany({
        with: {
            client: true,
            depart: {
                with: { circuit: true }
            }
        },
        orderBy: (res, { desc }) => [desc(res.createdAt)]
    })
}

// Changer le statut d'une réservation
export async function updateStatut(id: string, statut: string) {
    return await db
        .update(reservations)
        .set({ statut })
        .where(eq(reservations.id, id))
        .returning()
}
