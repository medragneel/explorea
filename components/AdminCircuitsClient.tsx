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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import {
    Plus, Pencil, Trash2, Loader2, MapPin, Clock,
    Banknote, ImageIcon, Eye, EyeOff, Search,
    LayoutGrid, List, Globe, X, Filter,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Circuit, Country } from '@/db/schema'
import ItineraryBuilder, { type ItineraryDay } from '@/components/ItineraryBuilder'

// ─── Constants ────────────────────────────────────────────────────────────

const CATEGORIES = ['adventure', 'cultural', 'wildlife', 'luxury', 'family', 'honeymoon', 'photography', 'trekking']
const DIFFICULTIES = ['easy', 'moderate', 'challenging', 'expedition']

const EMPTY_FORM = {
    nom: '',
    description: '',
    nomEn: '',
    descriptionEn: '',
    nomAr: '',
    descriptionAr: '',
    prix: '',
    duree: '',
    region: '',
    countryId: '',
    currency: 'DZD',
    category: 'adventure',
    difficulty: 'moderate',
    image: '',
    actif: true,
    featured: false,
    minPersonnes: '1',
    maxPersonnes: '12',
    itinerary: [] as ItineraryDay[],
}

type FormState = typeof EMPTY_FORM

// ─── Main component ───────────────────────────────────────────────────────

