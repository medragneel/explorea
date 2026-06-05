// components/AdminReservationsClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getField, formatPrice } from '@/lib/i18n-field'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
    Search, Phone, Mail, MapPin, Calendar,
    Users, Banknote, Clock, CheckCircle2,
    XCircle, Timer, Eye, SlidersHorizontal,
    X, Globe,
} from 'lucide-react'
import type { Circuit, Reservation, Client } from '@/db/schema'

// ── Types ─────────────────────────────────────────────────────────────────

type Depart = {
    id: string
    date: Date
    placesMax: number
    placesRestantes: number
    circuitId: string | null
}

type Row = {
    reservation: Reservation
    client: Client | null
    depart: Depart | null
    circuit: Circuit | null
}

// ── Status config ─────────────────────────────────────────────────────────

const STATUS = {
    en_attente: { label: 'En attente', icon: Timer, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
    confirme: { label: 'Confirmé', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
    annule: { label: 'Annulé', icon: XCircle, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-400' },
    pending: { label: 'En attente', icon: Timer, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
    confirmed: { label: 'Confirmé', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
    cancelled: { label: 'Annulé', icon: XCircle, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-400' },
    completed: { label: 'Terminé', icon: CheckCircle2, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
} as const

function getStatus(statut: string | null) {
    return STATUS[statut as keyof typeof STATUS] ?? STATUS.en_attente
}

// ─────────────────────────────────────────────────────────────────────────

export default function AdminReservationsClient({ data }: { data: Row[] }) {
    const locale = useLocale()
    const [rows, setRows] = useState<Row[]>(data)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedRow, setSelectedRow] = useState<Row | null>(null)
    const [updating, setUpdating] = useState<string | null>(null)

    // ── Stats ─────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: rows.length,
        pending: rows.filter(r => ['en_attente', 'pending'].includes(r.reservation.statut ?? '')).length,
        confirmed: rows.filter(r => ['confirme', 'confirmed'].includes(r.reservation.statut ?? '')).length,
        cancelled: rows.filter(r => ['annule', 'cancelled'].includes(r.reservation.statut ?? '')).length,
    }), [rows])

    // ── Filtered rows ─────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = [...rows]

        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(r =>
                r.client?.nom?.toLowerCase().includes(q) ||
                r.client?.telephone?.toLowerCase().includes(q) ||
                r.client?.email?.toLowerCase().includes(q) ||
                getField((r.circuit as any)?.nomI18n ?? r.circuit?.nom, locale).toLowerCase().includes(q)
            )
        }

        if (filterStatus !== 'all') {
            result = result.filter(r => r.reservation.statut === filterStatus)
        }

        return result
    }, [rows, search, filterStatus, locale])

    // ── Update status ─────────────────────────────────────────────────
    async function updateStatus(id: string, statut: string) {
        setUpdating(id)
        try {
            const res = await fetch(`/api/reservations/${id}/statut`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statut }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error)

            setRows(prev => prev.map(r =>
                r.reservation.id === id
                    ? { ...r, reservation: { ...r.reservation, statut } }
                    : r
            ))
            // Update selected row if open
            if (selectedRow?.reservation.id === id) {
                setSelectedRow(prev => prev ? {
                    ...prev,
                    reservation: { ...prev.reservation, statut }
                } : null)
            }
            toast.success('Statut mis à jour')
        } catch (err: any) {
            toast.error('Erreur', { description: err.message })
        } finally {
            setUpdating(null)
        }
    }

    const hasFilters = search || filterStatus !== 'all'

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* ── HEADER ────────────────────────────────────────────── */}
            <div className="bg-[#1B2D5B]">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div>
                        <p className="text-[#B8962E] text-xs font-mono tracking-[0.4em] uppercase mb-2">
                            Administration
                        </p>
                        <h1 className="text-3xl font-light text-white"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Réservations
                        </h1>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-8 mt-8 pt-6 border-t border-white/10">
                        {[
                            { value: stats.total, label: 'Total', color: 'text-[#B8962E]' },
                            { value: stats.pending, label: 'En attente', color: 'text-amber-400' },
                            { value: stats.confirmed, label: 'Confirmées', color: 'text-emerald-400' },
                            { value: stats.cancelled, label: 'Annulées', color: 'text-red-400' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-8">
                                {i > 0 && <div className="h-8 w-px bg-white/10" />}
                                <div>
                                    <div className={`text-2xl font-light ${s.color}`}
                                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                        {s.value}
                                    </div>
                                    <div className="text-white/30 text-[10px] font-mono tracking-widest uppercase mt-0.5">
                                        {s.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── TOOLBAR ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-5">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/30" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Nom, téléphone, email..."
                            className="pl-9 h-9 w-56 text-sm border-[#1B2D5B]/15 bg-white rounded-none"
                        />
                    </div>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-9 w-40 text-xs border-[#1B2D5B]/15 bg-white rounded-none">
                            <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-[#1B2D5B]/40" />
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">Tous</SelectItem>
                            <SelectItem value="en_attente" className="text-xs">⏳ En attente</SelectItem>
                            <SelectItem value="confirme" className="text-xs">✅ Confirmés</SelectItem>
                            <SelectItem value="annule" className="text-xs">❌ Annulés</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <Button variant="ghost" size="sm"
                            onClick={() => { setSearch(''); setFilterStatus('all') }}
                            className="h-9 px-3 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-none gap-1.5">
                            <X className="h-3 w-3" /> Effacer
                        </Button>
                    )}

                    <span className="ml-auto text-[10px] font-mono text-[#1B2D5B]/30 tracking-wider">
                        {filtered.length} réservation{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* ── TABLE ─────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                <div className="bg-white border border-[#1B2D5B]/08">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-[#1B2D5B]/08 hover:bg-transparent">
                                {['Client', 'Contact', 'Circuit', 'Date départ', 'Personnes', 'Statut', 'Actions'].map(h => (
                                    <TableHead key={h} className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase">
                                        {h}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16 text-[#1B2D5B]/30 text-sm">
                                        Aucune réservation trouvée
                                    </TableCell>
                                </TableRow>
                            ) : filtered.map((row, i) => {
                                const statut = getStatus(row.reservation.statut)
                                const circuitName = getField(
                                    (row.circuit as any)?.nomI18n ?? row.circuit?.nom,
                                    locale
                                )
                                return (
                                    <motion.tr
                                        key={row.reservation.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="border-[#1B2D5B]/06 hover:bg-[#1B2D5B]/[0.015] group cursor-pointer"
                                        onClick={() => setSelectedRow(row)}
                                    >
                                        {/* ✅ Client name from clients table */}
                                        {/* Client name — with fallback to clerkUserId */}
                                        <TableCell>
                                            <div>
                                                {row.client?.nom ? (
                                                    <>
                                                        <p className="text-sm font-light text-[#1B2D5B]">
                                                            {row.client.nom}
                                                        </p>
                                                        <p className="text-[10px] font-mono text-[#1B2D5B]/30 mt-0.5 flex items-center gap-1">
                                                            <Globe className="h-2.5 w-2.5" />
                                                            {row.client.country ?? '—'}
                                                            {row.client.city ? ` · ${row.client.city}` : ''}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <div>
                                                        <p className="text-xs text-[#1B2D5B]/30 italic">Invité</p>
                                                        <p className="text-[9px] font-mono text-[#1B2D5B]/20 truncate max-w-[120px] mt-0.5">
                                                            {row.reservation.clerkUserId ?? '—'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Contact — with fallback */}
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                {row.client?.telephone ? (
                                                    <a href={`tel:${row.client.telephone}`}
                                                        onClick={e => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 text-xs text-[#1B2D5B]/60 hover:text-[#B8962E] transition-colors font-mono">
                                                        <Phone className="h-3 w-3 flex-shrink-0" />
                                                        {row.client.telephone}
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-[#1B2D5B]/20 italic">Pas de contact</span>
                                                )}
                                                {row.client?.email && (
                                                    <a href={`mailto:${row.client.email}`}
                                                        onClick={e => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 text-xs text-[#1B2D5B]/40 hover:text-[#B8962E] transition-colors font-mono truncate max-w-[160px]">
                                                        <Mail className="h-3 w-3 flex-shrink-0" />
                                                        {row.client.email}
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Circuit name */}
                                        <TableCell>
                                            <p className="text-sm font-light text-[#1B2D5B] max-w-[180px] truncate">
                                                {circuitName || '—'}
                                            </p>
                                        </TableCell>

                                        {/* Departure date */}
                                        <TableCell>
                                            {row.depart?.date ? (
                                                <div>
                                                    <p className="text-xs font-light text-[#1B2D5B]">
                                                        {format(new Date(row.depart.date), 'd MMM yyyy', { locale: fr })}
                                                    </p>
                                                    <p className="text-[9px] font-mono text-[#1B2D5B]/30 mt-0.5 flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {row.circuit?.duree ?? '?'} jours
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-[#1B2D5B]/30">—</span>
                                            )}
                                        </TableCell>

                                        {/* People */}
                                        <TableCell>
                                            <span className="flex items-center gap-1.5 text-sm font-light text-[#1B2D5B]">
                                                <Users className="h-3.5 w-3.5 text-[#B8962E]" />
                                                {row.reservation.nombrePersonnes}
                                            </span>
                                        </TableCell>

                                        {/* Status badge */}
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono tracking-wider uppercase px-2.5 py-1 border ${statut.bg} ${statut.text} ${statut.border}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statut.dot}`} />
                                                {statut.label}
                                            </span>
                                        </TableCell>

                                        {/* Quick status change */}
                                        <TableCell onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {row.reservation.statut !== 'confirme' && row.reservation.statut !== 'confirmed' && (
                                                    <button
                                                        onClick={() => updateStatus(row.reservation.id, 'confirme')}
                                                        disabled={updating === row.reservation.id}
                                                        className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                                        title="Confirmer"
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                {row.reservation.statut !== 'annule' && row.reservation.statut !== 'cancelled' && (
                                                    <button
                                                        onClick={() => updateStatus(row.reservation.id, 'annule')}
                                                        disabled={updating === row.reservation.id}
                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Annuler"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedRow(row)}
                                                    className="p-1.5 text-[#1B2D5B]/40 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/05 transition-colors"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── DETAIL DIALOG ─────────────────────────────────────── */}
            <Dialog open={!!selectedRow} onOpenChange={open => !open && setSelectedRow(null)}>
                <DialogContent className="max-w-lg rounded-none p-0 overflow-hidden">
                    {selectedRow && (() => {
                        const statut = getStatus(selectedRow.reservation.statut)
                        const circuitName = getField(
                            (selectedRow.circuit as any)?.nomI18n ?? selectedRow.circuit?.nom,
                            locale
                        )
                        const price = formatPrice(
                            (selectedRow.circuit?.prix ?? 0) * selectedRow.reservation.nombrePersonnes,
                            (selectedRow.circuit as any)?.currency ?? 'DZD',
                            locale
                        )
                        return (
                            <>
                                <DialogHeader className="px-6 pt-6 pb-0">
                                    <DialogTitle className="text-lg font-light text-[#1B2D5B]"
                                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                        Détails de la réservation
                                    </DialogTitle>
                                    <DialogDescription className="text-xs font-mono text-[#1B2D5B]/30">
                                        ID: {selectedRow.reservation.id}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="px-6 py-5 space-y-5">

                                    {/* Status */}
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase px-3 py-1.5 border ${statut.bg} ${statut.text} ${statut.border}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statut.dot}`} />
                                            {statut.label}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[9px] font-mono text-[#1B2D5B]/30">Changer:</p>
                                            {['en_attente', 'confirme', 'annule'].map(s => (
                                                s !== selectedRow.reservation.statut && (
                                                    <button
                                                        key={s}
                                                        onClick={() => updateStatus(selectedRow.reservation.id, s)}
                                                        disabled={updating === selectedRow.reservation.id}
                                                        className={`text-[9px] font-mono tracking-widest uppercase px-2.5 py-1.5 border transition-colors ${s === 'confirme' ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' :
                                                            s === 'annule' ? 'border-red-200 text-red-500 hover:bg-red-50' :
                                                                'border-amber-200 text-amber-600 hover:bg-amber-50'
                                                            }`}
                                                    >
                                                        {s === 'en_attente' ? 'Attente' : s === 'confirme' ? 'Confirmer' : 'Annuler'}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </div>

                                    {/* Client info */}
                                    <div className="bg-[#F9F7F4] border border-[#1B2D5B]/06 p-4 space-y-3">
                                        <p className="text-[9px] font-mono tracking-[0.3em] text-[#B8962E]/60 uppercase">Client</p>
                                        {[
                                            { icon: Users, value: selectedRow.client?.nom },
                                            { icon: Phone, value: selectedRow.client?.telephone, href: `tel:${selectedRow.client?.telephone}` },
                                            { icon: Mail, value: selectedRow.client?.email, href: `mailto:${selectedRow.client?.email}` },
                                            { icon: Globe, value: selectedRow.client?.country },
                                            { icon: MapPin, value: selectedRow.client?.city },
                                        ].filter(f => f.value).map(field => (
                                            <div key={field.value} className="flex items-center gap-2.5">
                                                <field.icon className="h-3.5 w-3.5 text-[#B8962E]/50 flex-shrink-0" />
                                                {field.href ? (
                                                    <a href={field.href} className="text-sm font-light text-[#1B2D5B] hover:text-[#B8962E] transition-colors">
                                                        {field.value}
                                                    </a>
                                                ) : (
                                                    <span className="text-sm font-light text-[#1B2D5B]">{field.value}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Booking info */}
                                    <div className="bg-[#F9F7F4] border border-[#1B2D5B]/06 p-4 space-y-3">
                                        <p className="text-[9px] font-mono tracking-[0.3em] text-[#B8962E]/60 uppercase">Réservation</p>
                                        {[
                                            { icon: MapPin, label: 'Circuit', value: circuitName || '—' },
                                            { icon: Calendar, label: 'Départ', value: selectedRow.depart?.date ? format(new Date(selectedRow.depart.date), 'd MMMM yyyy', { locale: fr }) : '—' },
                                            { icon: Users, label: 'Personnes', value: `${selectedRow.reservation.nombrePersonnes} personne${selectedRow.reservation.nombrePersonnes > 1 ? 's' : ''}` },
                                            { icon: Banknote, label: 'Total estimé', value: price },
                                            { icon: Clock, label: 'Créé le', value: selectedRow.reservation.createdAt ? format(new Date(selectedRow.reservation.createdAt), 'd MMM yyyy à HH:mm', { locale: fr }) : '—' },
                                        ].map(field => (
                                            <div key={field.label} className="flex items-start gap-2.5">
                                                <field.icon className="h-3.5 w-3.5 text-[#B8962E]/50 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[9px] font-mono text-[#1B2D5B]/30 uppercase mb-0.5">{field.label}</p>
                                                    <p className="text-sm font-light text-[#1B2D5B]">{field.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedRow.reservation.notes && (
                                            <div className="pt-2 border-t border-[#1B2D5B]/06">
                                                <p className="text-[9px] font-mono text-[#1B2D5B]/30 uppercase mb-1">Notes</p>
                                                <p className="text-xs text-[#1B2D5B]/60 leading-relaxed">{selectedRow.reservation.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </>
                        )
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    )
}
