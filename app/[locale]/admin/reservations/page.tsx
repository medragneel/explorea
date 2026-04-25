// app/[locale]/admin/reservations/page.tsx
import { getAllReservations } from '@/db/queries/reservations'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import StatusButton from '@/components/StatusButton'

export default async function AdminReservationsPage() {
    const reservations = await getAllReservations()

    return (
        <div className="container py-10">
            <h1 className="text-2xl font-bold mb-6">Réservations</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Circuit</TableHead>
                        <TableHead>Date départ</TableHead>
                        <TableHead>Personnes</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reservations.map((r) => (
                        <TableRow key={r.reservations.id}>
                            <TableCell className="font-medium">
                                {r.clients.nom}
                            </TableCell>
                            <TableCell>{r.clients.telephone}</TableCell>
                            <TableCell>{r.circuits.nom}</TableCell>
                            <TableCell>
                                {new Date(r.departs.date).toLocaleDateString('fr-DZ')}
                            </TableCell>
                            <TableCell>{r.reservations.nombrePersonnes}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    r.reservations.statut === 'confirme' ? 'default' :
                                        r.reservations.statut === 'annule' ? 'destructive' :
                                            'secondary'
                                }>
                                    {r.reservations.statut === 'en_attente' && '⏳ En attente'}
                                    {r.reservations.statut === 'confirme' && '✅ Confirmé'}
                                    {r.reservations.statut === 'annule' && '❌ Annulé'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <StatusButton
                                    id={r.reservations.id}
                                    currentStatut={r.reservations.statut as any}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
