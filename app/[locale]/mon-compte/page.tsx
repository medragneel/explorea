// app/[locale]/mon-compte/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { reservations, departs, circuits } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import MonCompteClient from '@/components/MonCompteClient'

export default async function MonComptePage() {
    const { userId } = await auth()
    if (!userId) redirect('/connexion')

    const user = await currentUser()

    // Fetch user reservations with circuit + depart info
    const userReservations = await db
        .select({
            reservation: reservations,
            depart: departs,
            circuit: circuits,
        })
        .from(reservations)
        .where(eq(reservations.clerkUserId, userId))
        .leftJoin(departs, eq(reservations.departId, departs.id))
        .leftJoin(circuits, eq(departs.circuitId, circuits.id))
        .orderBy(desc(reservations.createdAt))

    const userData = {
        id: user?.id ?? '',
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.emailAddresses[0]?.emailAddress ?? '',
        imageUrl: user?.imageUrl ?? '',
        createdAt: user?.createdAt ?? Date.now(),
    }

    return (
        <MonCompteClient
            user={userData}
            reservations={userReservations}
        />
    )
}
