// components/AdminCircuitsClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import { toast } from 'sonner'
import { getField, formatPrice } from '@/lib/i18n-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import {
    Plus, Pencil, Trash2, Loader2, MapPin, Clock,
    Banknote, ImageIcon, Eye, EyeOff, Search,
    LayoutGrid, List, Globe, Filter, X,
    Map, ChevronRight,
} from 'lucide-react'
import ItineraryBuilder, { type ItineraryDay } from '@/components/ItineraryBuilder'
import type { Circuit, Country } from '@/db/schema'

// ─── Constants ────────────────────────────────────────────────────────────

const CATEGORIES = [
    { value: 'adventure', label: '🏔 Aventure' },
    { value: 'cultural', label: '🏛 Culturel' },
    { value: 'wildlife', label: '🦁 Faune' },
    { value: 'luxury', label: '✨ Luxe' },
    { value: 'family', label: '👨‍👩‍👧 Famille' },
    { value: 'honeymoon', label: '💍 Lune de miel' },
    { value: 'photography', label: '📷 Photo' },
    { value: 'trekking', label: '🥾 Trekking' },
]

const DIFFICULTIES = [
    { value: 'easy', label: '● Facile' },
    { value: 'moderate', label: '●● Modéré' },
    { value: 'challenging', label: '●●● Aventure' },
    { value: 'expedition', label: '●●●● Expédition' },
]

const CURRENCIES = [
    { value: 'DZD', label: 'DZD' },
    { value: 'MAD', label: 'MAD' },
    { value: 'TND', label: 'TND' },
    { value: 'EGP', label: 'EGP' },
    { value: 'EUR', label: 'EUR' },
    { value: 'USD', label: 'USD' },
    { value: 'GBP', label: 'GBP' },
    { value: 'JOD', label: 'JOD' },
]

const EMPTY_FORM = {
    nom: '', description: '',
    nomFr: '', nomAr: '', nomEn: '',
    descriptionFr: '', descriptionAr: '', descriptionEn: '',
    prix: '', duree: '', region: '',
    currency: 'DZD', category: 'adventure', difficulty: 'moderate',
    image: '', actif: true, featured: false,
    countryId: '', minPersonnes: '1', maxPersonnes: '12',
    itinerary: [] as ItineraryDay[],
}
type FormState = typeof EMPTY_FORM

// ─────────────────────────────────────────────────────────────────────────