export default function AdminCircuitsClient({
    initialCircuits,
    countries,
}: {
    initialCircuits: Circuit[]
    countries: Country[]
}) {
    const locale = useLocale()
    const router = useRouter()

    const [circuits, setCircuits] = useState<Circuit[]>(initialCircuits)
    const [search, setSearch] = useState('')
    const [filterCountry, setFilterCountry] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [view, setView] = useState<'table' | 'grid'>('table')

    // Dialog
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCircuit, setEditingCircuit] = useState<Circuit | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'fr' | 'en' | 'ar'>('fr')

    // Form
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // ── Filter & search ────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = [...circuits]

        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(c => {
                const name = getField((c as any).nomI18n ?? c.nom, locale)
                return (
                    name.toLowerCase().includes(q) ||
                    (c.region ?? '').toLowerCase().includes(q)
                )
            })
        }

        if (filterCountry !== 'all') {
            result = result.filter(c => (c as any).countryId === filterCountry)
        }

        if (filterStatus === 'active') result = result.filter(c => c.actif)
        if (filterStatus === 'inactive') result = result.filter(c => !c.actif)
        if (filterStatus === 'featured') result = result.filter(c => (c as any).featured)

        return result
    }, [circuits, search, filterCountry, filterStatus, locale])

    // ── Open create ────────────────────────────────────────────────────
    function openCreate() {
        setEditingCircuit(null)
        setForm(EMPTY_FORM)
        setActiveTab('fr')
        setDialogOpen(true)
    }

    // ── Open edit ──────────────────────────────────────────────────────
    function openEdit(circuit: Circuit) {
        setEditingCircuit(circuit)
        const nomI18n = (circuit as any).nomI18n as Record<string, string> | null
        const descI18n = (circuit as any).descriptionI18n as Record<string, string> | null
        setForm({
            nom: nomI18n?.fr ?? circuit.nom,
            description: descI18n?.fr ?? circuit.description,
            nomEn: nomI18n?.en ?? '',
            descriptionEn: descI18n?.en ?? '',
            nomAr: nomI18n?.ar ?? '',
            descriptionAr: descI18n?.ar ?? '',
            prix: String(circuit.prix),
            duree: String(circuit.duree),
            region: circuit.region ?? '',
            countryId: (circuit as any).countryId ?? '',
            currency: (circuit as any).currency ?? 'DZD',
            category: (circuit as any).category ?? 'adventure',
            difficulty: (circuit as any).difficulty ?? 'moderate',
            image: circuit.image ?? '',
            actif: circuit.actif ?? true,
            featured: (circuit as any).featured ?? false,
            minPersonnes: String((circuit as any).minPersonnes ?? 1),
            maxPersonnes: String((circuit as any).maxPersonnes ?? 12),
            itinerary: ((circuit as any).itinerary as ItineraryDay[]) ?? [],
        })
        setActiveTab('fr')
        setDialogOpen(true)
    }

    // ── Submit ─────────────────────────────────────────────────────────
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        const payload = {
            nom: form.nom,
            description: form.description,
            nomI18n: {
                fr: form.nom,
                en: form.nomEn || form.nom,
                ar: form.nomAr || form.nom,
            },
            descriptionI18n: {
                fr: form.description,
                en: form.descriptionEn || form.description,
                ar: form.descriptionAr || form.description,
            },
            prix: Number(form.prix),
            duree: Number(form.duree),
            region: form.region,
            countryId: form.countryId || null,
            currency: form.currency,
            category: form.category,
            difficulty: form.difficulty,
            image: form.image || null,
            actif: form.actif,
            featured: form.featured,
            minPersonnes: Number(form.minPersonnes),
            maxPersonnes: Number(form.maxPersonnes),
            ...(editingCircuit && { id: editingCircuit.id }),
            itinerary: form.itinerary,
        }

        try {
            const res = await fetch('/api/admin/circuits', {
                method: editingCircuit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error || 'Erreur serveur')

            if (editingCircuit) {
                setCircuits(prev => prev.map(c => c.id === data.data.id ? data.data : c))
                toast.success('Circuit mis à jour')
            } else {
                setCircuits(prev => [data.data, ...prev])
                toast.success('Circuit créé', { description: data.data.nom })
            }
            setDialogOpen(false)
            router.refresh()
        } catch (err: any) {
            toast.error('Erreur', { description: err.message })
        } finally {
            setSaving(false)
        }
    }

    // ── Toggle actif ───────────────────────────────────────────────────
    async function toggleActif(circuit: Circuit) {
        try {
            const res = await fetch('/api/admin/circuits', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: circuit.id, actif: !circuit.actif }),
            })
            const data = await res.json()
            if (data.success) {
                setCircuits(prev => prev.map(c => c.id === data.data.id ? data.data : c))
                toast.success(data.data.actif ? 'Circuit activé' : 'Circuit désactivé')
            }
        } catch { toast.error('Erreur') }
    }

    // ── Delete ─────────────────────────────────────────────────────────
    async function handleDelete() {
        if (!deleteId) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/circuits?id=${deleteId}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error)
            setCircuits(prev => prev.filter(c => c.id !== deleteId))
            toast.success('Circuit supprimé')
        } catch (err: any) {
            toast.error('Erreur', { description: err.message })
        } finally {
            setDeleting(false)
            setDeleteId(null)
        }
    }

    // ── Country helper ─────────────────────────────────────────────────
    function countryName(countryId: string | null) {
        if (!countryId) return null
        const c = countries.find(c => c.id === countryId)
        if (!c) return null
        return `${(c.name as any)?.fr ?? c.code} ${c.flag ?? ''}`
    }

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* ── Header ────────────────────────────────────────────── */}
            <div className="bg-[#1B2D5B]">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[#B8962E] text-xs font-mono tracking-[0.4em] uppercase mb-2">Administration</p>
                            <h1 className="text-3xl font-light text-white"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                Gestion des Circuits
                            </h1>
                        </div>
                        <Button
                            onClick={openCreate}
                            className="bg-[#B8962E] hover:bg-[#D4AF5A] text-white rounded-none h-10 px-5 text-xs tracking-widest gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Nouveau circuit
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8 mt-8 pt-6 border-t border-white/10">
                        {[
                            { value: circuits.length, label: 'Total' },
                            { value: circuits.filter(c => c.actif).length, label: 'Actifs' },
                            { value: circuits.filter(c => (c as any).featured).length, label: 'Vedettes' },
                            { value: new Set(circuits.map(c => (c as any).countryId).filter(Boolean)).size, label: 'Pays' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-8">
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

            {/* ── Toolbar ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center gap-3 flex-wrap">

                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/30" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="pl-9 h-9 text-sm border-[#1B2D5B]/15 bg-white rounded-none"
                        />
                    </div>

                    {/* Country filter */}
                    <Select value={filterCountry} onValueChange={setFilterCountry}>
                        <SelectTrigger className="h-9 w-48 text-xs border-[#1B2D5B]/15 bg-white rounded-none">
                            <Globe className="h-3 w-3 mr-1.5 text-[#1B2D5B]/40" />
                            <SelectValue placeholder="Tous les pays" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">🌍 Tous les pays</SelectItem>
                            {countries.map(c => (
                                <SelectItem key={c.id} value={c.id} className="text-xs">
                                    {c.flag} {(c.name as any)?.fr ?? c.code}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status filter */}
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-9 w-40 text-xs border-[#1B2D5B]/15 bg-white rounded-none">
                            <Filter className="h-3 w-3 mr-1.5 text-[#1B2D5B]/40" />
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">Tous</SelectItem>
                            <SelectItem value="active" className="text-xs">✅ Actifs</SelectItem>
                            <SelectItem value="inactive" className="text-xs">⏸ Inactifs</SelectItem>
                            <SelectItem value="featured" className="text-xs">⭐ Vedettes</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Clear filters */}
                    {(search || filterCountry !== 'all' || filterStatus !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSearch(''); setFilterCountry('all'); setFilterStatus('all') }}
                            className="h-9 px-3 text-xs text-red-500 hover:bg-red-50 rounded-none gap-1"
                        >
                            <X className="h-3 w-3" /> Effacer
                        </Button>
                    )}
                    ,
                    {/* View toggle */}
                    <div className="ml-auto flex items-center gap-1 border border-[#1B2D5B]/10 bg-white p-1">
                        <button onClick={() => setView('table')}
                            className={`p-1.5 transition-colors ${view === 'table' ? 'bg-[#1B2D5B] text-white' : 'text-[#1B2D5B]/40 hover:text-[#1B2D5B]'}`}>
                            <List className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setView('grid')}
                            className={`p-1.5 transition-colors ${view === 'grid' ? 'bg-[#1B2D5B] text-white' : 'text-[#1B2D5B]/40 hover:text-[#1B2D5B]'}`}>
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Result count */}
                <p className="text-[10px] font-mono text-[#1B2D5B]/30 tracking-wider mt-2">
                    {filtered.length} circuit{filtered.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* ── Content ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                <AnimatePresence mode="wait">

                    {/* TABLE VIEW */}
                    {view === 'table' && (
                        <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="bg-white border border-[#1B2D5B]/08">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-[#1B2D5B]/08 hover:bg-transparent">
                                            <TableHead className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase w-[280px]">Circuit</TableHead>
                                            <TableHead className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase">Pays</TableHead>
                                            <TableHead className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase">Région</TableHead>
                                            <TableHead className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase">Prix</TableHead>
                                            <TableHead className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase">Durée</TableHead>
                                            <TableHead className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase">Statut</TableHead>
                                            <TableHead className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-[#1B2D5B]/30 text-sm">
                                                    Aucun circuit trouvé
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filtered.map((circuit, i) => {
                                                const name = getField((circuit as any).nomI18n ?? circuit.nom, locale)
                                                const country = countryName((circuit as any).countryId)
                                                const price = formatPrice(circuit.prix, (circuit as any).currency ?? 'DZD', locale)

                                                return (
                                                    <motion.tr
                                                        key={circuit.id}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.03 }}
                                                        className="border-[#1B2D5B]/06 hover:bg-[#1B2D5B]/[0.015] group"
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                {circuit.image ? (
                                                                    <img src={circuit.image} alt={name} className="w-10 h-8 object-cover flex-shrink-0" />
                                                                ) : (
                                                                    <div className="w-10 h-8 bg-[#1B2D5B]/05 flex items-center justify-center flex-shrink-0">
                                                                        <ImageIcon className="h-3 w-3 text-[#1B2D5B]/20" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-light text-[#1B2D5B] flex items-center gap-1.5">
                                                                        {name}
                                                                        {(circuit as any).featured && <span className="text-[10px]">⭐</span>}
                                                                    </p>
                                                                    <p className="text-[10px] text-[#1B2D5B]/30 font-mono">{(circuit as any).category}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {country ? (
                                                                <span className="text-xs text-[#1B2D5B]/60">{country}</span>
                                                            ) : (
                                                                <span className="text-xs text-[#1B2D5B]/20">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="flex items-center gap-1 text-xs text-[#1B2D5B]/50">
                                                                <MapPin className="h-3 w-3 text-[#B8962E]" />
                                                                {circuit.region ?? '—'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm font-light text-[#B8962E]">{price}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="flex items-center gap-1 text-xs text-[#1B2D5B]/50">
                                                                <Clock className="h-3 w-3" />{circuit.duree}j
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    checked={circuit.actif ?? false}
                                                                    onCheckedChange={() => toggleActif(circuit)}
                                                                    className="scale-75"
                                                                />
                                                                <span className={`text-[10px] font-mono ${circuit.actif ? 'text-emerald-600' : 'text-[#1B2D5B]/25'}`}>
                                                                    {circuit.actif ? 'Actif' : 'Inactif'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
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
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </motion.div>
                    )}

                    {/* GRID VIEW */}
                    {view === 'grid' && (
                        <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((circuit, i) => {
                                const name = getField((circuit as any).nomI18n ?? circuit.nom, locale)
                                const country = countryName((circuit as any).countryId)
                                const price = formatPrice(circuit.prix, (circuit as any).currency ?? 'DZD', locale)

                                return (
                                    <motion.div key={circuit.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white border border-[#1B2D5B]/08 overflow-hidden group hover:border-[#B8962E]/30 transition-colors"
                                    >
                                        <div className="relative h-36 bg-[#1B2D5B]/05">
                                            {circuit.image ? (
                                                <img src={circuit.image} alt={name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="h-6 w-6 text-[#1B2D5B]/15" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 flex gap-1">
                                                <Badge className={`text-[9px] font-mono rounded-none ${circuit.actif ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                    {circuit.actif ? 'Actif' : 'Inactif'}
                                                </Badge>
                                                {(circuit as any).featured && (
                                                    <Badge className="text-[9px] font-mono rounded-none bg-amber-100 text-amber-700 border-amber-200">⭐</Badge>
                                                )}
                                            </div>
                                            {country && (
                                                <div className="absolute top-2 right-2 text-[10px] bg-black/40 text-white px-1.5 py-0.5 font-mono">
                                                    {country}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="text-sm font-light text-[#1B2D5B] mb-1 line-clamp-1"
                                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                                {name}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-[#1B2D5B]/40 mb-3">
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{circuit.duree}j</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{circuit.region?.split('·')[0].trim() ?? '—'}</span>
                                                <span className="text-[#B8962E] font-light">{price}</span>
                                            </div>
                                            <div className="flex items-center gap-2 pt-3 border-t border-[#1B2D5B]/06">
                                                <button onClick={() => openEdit(circuit)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 h-7 text-[10px] font-mono text-[#1B2D5B]/50 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/05 transition-colors border border-[#1B2D5B]/10">
                                                    <Pencil className="h-3 w-3" /> Modifier
                                                </button>
                                                <button onClick={() => toggleActif(circuit)}
                                                    className="flex items-center justify-center h-7 px-3 border border-[#1B2D5B]/10 text-[#1B2D5B]/40 hover:bg-[#1B2D5B]/05 transition-colors">
                                                    {circuit.actif ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                </button>
                                                <button onClick={() => setDeleteId(circuit.id)}
                                                    className="flex items-center justify-center h-7 px-3 border border-red-100 text-red-400 hover:bg-red-50 transition-colors">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Create / Edit Dialog ──────────────────────────────── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl rounded-none p-0 overflow-hidden">
                    <DialogHeader className="px-8 pt-8 pb-0">
                        <DialogTitle className="text-xl font-light text-[#1B2D5B]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {editingCircuit ? 'Modifier le circuit' : 'Nouveau circuit'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#1B2D5B]/40 font-mono">
                            {editingCircuit ? `ID: ${editingCircuit.id}` : 'Remplissez les informations'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="px-8 py-6 space-y-5 max-h-[70vh] overflow-y-auto">

                            {/* Language tabs */}
                            <div className="flex border-b border-[#1B2D5B]/08">
                                {(['fr', 'en', 'ar'] as const).map(lang => (
                                    <button key={lang} type="button"
                                        onClick={() => setActiveTab(lang)}
                                        className={`px-5 py-2.5 text-xs font-mono tracking-widest uppercase border-b-2 -mb-px transition-colors ${activeTab === lang
                                            ? 'border-[#B8962E] text-[#B8962E]'
                                            : 'border-transparent text-[#1B2D5B]/30 hover:text-[#1B2D5B]/60'
                                            }`}>
                                        {lang === 'fr' ? '🇫🇷 Français' : lang === 'en' ? '🇬🇧 English' : '🇩🇿 العربية'}
                                    </button>
                                ))}
                            </div>

                            {/* Nom */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                    Nom {activeTab === 'fr' ? '*' : ''}
                                </Label>
                                <Input
                                    required={activeTab === 'fr'}
                                    value={activeTab === 'fr' ? form.nom : activeTab === 'en' ? form.nomEn : form.nomAr}
                                    onChange={e => setForm(f => ({
                                        ...f,
                                        [activeTab === 'fr' ? 'nom' : activeTab === 'en' ? 'nomEn' : 'nomAr']: e.target.value,
                                    }))}
                                    dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                                    placeholder={activeTab === 'fr' ? 'ex: Circuit Sahara 8 jours' : activeTab === 'en' ? 'ex: Sahara Tour 8 Days' : 'مثال: جولة الصحراء 8 أيام'}
                                    className="rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                    Description {activeTab === 'fr' ? '*' : ''}
                                </Label>
                                <Textarea
                                    required={activeTab === 'fr'}
                                    value={activeTab === 'fr' ? form.description : activeTab === 'en' ? form.descriptionEn : form.descriptionAr}
                                    onChange={e => setForm(f => ({
                                        ...f,
                                        [activeTab === 'fr' ? 'description' : activeTab === 'en' ? 'descriptionEn' : 'descriptionAr']: e.target.value,
                                    }))}
                                    dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                                    className="rounded-none border-[#1B2D5B]/15 text-sm resize-none min-h-[80px]"
                                />
                            </div>

                            {/* Prix + Durée */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">Prix *</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            required type="number" min="0"
                                            value={form.prix}
                                            onChange={e => setForm(f => ({ ...f, prix: e.target.value }))}
                                            className="rounded-none border-[#1B2D5B]/15 h-10 text-sm flex-1"
                                        />
                                        <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                                            <SelectTrigger className="h-10 w-24 rounded-none border-[#1B2D5B]/15 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['DZD', 'MAD', 'TND', 'EGP', 'EUR', 'USD', 'GBP', 'JOD'].map(c => (
                                                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">Durée (jours) *</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                                        <Input
                                            required type="number" min="1" max="60"
                                            value={form.duree}
                                            onChange={e => setForm(f => ({ ...f, duree: e.target.value }))}
                                            className="pl-9 rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Country + Region */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">Pays</Label>
                                    <Select value={form.countryId} onValueChange={v => setForm(f => ({ ...f, countryId: v }))}>
                                        <SelectTrigger className="h-10 rounded-none border-[#1B2D5B]/15 text-sm">
                                            <Globe className="h-3.5 w-3.5 mr-2 text-[#1B2D5B]/25" />
                                            <SelectValue placeholder="Sélectionner..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="" className="text-xs">— Aucun</SelectItem>
                                            {countries.map(c => (
                                                <SelectItem key={c.id} value={c.id} className="text-sm">
                                                    {c.flag} {(c.name as any)?.fr ?? c.code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">Région *</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                                        <Input
                                            required
                                            value={form.region}
                                            onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                                            placeholder="ex: Ouargla · Tamanrasset"
                                            className="pl-9 rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Category + Difficulty */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">Catégorie</Label>
                                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                                        <SelectTrigger className="h-10 rounded-none border-[#1B2D5B]/15 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(c => (
                                                <SelectItem key={c} value={c} className="text-sm capitalize">{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">Difficulté</Label>
                                    <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                                        <SelectTrigger className="h-10 rounded-none border-[#1B2D5B]/15 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DIFFICULTIES.map(d => (
                                                <SelectItem key={d} value={d} className="text-sm capitalize">{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Image URL */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                    URL Image <span className="text-[#1B2D5B]/25 normal-case">(optionnel)</span>
                                </Label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                                    <Input
                                        type="url"
                                        value={form.image}
                                        onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                                        placeholder="https://..."
                                        className="pl-9 rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                    />
                                </div>
                                {form.image && (
                                    <div className="mt-2 h-24 overflow-hidden">
                                        <img src={form.image} alt="preview" className="w-full h-full object-cover"
                                            onError={e => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                )}
                            </div>

                            {/* Min/Max personnes */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">Min personnes</Label>
                                    <Input type="number" min="1"
                                        value={form.minPersonnes}
                                        onChange={e => setForm(f => ({ ...f, minPersonnes: e.target.value }))}
                                        className="rounded-none border-[#1B2D5B]/15 h-10 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">Max personnes</Label>
                                    <Input type="number" min="1"
                                        value={form.maxPersonnes}
                                        onChange={e => setForm(f => ({ ...f, maxPersonnes: e.target.value }))}
                                        className="rounded-none border-[#1B2D5B]/15 h-10 text-sm" />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 bg-[#F9F7F4] border border-[#1B2D5B]/08">
                                    <div>
                                        <p className="text-sm text-[#1B2D5B] font-light">Circuit actif</p>
                                        <p className="text-[10px] text-[#1B2D5B]/40 font-mono">Visible sur le site</p>
                                    </div>
                                    <Switch checked={form.actif} onCheckedChange={v => setForm(f => ({ ...f, actif: v }))} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-[#F9F7F4] border border-[#1B2D5B]/08">
                                    <div>
                                        <p className="text-sm text-[#1B2D5B] font-light">⭐ En vedette</p>
                                        <p className="text-[10px] text-[#1B2D5B]/40 font-mono">Affiché en homepage</p>
                                    </div>
                                    <Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} />
                                </div>
                            </div>
                        </div>
                        {/* Itinerary builder */}
                        <div className="space-y-1.5 pt-2 border-t border-[#1B2D5B]/06">
                            <ItineraryBuilder
                                value={form.itinerary}
                                onChange={itinerary => setForm(f => ({ ...f, itinerary }))}
                            />
                        </div>

                        <DialogFooter className="px-8 py-5 border-t border-[#1B2D5B]/08 bg-[#F9F7F4] gap-3">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}
                                className="rounded-none border-[#1B2D5B]/15 text-[#1B2D5B]/60 h-9 px-5 text-xs tracking-widest">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={saving}
                                className="rounded-none bg-[#1B2D5B] hover:bg-[#B8962E] text-white h-9 px-6 text-xs tracking-widest gap-2 transition-all duration-300">
                                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {editingCircuit ? 'Mettre à jour' : 'Créer le circuit'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete confirmation ───────────────────────────────── */}
            <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-light text-[#1B2D5B]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Supprimer ce circuit ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-[#1B2D5B]/50">
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none border-[#1B2D5B]/15 text-xs tracking-widest">
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}
                            className="rounded-none bg-red-600 hover:bg-red-700 text-white text-xs tracking-widest gap-2">
                            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
