// db/queries/destinations.ts
import { db } from '@/db'
import { destinations } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getDestinations() {
    return await db
        .select()
        .from(destinations)
        .where(eq(destinations.actif, true))
        .limit(4)
}
