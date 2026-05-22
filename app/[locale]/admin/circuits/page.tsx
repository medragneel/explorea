// app/[locale]/admin/circuits/page.tsx
import { db } from '@/db'
import { circuits, countries } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import AdminCircuitsClient from '@/components/AdminCircuitsClient'

export default async function AdminCircuitsPage() {
    const [allCircuits, allCountries] = await Promise.all([
        db.select().from(circuits).orderBy(desc(circuits.createdAt)),
        db.select().from(countries).where(eq(countries.actif, true)).orderBy(countries.code),
    ])

    return (
        <AdminCircuitsClient
            initialCircuits={allCircuits}
            countries={allCountries}
        />
    )
}
