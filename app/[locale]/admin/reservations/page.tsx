// app/[locale]/admin/reservations/page.tsx
import { db } from '@/db'
import { reservations, clients, departs, circuits } from '@/db/schema'
import { eq } from 'drizzle-orm'
import AdminReservationsClient from '@/components/AdminReservationsClient'

export default async function AdminReservationsPage() {
    const data = await db
        .select({
            reservation: reservations,
            client: clients,
            depart: departs,
            circuit: circuits,
        })
        .from(reservations)
        .leftJoin(clients, eq(reservations.clientId, clients.id))
        .leftJoin(departs, eq(reservations.departId, departs.id))
        .leftJoin(circuits, eq(departs.circuitId, circuits.id))
        .orderBy(reservations.createdAt)

    console.log(data)

    return <AdminReservationsClient data={data} />
}
