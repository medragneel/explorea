// db/queries/circuits.ts
import { db } from '@/db'
import { circuits, departs, countries, destinations } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export async function getCircuits(locale = 'fr') {
    return await db
        .select()
        .from(circuits)
        .where(eq(circuits.actif, true))
}

export async function getFeaturedCircuits() {
    return await db
        .select()
        .from(circuits)
        .where(and(eq(circuits.actif, true), eq(circuits.featured, true)))
        .orderBy(desc(circuits.createdAt))
        .limit(4)
}

export async function getCircuitById(id: string) {
    return await db.query.circuits.findFirst({
        where: eq(circuits.id, id),
        with: {
            country: true,
            destination: true,
        }
    })
}

export async function getCircuitsByCountry(countryId: string) {
    return await db
        .select()
        .from(circuits)
        .where(and(eq(circuits.countryId, countryId), eq(circuits.actif, true)))
}
