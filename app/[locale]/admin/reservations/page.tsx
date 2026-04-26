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
                        <TableRow key={r.reservation.id}>
                            <TableCell>{r.reservation.clerkUserId}</TableCell>  {/* no client join */}
                            <TableCell>{r.circuit?.nom ?? '—'}</TableCell>
                            <TableCell>
                                {r.depart?.date
                                    ? new Date(r.depart.date).toLocaleDateString('fr-DZ')
                                    : '—'}
                            </TableCell>
                            <TableCell>{r.reservation.nombrePersonnes}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    r.reservation.statut === 'confirme' ? 'default' :
                                        r.reservation.statut === 'annule' ? 'destructive' :
                                            'secondary'
                                }>
                                    {r.reservation.statut === 'en_attente' && '⏳ En attente'}
                                    {r.reservation.statut === 'confirme' && '✅ Confirmé'}
                                    {r.reservation.statut === 'annule' && '❌ Annulé'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <StatusButton
                                    id={r.reservation.id}
                                    currentStatut={r.reservation.statut as any}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
