// app/[locale]/admin/departs/page.tsx
import { db } from '@/db'
import { departs, circuits } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import AdminDepartsClient from '@/components/AdminDepartsClient'

export default async function AdminDepartsPage() {
    const [allDeparts, allCircuits] = await Promise.all([
        db
            .select({
                depart: departs,
                circuit: circuits,
            })
            .from(departs)
            .leftJoin(circuits, eq(departs.circuitId, circuits.id))
            .orderBy(desc(departs.date)),
        db
            .select()
            .from(circuits)
            .where(eq(circuits.actif, true))
            .orderBy(circuits.nom),
    ])

    return (
        <AdminDepartsClient
            initialDeparts={allDeparts}
            circuits={allCircuits}
        />
    )
}
