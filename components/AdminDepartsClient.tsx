// components/AdminDepartsClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import { toast } from 'sonner'
import { format, isPast, isWithinInterval, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getField, formatPrice } from '@/lib/i18n-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    Plus, Pencil, Trash2, Loader2,
    Calendar, Users, Clock, MapPin,
    Search, SlidersHorizontal, X,
    CheckCircle2, AlertCircle, Timer,
} from 'lucide-react'
import type { Circuit } from '@/db/schema'

// ── Types ─────────────────────────────────────────────────────────────────

type Depart = {
    id: string
    circuitId: string | null
    date: Date
    dateFin: Date | null
    placesMax: number
    placesRestantes: number
    prixSpecial: number | null
    notes: string | null
}

type DepartRow = {
    depart: Depart
    circuit: Circuit | null
}

// ── Status helpers ────────────────────────────────────────────────────────

function getDepartStatus(depart: Depart) {
    const now = new Date()
    const date = new Date(depart.date)

    if (isPast(date)) {
        return { label: 'Passé', color: 'text-[#1B2D5B]/30 bg-[#1B2D5B]/05 border-[#1B2D5B]/10', icon: Clock }
    }
    if (depart.placesRestantes === 0) {
        return { label: 'Complet', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle }
    }
    if (depart.placesRestantes <= 3) {
        return { label: 'Dernières places', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Timer }
    }
    if (isWithinInterval(date, { start: now, end: addDays(now, 30) })) {
        return { label: 'Bientôt', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Calendar }
    }
    return { label: 'Disponible', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 }
}

// ── Empty form ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
    circuitId: '',
    date: '',
    dateFin: '',
    placesMax: '12',
    placesRestantes: '12',
    prixSpecial: '',
    notes: '',
}

// ─────────────────────────────────────────────────────────────────────────

