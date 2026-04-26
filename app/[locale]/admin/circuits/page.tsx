// app/[locale]/admin/circuits/page.tsx
import { db } from '@/db'
import { circuits } from '@/db/schema'
import { desc } from 'drizzle-orm'
import AdminCircuitsClient from '@/components/AdminCircuitsClient'

export default async function AdminCircuitsPage() {
    const allCircuits = await db
        .select()
        .from(circuits)
        .orderBy(desc(circuits.createdAt))

    return <AdminCircuitsClient initialCircuits={allCircuits} />
}
