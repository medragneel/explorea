import { db } from '@/db'
import { circuits, departs } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Tous les circuits actifs
export async function getCircuits() {
    return await db
        .select()
        .from(circuits)
        .where(eq(circuits.actif, true))
}

// Un circuit avec ses départs
export async function getCircuitById(id: string) {
    return await db.query.circuits.findFirst({
        where: eq(circuits.id, id),
        with: { departs: true }
    })
}
