// app/[locale]/circuits/[id]/page.tsx
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { circuits, departs } from '@/db/schema'
import { eq } from 'drizzle-orm'
import ReservationForm from '@/components/ReservationForm'

export default async function CircuitDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const circuit = await db.query.circuits.findFirst({
        where: eq(circuits.id, id),
    })

    if (!circuit) notFound()

    // ✅ fetch departures for this circuit
    const deps = await db
        .select()
        .from(departs)
        .where(eq(departs.circuitId, id))

    // ✅ pick first available departure
    const firstDepart = deps.find(d => d.placesRestantes > 0)

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <ReservationForm
                circuitNom={circuit.nom}
                departId={firstDepart?.id ?? ''} // ✅ pass it here
            />
        </div>
    )
}