export default function AdminDepartsClient({
    initialDeparts,
    circuits,
}: {
    initialDeparts: DepartRow[]
    circuits: Circuit[]
}) {
    const locale = useLocale()
    const [rows, setRows] = useState<DepartRow[]>(initialDeparts)
    const [search, setSearch] = useState('')
    const [filterCircuit, setFilterCircuit] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingDepart, setEditingDepart] = useState<Depart | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // ── Stats ─────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const now = new Date()
        return {
            total: rows.length,
            upcoming: rows.filter(r => !isPast(new Date(r.depart.date))).length,
            full: rows.filter(r => r.depart.placesRestantes === 0).length,
            totalSeats: rows.filter(r => !isPast(new Date(r.depart.date)))
                .reduce((s, r) => s + r.depart.placesRestantes, 0),
        }
    }, [rows])

    // ── Filtered rows ─────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = [...rows]

        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(r => {
                const name = getField((r.circuit as any)?.nomI18n ?? r.circuit?.nom, locale)
                return name.toLowerCase().includes(q)
            })
        }

        if (filterCircuit !== 'all') {
            result = result.filter(r => r.depart.circuitId === filterCircuit)
        }

        if (filterStatus === 'upcoming') result = result.filter(r => !isPast(new Date(r.depart.date)))
        if (filterStatus === 'past') result = result.filter(r => isPast(new Date(r.depart.date)))
        if (filterStatus === 'full') result = result.filter(r => r.depart.placesRestantes === 0)
        if (filterStatus === 'available') result = result.filter(r =>
            r.depart.placesRestantes > 0 && !isPast(new Date(r.depart.date))
        )

        return result
    }, [rows, search, filterCircuit, filterStatus, locale])

    // ── Open create ───────────────────────────────────────────────────
    function openCreate(circuitId?: string) {
        setEditingDepart(null)
        setForm({
            ...EMPTY_FORM,
            circuitId: circuitId ?? '',
        })
        setDialogOpen(true)
    }

    // ── Open edit ─────────────────────────────────────────────────────
    function openEdit(depart: Depart) {
        setEditingDepart(depart)
        setForm({
            circuitId: depart.circuitId ?? '',
            date: depart.date ? format(new Date(depart.date), 'yyyy-MM-dd') : '',
            dateFin: depart.dateFin ? format(new Date(depart.dateFin), 'yyyy-MM-dd') : '',
            placesMax: String(depart.placesMax),
            placesRestantes: String(depart.placesRestantes),
            prixSpecial: depart.prixSpecial ? String(depart.prixSpecial) : '',
            notes: depart.notes ?? '',
        })
        setDialogOpen(true)
    }

    // ── Submit ────────────────────────────────────────────────────────
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.circuitId) {
            toast.error('Veuillez sélectionner un circuit')
            return
        }
        setSaving(true)
        try {
            const payload = {
                circuitId: form.circuitId,
                date: new Date(form.date).toISOString(),
                dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null,
                placesMax: Number(form.placesMax),
                placesRestantes: Number(form.placesRestantes),
                prixSpecial: form.prixSpecial ? Number(form.prixSpecial) : null,
                notes: form.notes || null,
            }

            const isEdit = !!editingDepart
            const res = await fetch('/api/admin/departs', {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEdit ? { id: editingDepart.id, ...payload } : payload),
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error)

            const circuit = circuits.find(c => c.id === form.circuitId) ?? null

            if (isEdit) {
                setRows(prev => prev.map(r =>
                    r.depart.id === data.data.id
                        ? { depart: data.data, circuit }
                        : r
                ))
                toast.success('Départ mis à jour')
            } else {
                setRows(prev => [{ depart: data.data, circuit }, ...prev])
                toast.success('Départ créé')
            }
            setDialogOpen(false)
        } catch (err: any) {
            toast.error('Erreur', { description: err.message })
        } finally {
            setSaving(false)
        }
    }

    // ── Delete ────────────────────────────────────────────────────────
    async function handleDelete() {
        if (!deleteId) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/departs?id=${deleteId}`, { method: 'DELETE' })
            const data = await res.json()
            if (!data.success) throw new Error(data.error)
            setRows(prev => prev.filter(r => r.depart.id !== deleteId))
            toast.success('Départ supprimé')
        } catch (err: any) {
            toast.error('Erreur', { description: err.message })
        } finally {
            setDeleting(false)
            setDeleteId(null)
        }
    }

    // ── Update places ─────────────────────────────────────────────────
    async function updatePlaces(id: string, placesRestantes: number) {
        try {
            const res = await fetch('/api/admin/departs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, placesRestantes }),
            })
            const data = await res.json()
            if (data.success) {
                setRows(prev => prev.map(r =>
                    r.depart.id === id
                        ? { ...r, depart: { ...r.depart, placesRestantes } }
                        : r
                ))
                toast.success('Places mises à jour')
            }
        } catch { toast.error('Erreur') }
    }

    const hasFilters = search || filterCircuit !== 'all' || filterStatus !== 'all'

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* ── HEADER ────────────────────────────────────────────── */}
            <div className="bg-[#1B2D5B]">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[#B8962E] text-xs font-mono tracking-[0.4em] uppercase mb-2">Administration</p>
                            <h1 className="text-3xl font-light text-white"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                Gestion des Départs
                            </h1>
                        </div>
                        <Button
                            onClick={() => openCreate()}
                            className="bg-[#B8962E] hover:bg-[#D4AF5A] text-white rounded-none h-10 px-5 text-xs tracking-widest gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Nouveau départ
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-8 mt-8 pt-6 border-t border-white/10">
                        {[
                            { value: stats.total, label: 'Total', color: 'text-[#B8962E]' },
                            { value: stats.upcoming, label: 'À venir', color: 'text-emerald-400' },
                            { value: stats.full, label: 'Complets', color: 'text-red-400' },
                            { value: stats.totalSeats, label: 'Places restantes', color: 'text-sky-400' },
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

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/30" />
                        <Input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un circuit..."
                            className="pl-9 h-9 w-52 text-sm border-[#1B2D5B]/15 bg-white rounded-none" />
                    </div>

                    {/* Circuit filter */}
                    <Select value={filterCircuit} onValueChange={(v)=>setFilterCircuit(v ?? 'all')}>
                        <SelectTrigger className="h-9 w-52 text-xs border-[#1B2D5B]/15 bg-white rounded-none">
                            <MapPin className="h-3.5 w-3.5 mr-2 text-[#1B2D5B]/40" />
                            <SelectValue placeholder="Tous les circuits" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">Tous les circuits</SelectItem>
                            {circuits.map(c => (
                                <SelectItem key={c.id} value={c.id} className="text-xs">
                                    {getField((c as any).nomI18n ?? c.nom, locale)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status filter */}
                    <Select value={filterStatus} onValueChange={(v)=> setFilterStatus(v ?? 'all')}>
                        <SelectTrigger className="h-9 w-40 text-xs border-[#1B2D5B]/15 bg-white rounded-none">
                            <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-[#1B2D5B]/40" />
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">Tous</SelectItem>
                            <SelectItem value="upcoming" className="text-xs">📅 À venir</SelectItem>
                            <SelectItem value="available" className="text-xs">✅ Disponibles</SelectItem>
                            <SelectItem value="full" className="text-xs">🔴 Complets</SelectItem>
                            <SelectItem value="past" className="text-xs">⏱ Passés</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <Button variant="ghost" size="sm"
                            onClick={() => { setSearch(''); setFilterCircuit('all'); setFilterStatus('all') }}
                            className="h-9 px-3 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-none gap-1.5">
                            <X className="h-3 w-3" /> Effacer
                        </Button>
                    )}

                    <span className="ml-auto text-[10px] font-mono text-[#1B2D5B]/30 tracking-wider">
                        {filtered.length} départ{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* ── TABLE ─────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                <Card className="border-[#1B2D5B]/08 rounded-none shadow-none overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-[#1B2D5B]/08 hover:bg-transparent">
                                {['Circuit', 'Date départ', 'Retour', 'Places', 'Prix spécial', 'Statut', 'Notes', 'Actions'].map(h => (
                                    <TableHead key={h} className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase">
                                        {h}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-16">
                                        <Calendar className="h-10 w-10 text-[#1B2D5B]/10 mx-auto mb-3" />
                                        <p className="text-[#1B2D5B]/30 text-sm font-light">Aucun départ trouvé</p>
                                        <Button onClick={() => openCreate()} variant="ghost"
                                            className="mt-3 text-[#B8962E] text-xs gap-1.5">
                                            <Plus className="h-3.5 w-3.5" /> Ajouter un départ
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.map((row, i) => {
                                const status = getDepartStatus(row.depart)
                                const circuitName = getField((row.circuit as any)?.nomI18n ?? row.circuit?.nom, locale)
                                const isPastDate = isPast(new Date(row.depart.date))
                                const fillRate = Math.round(((row.depart.placesMax - row.depart.placesRestantes) / row.depart.placesMax) * 100)

                                return (
                                    <motion.tr
                                        key={row.depart.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className={`border-[#1B2D5B]/06 group ${isPastDate ? 'opacity-50' : 'hover:bg-[#1B2D5B]/[0.015]'}`}
                                    >
                                        {/* Circuit */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {row.circuit?.image && (
                                                    <img src={row.circuit.image} alt=""
                                                        className="w-8 h-6 object-cover flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-light text-[#1B2D5B] truncate max-w-[160px]">
                                                        {circuitName || '—'}
                                                    </p>
                                                    <p className="text-[9px] font-mono text-[#1B2D5B]/30 flex items-center gap-1 mt-0.5">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {row.circuit?.duree ?? '?'} jours
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Date départ */}
                                        <TableCell>
                                            <p className="text-sm font-light text-[#1B2D5B]">
                                                {format(new Date(row.depart.date), 'd MMM yyyy', { locale: fr })}
                                            </p>
                                            <p className="text-[9px] font-mono text-[#1B2D5B]/30 mt-0.5">
                                                {format(new Date(row.depart.date), 'EEEE', { locale: fr })}
                                            </p>
                                        </TableCell>

                                        {/* Retour */}
                                        <TableCell>
                                            {row.depart.dateFin ? (
                                                <p className="text-xs text-[#1B2D5B]/60">
                                                    {format(new Date(row.depart.dateFin), 'd MMM yyyy', { locale: fr })}
                                                </p>
                                            ) : row.circuit?.duree ? (
                                                <p className="text-xs text-[#1B2D5B]/40 italic">
                                                    {format(
                                                        new Date(new Date(row.depart.date).getTime() + row.circuit.duree * 86400000),
                                                        'd MMM yyyy', { locale: fr }
                                                    )}
                                                </p>
                                            ) : (
                                                <span className="text-xs text-[#1B2D5B]/20">—</span>
                                            )}
                                        </TableCell>

                                        {/* Places with fill bar */}
                                        <TableCell>
                                            <div className="w-28">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-light text-[#1B2D5B]">
                                                        {row.depart.placesRestantes}/{row.depart.placesMax}
                                                    </span>
                                                    <span className="text-[9px] font-mono text-[#1B2D5B]/30">
                                                        {fillRate}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-[#1B2D5B]/08 w-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all ${fillRate === 100 ? 'bg-red-400' :
                                                                fillRate >= 75 ? 'bg-amber-400' :
                                                                    'bg-emerald-400'
                                                            }`}
                                                        style={{ width: `${fillRate}%` }}
                                                    />
                                                </div>
                                                {/* Quick adjust buttons */}
                                                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => updatePlaces(row.depart.id, Math.max(0, row.depart.placesRestantes - 1))}
                                                        className="text-[9px] w-5 h-5 border border-[#1B2D5B]/15 text-[#1B2D5B]/40 hover:bg-[#1B2D5B]/05 flex items-center justify-center"
                                                    >−</button>
                                                    <button
                                                        onClick={() => updatePlaces(row.depart.id, Math.min(row.depart.placesMax, row.depart.placesRestantes + 1))}
                                                        className="text-[9px] w-5 h-5 border border-[#1B2D5B]/15 text-[#1B2D5B]/40 hover:bg-[#1B2D5B]/05 flex items-center justify-center"
                                                    >+</button>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Prix spécial */}
                                        <TableCell>
                                            {row.depart.prixSpecial ? (
                                                <span className="text-sm font-light text-[#B8962E]">
                                                    {formatPrice(row.depart.prixSpecial, (row.circuit as any)?.currency ?? 'DZD', locale)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-[#1B2D5B]/20">—</span>
                                            )}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono tracking-wide uppercase px-2.5 py-1 border ${status.color}`}>
                                                <status.icon className="h-2.5 w-2.5" />
                                                {status.label}
                                            </span>
                                        </TableCell>

                                        {/* Notes */}
                                        <TableCell>
                                            <p className="text-[10px] text-[#1B2D5B]/40 max-w-[100px] truncate">
                                                {row.depart.notes ?? '—'}
                                            </p>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(row.depart)}
                                                    className="p-1.5 text-[#1B2D5B]/40 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/05 transition-colors">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => setDeleteId(row.depart.id)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* ── CREATE / EDIT DIALOG ──────────────────────────────── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg rounded-none p-0 overflow-hidden">
                    <DialogHeader className="px-8 pt-8 pb-0">
                        <DialogTitle className="text-xl font-light text-[#1B2D5B]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {editingDepart ? 'Modifier le départ' : 'Nouveau départ'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#1B2D5B]/40 font-mono">
                            {editingDepart ? `ID: ${editingDepart.id}` : 'Définissez les informations du départ'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="px-8 py-6 space-y-4 max-h-[65vh] overflow-y-auto">

                            {/* Circuit selector */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                    Circuit *
                                </Label>
                                <Select
                                    value={form.circuitId}
                                    onValueChange={v => {
                                        const c = circuits.find(c => c.id === v)
                                        const duree = c?.duree ?? 7
                                        setForm(f => ({
                                            ...f,
                                            circuitId: v ?? '',
                                            // Auto-calculate dateFin if date is set
                                            dateFin: f.date
                                                ? format(new Date(new Date(f.date).getTime() + duree * 86400000), 'yyyy-MM-dd')
                                                : '',
                                        }))
                                    }}
                                >
                                    <SelectTrigger className="rounded-none border-[#1B2D5B]/15 h-10 text-sm">
                                        <SelectValue placeholder="Sélectionnez un circuit..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {circuits.map(c => (
                                            <SelectItem key={c.id} value={c.id} className="text-sm">
                                                {getField((c as any).nomI18n ?? c.nom, locale)}
                                                <span className="text-[#1B2D5B]/30 ml-2 text-xs">· {c.duree}j</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date départ + Date fin */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                        Date de départ *
                                    </Label>
                                    <Input
                                        required
                                        type="date"
                                        value={form.date}
                                        onChange={e => {
                                            const date = e.target.value
                                            const c = circuits.find(c => c.id === form.circuitId)
                                            const duree = c?.duree ?? 7
                                            setForm(f => ({
                                                ...f,
                                                date,
                                                // Auto-fill dateFin
                                                dateFin: date
                                                    ? format(new Date(new Date(date).getTime() + duree * 86400000), 'yyyy-MM-dd')
                                                    : '',
                                            }))
                                        }}
                                        className="rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                        Date de retour
                                        <span className="text-[#1B2D5B]/25 ml-1 normal-case">(auto)</span>
                                    </Label>
                                    <Input
                                        type="date"
                                        value={form.dateFin}
                                        onChange={e => setForm(f => ({ ...f, dateFin: e.target.value }))}
                                        className="rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Places max + restantes */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                        Places max *
                                    </Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                                        <Input
                                            required
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={form.placesMax}
                                            onChange={e => setForm(f => ({
                                                ...f,
                                                placesMax: e.target.value,
                                                placesRestantes: e.target.value, // sync by default
                                            }))}
                                            className="pl-9 rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                        Places restantes *
                                    </Label>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        max={Number(form.placesMax)}
                                        value={form.placesRestantes}
                                        onChange={e => setForm(f => ({ ...f, placesRestantes: e.target.value }))}
                                        className="rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Prix spécial */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                    Prix spécial
                                    <span className="text-[#1B2D5B]/25 ml-1 normal-case">(optionnel — remplace le prix du circuit)</span>
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={form.prixSpecial}
                                    onChange={e => setForm(f => ({ ...f, prixSpecial: e.target.value }))}
                                    placeholder="Laisser vide pour utiliser le prix du circuit"
                                    className="rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                    Notes <span className="text-[#1B2D5B]/25 normal-case">(optionnel)</span>
                                </Label>
                                <Textarea
                                    value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder="Informations supplémentaires pour ce départ..."
                                    className="rounded-none border-[#1B2D5B]/15 text-sm resize-none min-h-[70px]"
                                />
                            </div>

                        </div>

                        <DialogFooter className="px-8 py-5 border-t border-[#1B2D5B]/08 bg-[#F9F7F4] gap-3">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}
                                className="rounded-none border-[#1B2D5B]/15 text-[#1B2D5B]/60 h-9 px-5 text-xs tracking-widest">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={saving}
                                className="rounded-none bg-[#1B2D5B] hover:bg-[#B8962E] text-white h-9 px-6 text-xs tracking-widest gap-2 transition-all duration-300">
                                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {editingDepart ? 'Mettre à jour' : 'Créer le départ'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── DELETE CONFIRM ────────────────────────────────────── */}
            <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-light text-[#1B2D5B]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Supprimer ce départ ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-[#1B2D5B]/50">
                            Les réservations associées seront orphelines. Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none border-[#1B2D5B]/15 text-xs">Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}
                            className="rounded-none bg-red-600 hover:bg-red-700 text-white text-xs gap-2">
                            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
