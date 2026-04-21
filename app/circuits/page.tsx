import { getCircuits } from '@/db/queries/circuits'

export default async function CircuitsPage() {
    const circuits = await getCircuits()

    return (
        <main>
            <h1>Nos Circuits</h1>
            <div className="grid grid-cols-3 gap-6">
                {circuits.map(circuit => (
                    <div key={circuit.id} className="border rounded-lg p-4">
                        <h2>{circuit.nom}</h2>
                        <p>{circuit.region}</p>
                        <p>{circuit.duree} jours</p>
                        <p className="font-bold">{circuit.prix} DZD</p>
                    </div>
                ))}
            </div>
        </main>
    )
}