export default function AdminCircuitsClient({
    initialCircuits,
    countries,
}: {
    initialCircuits: Circuit[]
    countries: Country[]
}) {
    const locale = useLocale()
    const [allCircuits, setAllCircuits] = useState<Circuit[]>(initialCircuits)
    const [search, setSearch] = useState('')
    const [filterCountry, setFilterCountry] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [view, setView] = useState<'table' | 'grid'>('table')
    const [activeTab, setActiveTab] = useState<'fr' | 'ar' | 'en'>('fr')

    // Circuit form dialog
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCircuit, setEditingCircuit] = useState<Circuit | null>(null)
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Itinerary builder — separate dialog
    const [itineraryDialogOpen, setItineraryDialogOpen] = useState(false)
    const [itineraryCircuit, setItineraryCircuit] = useState<Circuit | null>(null)
    const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([])
    const [savingItinerary, setSavingItinerary] = useState(false)

    // ── Filtered circuits ─────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = [...allCircuits]
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(c => {
                const name = getField((c as any).nomI18n ?? c.nom, locale)
                return name.toLowerCase().includes(q) || (c.region ?? '').toLowerCase().includes(q)
            })
        }
        if (filterCountry !== 'all') result = result.filter(c => (c as any).countryId === filterCountry)
        if (filterStatus === 'active') result = result.filter(c => c.actif)
        if (filterStatus === 'inactive') result = result.filter(c => !c.actif)
        if (filterStatus === 'featured') result = result.filter(c => (c as any).featured)
        return result
    }, [allCircuits, search, filterCountry, filterStatus, locale])

    // ── Helpers ───────────────────────────────────────────────────────
    function openCreate() {
        setEditingCircuit(null)
        setForm(EMPTY_FORM)
        setActiveTab('fr')
        setDialogOpen(true)
    }

    function openEdit(circuit: Circuit) {
        setEditingCircuit(circuit)
        const nomI18n = (circuit as any).nomI18n as Record<string, string> | null
        const descI18n = (circuit as any).descriptionI18n as Record<string, string> | null
        setForm({
            nom: circuit.nom,
            description: circuit.description,
            nomFr: nomI18n?.fr ?? circuit.nom,
            nomAr: nomI18n?.ar ?? '',
            nomEn: nomI18n?.en ?? circuit.nom,
            descriptionFr: descI18n?.fr ?? circuit.description,
            descriptionAr: descI18n?.ar ?? '',
            descriptionEn: descI18n?.en ?? circuit.description,
            prix: String(circuit.prix),
            duree: String(circuit.duree),
            region: circuit.region ?? '',
            currency: (circuit as any).currency ?? 'DZD',
            category: (circuit as any).category ?? 'adventure',
            difficulty: (circuit as any).difficulty ?? 'moderate',
            image: circuit.image ?? '',
            actif: circuit.actif ?? true,
            featured: (circuit as any).featured ?? false,
            countryId: (circuit as any).countryId ?? '',
            minPersonnes: String((circuit as any).minPersonnes ?? 1),
            maxPersonnes: String((circuit as any).maxPersonnes ?? 12),
            itinerary: ((circuit as any).itinerary as ItineraryDay[]) ?? [],
        })
        setActiveTab('fr')
        setDialogOpen(true)
    }

    function openItineraryBuilder(circuit: Circuit) {
        setItineraryCircuit(circuit)
        setItineraryDays(((circuit as any).itinerary as ItineraryDay[]) ?? [])
        setItineraryDialogOpen(true)
    }

    function buildPayload(f: FormState) {
        return {
            nom: f.nomFr || f.nom,
            description: f.descriptionFr || f.description,
            nomI18n: { fr: f.nomFr, ar: f.nomAr, en: f.nomEn },
            descriptionI18n: { fr: f.descriptionFr, ar: f.descriptionAr, en: f.descriptionEn },
            prix: Number(f.prix),
            duree: Number(f.duree),
            region: f.region,
            currency: f.currency,
            category: f.category,
            difficulty: f.difficulty,
            image: f.image || null,
            actif: f.actif,
            featured: f.featured,
            countryId: f.countryId || null,
            minPersonnes: Number(f.minPersonnes),
            maxPersonnes: Number(f.maxPersonnes),
            itinerary: f.itinerary,
        }
    }

    // ── Submit circuit ────────────────────────────────────────────────
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            const isEdit = !!editingCircuit
            const res = await fetch('/api/admin/circuits', {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEdit
                    ? { id: editingCircuit.id, ...buildPayload(form) }
                    : buildPayload(form)
                ),
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error || 'Erreur serveur')

            if (isEdit) {
                setAllCircuits(prev => prev.map(c => c.id === data.data.id ? data.data : c))
                toast.success('Circuit mis à jour')
            } else {
                setAllCircuits(prev => [data.data, ...prev])
                toast.success('Circuit créé', { description: data.data.nom })
            }
            setDialogOpen(false)
        } catch (err: any) {
            toast.error('Erreur', { description: err.message })
        } finally {
            setSaving(false)
        }
    }

    // ── Save itinerary ────────────────────────────────────────────────
    async function handleSaveItinerary() {
        if (!itineraryCircuit) return
        setSavingItinerary(true)
        try {
            const res = await fetch('/api/admin/circuits', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itineraryCircuit.id, itinerary: itineraryDays }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error)

            setAllCircuits(prev => prev.map(c => c.id === data.data.id ? data.data : c))
            toast.success('Itinéraire sauvegardé', {
                description: `${itineraryDays.length} jour${itineraryDays.length > 1 ? 's' : ''} enregistré${itineraryDays.length > 1 ? 's' : ''}`,
            })
            setItineraryDialogOpen(false)
        } catch (err: any) {
            toast.error('Erreur', { description: err.message })
        } finally {
            setSavingItinerary(false)
        }
    }

    // ── Toggle actif ──────────────────────────────────────────────────
    async function toggleActif(circuit: Circuit) {
        try {
            const res = await fetch('/api/admin/circuits', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: circuit.id, actif: !circuit.actif }),
            })
            const data = await res.json()
            if (data.success) {
                setAllCircuits(prev => prev.map(c => c.id === data.data.id ? data.data : c))
                toast.success(data.data.actif ? 'Activé' : 'Désactivé')
            }
        } catch { toast.error('Erreur') }
    }

    // ── Delete ────────────────────────────────────────────────────────
    async function handleDelete() {
        if (!deleteId) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/circuits?id=${deleteId}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error)
            setAllCircuits(prev => prev.filter(c => c.id !== deleteId))
            toast.success('Circuit supprimé')
        } catch (err: any) {
            toast.error('Erreur', { description: err.message })
        } finally {
            setDeleting(false)
            setDeleteId(null)
        }
    }

    function countryName(id: string | null) {
        if (!id) return '—'
        const c = countries.find(c => c.id === id)
        return c ? ((c.name as any).fr ?? c.code) : '—'
    }

    const hasFilters = search || filterCountry !== 'all' || filterStatus !== 'all'

    // ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* ── HEADER ────────────────────────────────────────────── */}
            <div className="bg-[#1B2D5B]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[#B8962E] text-xs font-mono tracking-[0.4em] uppercase mb-2">Administration</p>
                            <h1 className="text-3xl font-light text-white"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                Gestion des Circuits
                            </h1>
                        </div>
                        <Button onClick={openCreate}
                            className="bg-[#B8962E] hover:bg-[#D4AF5A] text-white rounded-none h-10 px-5 text-xs tracking-widest gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Nouveau circuit</span>
                            <span className="sm:hidden">Nouveau</span>
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-white/10">
                        {[
                            { value: allCircuits.length, label: 'Total' },
                            { value: allCircuits.filter(c => c.actif).length, label: 'Actifs' },
                            { value: allCircuits.filter(c => (c as any).featured).length, label: 'À la une' },
                            { value: countries.length, label: 'Pays' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-6">
                                {i > 0 && <div className="h-8 w-px bg-white/10" />}
                                <div>
                                    <div className="text-2xl font-light text-[#B8962E]"
                                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                        {s.value}
                                    </div>
                                    <div className="text-white/30 text-[10px] font-mono tracking-widest uppercase mt-0.5">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── TOOLBAR ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/30" />
                        <Input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="pl-9 h-9 w-40 md:w-48 text-sm border-[#1B2D5B]/15 bg-white rounded-none" />
                    </div>

                    <Select value={filterCountry} onValueChange={(v) => setFilterCountry(v ?? 'all')}>
                        <SelectTrigger className="h-9 w-36 md:w-44 text-xs border-[#1B2D5B]/15 bg-white rounded-none">
                            <Globe className="h-3.5 w-3.5 mr-1.5 text-[#1B2D5B]/40 flex-shrink-0" />
                            <SelectValue placeholder="Pays" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">🌍 Tous</SelectItem>
                            {countries.map(c => (
                                <SelectItem key={c.id} value={c.id} className="text-xs">
                                    {(c.flag as string) ?? ''} {getField(c.name as any, locale)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? 'all')}>
                        <SelectTrigger className="h-9 w-32 md:w-36 text-xs border-[#1B2D5B]/15 bg-white rounded-none">
                            <Filter className="h-3.5 w-3.5 mr-1.5 text-[#1B2D5B]/40 flex-shrink-0" />
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">Tous</SelectItem>
                            <SelectItem value="active" className="text-xs">✅ Actifs</SelectItem>
                            <SelectItem value="inactive" className="text-xs">⏸ Inactifs</SelectItem>
                            <SelectItem value="featured" className="text-xs">⭐ À la une</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <Button variant="ghost" size="sm"
                            onClick={() => { setSearch(''); setFilterCountry('all'); setFilterStatus('all') }}
                            className="h-9 px-3 text-xs text-red-500 hover:bg-red-50 rounded-none gap-1.5">
                            <X className="h-3 w-3" />
                        </Button>
                    )}

                    <span className="text-[10px] font-mono text-[#1B2D5B]/30 tracking-wider hidden sm:inline">
                        {filtered.length} circuit{filtered.length !== 1 ? 's' : ''}
                    </span>

                    <div className="ml-auto flex items-center gap-1 border border-[#1B2D5B]/10 bg-white p-1">
                        {(['table', 'grid'] as const).map(v => (
                            <button key={v} onClick={() => setView(v)}
                                className={`p-1.5 transition-colors ${view === v ? 'bg-[#1B2D5B] text-white' : 'text-[#1B2D5B]/40 hover:text-[#1B2D5B]'}`}>
                                {v === 'table' ? <List className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CONTENT ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
                <AnimatePresence mode="wait">

                    {/* TABLE VIEW */}
                    {view === 'table' && (
                        <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="bg-white border border-[#1B2D5B]/08 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-[#1B2D5B]/08 hover:bg-transparent">
                                            {['Circuit', 'Pays', 'Prix', 'Durée', 'Itinéraire', 'Statut', 'Actions'].map(h => (
                                                <TableHead key={h} className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase whitespace-nowrap">
                                                    {h}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-[#1B2D5B]/30 text-sm">
                                                    Aucun circuit trouvé
                                                </TableCell>
                                            </TableRow>
                                        ) : filtered.map((circuit, i) => {
                                            const name = getField((circuit as any).nomI18n ?? circuit.nom, locale)
                                            const price = formatPrice(circuit.prix, (circuit as any).currency ?? 'DZD', locale)
                                            const itineraryDays = ((circuit as any).itinerary as ItineraryDay[]) ?? []
                                            return (
                                                <motion.tr key={circuit.id}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className="border-[#1B2D5B]/06 hover:bg-[#1B2D5B]/[0.02] group"
                                                >
                                                    {/* Circuit */}
                                                    <TableCell>
                                                        <div className="flex items-center gap-3 min-w-[160px]">
                                                            {circuit.image ? (
                                                                <img src={circuit.image} alt={name}
                                                                    className="w-10 h-8 object-cover flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-10 h-8 bg-[#1B2D5B]/05 flex items-center justify-center flex-shrink-0">
                                                                    <ImageIcon className="h-3 w-3 text-[#1B2D5B]/20" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-light text-[#1B2D5B] flex items-center gap-1">
                                                                    {name}
                                                                    {(circuit as any).featured && <span className="text-[10px]">⭐</span>}
                                                                </p>
                                                                <p className="text-[9px] font-mono text-[#1B2D5B]/30 flex items-center gap-1 mt-0.5">
                                                                    <MapPin className="h-2.5 w-2.5" />
                                                                    {circuit.region ?? '—'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-xs font-mono text-[#1B2D5B]/40 whitespace-nowrap">
                                                            {countryName((circuit as any).countryId)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm font-light text-[#B8962E] whitespace-nowrap">{price}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="flex items-center gap-1 text-xs text-[#1B2D5B]/50 whitespace-nowrap">
                                                            <Clock className="h-3 w-3" />{circuit.duree}j
                                                        </span>
                                                    </TableCell>
                                                    {/* Itinerary status */}
                                                    <TableCell>
                                                        <button
                                                            onClick={() => openItineraryBuilder(circuit)}
                                                            className={`inline-flex items-center gap-1.5 text-[9px] font-mono tracking-wide uppercase px-2.5 py-1.5 border transition-colors ${itineraryDays.length > 0
                                                                    ? 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                                                    : 'border-[#1B2D5B]/10 text-[#1B2D5B]/30 hover:border-[#B8962E]/30 hover:text-[#B8962E]'
                                                                }`}
                                                        >
                                                            <Map className="h-2.5 w-2.5" />
                                                            {itineraryDays.length > 0
                                                                ? `${itineraryDays.length} jours`
                                                                : 'Ajouter'
                                                            }
                                                        </button>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Switch checked={circuit.actif ?? false}
                                                                onCheckedChange={() => toggleActif(circuit)}
                                                                className="scale-75" />
                                                            <span className={`text-[10px] font-mono whitespace-nowrap ${circuit.actif ? 'text-emerald-600' : 'text-[#1B2D5B]/30'}`}>
                                                                {circuit.actif ? 'Actif' : 'Inactif'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openEdit(circuit)}
                                                                className="p-1.5 text-[#1B2D5B]/40 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/05 transition-colors">
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button onClick={() => setDeleteId(circuit.id)}
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
                            </div>
                        </motion.div>
                    )}

                    {/* GRID VIEW */}
                    {view === 'grid' && (
                        <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((circuit, i) => {
                                const name = getField((circuit as any).nomI18n ?? circuit.nom, locale)
                                const price = formatPrice(circuit.prix, (circuit as any).currency ?? 'DZD', locale)
                                const days = ((circuit as any).itinerary as ItineraryDay[]) ?? []
                                return (
                                    <motion.div key={circuit.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}>
                                        <Card className="border-[#1B2D5B]/08 rounded-none shadow-none overflow-hidden group hover:border-[#B8962E]/30 transition-colors">
                                            <div className="relative h-36 bg-[#1B2D5B]/05">
                                                {circuit.image ? (
                                                    <img src={circuit.image} alt={name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="h-6 w-6 text-[#1B2D5B]/15" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    <Badge className={`text-[9px] font-mono rounded-none ${circuit.actif ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500'}`}>
                                                        {circuit.actif ? 'Actif' : 'Inactif'}
                                                    </Badge>
                                                    {(circuit as any).featured && (
                                                        <Badge className="text-[9px] rounded-none bg-amber-100 text-amber-700 border-amber-200">⭐</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <p className="text-[9px] font-mono text-[#B8962E]/60 uppercase tracking-widest mb-0.5">
                                                    {countryName((circuit as any).countryId)}
                                                </p>
                                                <h3 className="text-sm font-light text-[#1B2D5B] mb-3 line-clamp-1"
                                                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                                    {name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-[#1B2D5B]/40 mb-3">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{circuit.duree}j</span>
                                                    <span className="text-[#B8962E]">{price}</span>
                                                </div>
                                                {/* Itinerary button */}
                                                <button
                                                    onClick={() => openItineraryBuilder(circuit)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-mono tracking-wide border mb-3 transition-colors ${days.length > 0
                                                            ? 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                                            : 'border-dashed border-[#1B2D5B]/15 text-[#1B2D5B]/30 hover:border-[#B8962E]/30 hover:text-[#B8962E]'
                                                        }`}
                                                >
                                                    <span className="flex items-center gap-1.5">
                                                        <Map className="h-3 w-3" />
                                                        {days.length > 0 ? `Itinéraire · ${days.length} jours` : 'Ajouter l\'itinéraire'}
                                                    </span>
                                                    <ChevronRight className="h-3 w-3" />
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => openEdit(circuit)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 h-8 text-[10px] font-mono text-[#1B2D5B]/50 hover:text-[#1B2D5B] border border-[#1B2D5B]/10 hover:border-[#1B2D5B]/25 transition-colors">
                                                        <Pencil className="h-3 w-3" /> Modifier
                                                    </button>
                                                    <button onClick={() => toggleActif(circuit)}
                                                        className="h-8 px-2.5 border border-[#1B2D5B]/10 text-[#1B2D5B]/30 hover:text-[#1B2D5B] hover:border-[#1B2D5B]/25 transition-colors">
                                                        {circuit.actif ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                    </button>
                                                    <button onClick={() => setDeleteId(circuit.id)}
                                                        className="h-8 px-2.5 border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── CREATE / EDIT DIALOG ──────────────────────────────── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="w-full max-w-2xl mx-4 rounded-none p-0 overflow-hidden max-h-[95vh] flex flex-col">
                    <DialogHeader className="px-5 md:px-8 pt-6 pb-0 flex-shrink-0">
                        <DialogTitle className="text-lg md:text-xl font-light text-[#1B2D5B]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {editingCircuit ? 'Modifier le circuit' : 'Nouveau circuit'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#1B2D5B]/40 font-mono">
                            {editingCircuit ? `ID: ${editingCircuit.id}` : 'Informations du circuit'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-5 space-y-4">

                            {/* Country + Category + Difficulty */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">Pays</Label>
                                    <Select value={form.countryId} onValueChange={v => setForm(f => ({ ...f, countryId: v ?? '' }))}>
                                        <SelectTrigger className="rounded-none border-[#1B2D5B]/15 h-9 text-xs">
                                            <SelectValue placeholder="Choisir..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="" className="text-xs">— Aucun —</SelectItem>
                                            {countries.map(c => (
                                                <SelectItem key={c.id} value={c.id} className="text-xs">
                                                    {(c.flag as string) ?? ''} {getField(c.name as any, 'fr')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">Catégorie</Label>
                                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v ?? '' }))}>
                                        <SelectTrigger className="rounded-none border-[#1B2D5B]/15 h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(c => (
                                                <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Difficulté</Label>
                                    <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v ?? '' }))}>
                                        <SelectTrigger className="rounded-none border-[#1B2D5B]/15 h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DIFFICULTIES.map(d => (
                                                <SelectItem key={d.value} value={d.value} className="text-xs">{d.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Language tabs */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Nom & Description *</Label>
                                    <div className="flex gap-1">
                                        {(['fr', 'ar', 'en'] as const).map(lang => (
                                            <button key={lang} type="button"
                                                onClick={() => setActiveTab(lang)}
                                                className={`px-2 py-1 text-[9px] font-mono uppercase tracking-widests border transition-colors ${activeTab === lang
                                                        ? 'bg-[#1B2D5B] text-white border-[#1B2D5B]'
                                                        : 'text-[#1B2D5B]/40 border-[#1B2D5B]/15 hover:border-[#1B2D5B]/30'
                                                    }`}>
                                                {lang === 'fr' ? '🇫🇷' : lang === 'ar' ? '🇩🇿' : '🇬🇧'} {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Name input */}
                                {activeTab === 'fr' && <Input required value={form.nomFr} onChange={e => setForm(f => ({ ...f, nomFr: e.target.value, nom: e.target.value }))} placeholder="Nom en français" className="rounded-none border-[#1B2D5B]/15 h-9 text-sm" />}
                                {activeTab === 'ar' && <Input value={form.nomAr} onChange={e => setForm(f => ({ ...f, nomAr: e.target.value }))} placeholder="الاسم بالعربية" dir="rtl" className="rounded-none border-[#1B2D5B]/15 h-9 text-sm text-right" />}
                                {activeTab === 'en' && <Input value={form.nomEn} onChange={e => setForm(f => ({ ...f, nomEn: e.target.value }))} placeholder="Name in English" className="rounded-none border-[#1B2D5B]/15 h-9 text-sm" />}
                                {/* Description textarea */}
                                {activeTab === 'fr' && <Textarea required value={form.descriptionFr} onChange={e => setForm(f => ({ ...f, descriptionFr: e.target.value, description: e.target.value }))} placeholder="Description en français..." className="rounded-none border-[#1B2D5B]/15 text-sm resize-none min-h-[70px]" />}
                                {activeTab === 'ar' && <Textarea value={form.descriptionAr} onChange={e => setForm(f => ({ ...f, descriptionAr: e.target.value }))} placeholder="الوصف..." dir="rtl" className="rounded-none border-[#1B2D5B]/15 text-sm resize-none min-h-[70px] text-right" />}
                                {activeTab === 'en' && <Textarea value={form.descriptionEn} onChange={e => setForm(f => ({ ...f, descriptionEn: e.target.value }))} placeholder="Description in English..." className="rounded-none border-[#1B2D5B]/15 text-sm resize-none min-h-[70px]" />}
                            </div>

                            {/* Prix + Currency + Durée */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Prix *</Label>
                                    <div className="relative">
                                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#1B2D5B]/25" />
                                        <Input required type="number" min="0" value={form.prix}
                                            onChange={e => setForm(f => ({ ...f, prix: e.target.value }))}
                                            placeholder="85000" className="pl-8 rounded-none border-[#1B2D5B]/15 h-9 text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Devise</Label>
                                    <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v ?? '' }))}>
                                        <SelectTrigger className="rounded-none border-[#1B2D5B]/15 h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES.map(c => (
                                                <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Durée (j) *</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#1B2D5B]/25" />
                                        <Input required type="number" min="1" max="30" value={form.duree}
                                            onChange={e => setForm(f => ({ ...f, duree: e.target.value }))}
                                            placeholder="8" className="pl-8 rounded-none border-[#1B2D5B]/15 h-9 text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Région + Min/Max */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Région *</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#1B2D5B]/25" />
                                        <Input required value={form.region}
                                            onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                                            placeholder="ex: Ouargla · Tamanrasset"
                                            className="pl-8 rounded-none border-[#1B2D5B]/15 h-9 text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Max pers.</Label>
                                    <Input type="number" min="1" value={form.maxPersonnes}
                                        onChange={e => setForm(f => ({ ...f, maxPersonnes: e.target.value }))}
                                        className="rounded-none border-[#1B2D5B]/15 h-9 text-sm" />
                                </div>
                            </div>

                            {/* Image URL */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                                    URL Image <span className="text-[#1B2D5B]/25 normal-case">(optionnel)</span>
                                </Label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#1B2D5B]/25" />
                                    <Input type="url" value={form.image}
                                        onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                                        placeholder="https://..."
                                        className="pl-8 rounded-none border-[#1B2D5B]/15 h-9 text-sm" />
                                </div>
                                {form.image && (
                                    <div className="h-20 overflow-hidden">
                                        <img src={form.image} alt="preview" className="w-full h-full object-cover"
                                            onError={e => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                )}
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center justify-between p-3 bg-[#F9F7F4] border border-[#1B2D5B]/08">
                                    <div>
                                        <p className="text-xs text-[#1B2D5B] font-light">Actif</p>
                                        <p className="text-[9px] text-[#1B2D5B]/30 font-mono">Visible sur le site</p>
                                    </div>
                                    <Switch checked={form.actif} onCheckedChange={v => setForm(f => ({ ...f, actif: v }))} />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-[#F9F7F4] border border-[#1B2D5B]/08">
                                    <div>
                                        <p className="text-xs text-[#1B2D5B] font-light">⭐ À la une</p>
                                        <p className="text-[9px] text-[#1B2D5B]/30 font-mono">Homepage</p>
                                    </div>
                                    <Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="px-5 md:px-8 py-4 border-t border-[#1B2D5B]/08 bg-[#F9F7F4] gap-2 flex-shrink-0">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}
                                className="rounded-none border-[#1B2D5B]/15 text-[#1B2D5B]/60 h-9 px-4 text-xs tracking-widests">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={saving}
                                className="rounded-none bg-[#1B2D5B] hover:bg-[#B8962E] text-white h-9 px-5 text-xs tracking-widests gap-2 transition-all duration-300">
                                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {editingCircuit ? 'Mettre à jour' : 'Créer le circuit'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── ITINERARY BUILDER DIALOG ──────────────────────────── */}
            <Dialog open={itineraryDialogOpen} onOpenChange={setItineraryDialogOpen}>
                <DialogContent className="w-full max-w-2xl mx-4 rounded-none p-0 overflow-hidden max-h-[95vh] flex flex-col">
                    <DialogHeader className="px-5 md:px-8 pt-6 pb-4 border-b border-[#1B2D5B]/08 flex-shrink-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-lg md:text-xl font-light text-[#1B2D5B]"
                                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                    Itinéraire jour par jour
                                </DialogTitle>
                                {itineraryCircuit && (
                                    <DialogDescription className="text-xs font-mono text-[#B8962E]/70 mt-1">
                                        {getField((itineraryCircuit as any).nomI18n ?? itineraryCircuit.nom, locale)}
                                        {' · '}
                                        {itineraryCircuit.duree} jours
                                    </DialogDescription>
                                )}
                            </div>
                            {itineraryDays.length > 0 && (
                                <Badge className="text-[9px] font-mono bg-emerald-50 text-emerald-700 border-emerald-200 rounded-none">
                                    {itineraryDays.length} jour{itineraryDays.length > 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>

                    {/* Builder — scrollable */}
                    <div className="flex-1 overflow-y-auto px-5 md:px-8 py-5">
                        <ItineraryBuilder
                            value={itineraryDays}
                            onChange={setItineraryDays}
                        />
                    </div>

                    {/* Footer */}
                    <div className="px-5 md:px-8 py-4 border-t border-[#1B2D5B]/08 bg-[#F9F7F4] flex items-center justify-between gap-3 flex-shrink-0">
                        <p className="text-[10px] font-mono text-[#1B2D5B]/30">
                            {itineraryDays.length} jour{itineraryDays.length !== 1 ? 's' : ''} dans l'itinéraire
                        </p>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline"
                                onClick={() => setItineraryDialogOpen(false)}
                                className="rounded-none border-[#1B2D5B]/15 text-[#1B2D5B]/60 h-9 px-4 text-xs tracking-widests">
                                Annuler
                            </Button>
                            <Button
                                onClick={handleSaveItinerary}
                                disabled={savingItinerary}
                                className="rounded-none bg-[#1B2D5B] hover:bg-[#B8962E] text-white h-9 px-5 text-xs tracking-widests gap-2 transition-all duration-300">
                                {savingItinerary && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                Sauvegarder l'itinéraire
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── DELETE CONFIRM ────────────────────────────────────── */}
            <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-light text-[#1B2D5B]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Supprimer ce circuit ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-[#1B2D5B]/50">
                            Action irréversible. Tous les départs associés seront supprimés.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none border-[#1B2D5B]/15 text-xs">Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}
                            className="rounded-none bg-red-600 hover:bg-red-700 text-white text-xs gap-2">
                            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Supprimer définitivement
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
