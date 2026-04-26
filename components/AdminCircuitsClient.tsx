// components/AdminCircuitsClient.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
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
    Plus,
    Pencil,
    Trash2,
    Loader2,
    MapPin,
    Clock,
    Banknote,
    ImageIcon,
    Eye,
    EyeOff,
    Search,
    LayoutGrid,
    List,
} from 'lucide-react'
import type { Circuit } from '@/db/schema'

// ─── Empty form state ─────────────────────────────────────────────────────

const EMPTY_FORM = {
    nom: '',
    description: '',
    prix: '',
    duree: '',
    region: '',
    image: '',
    actif: true,
}

type FormState = typeof EMPTY_FORM

// ─── Main component ───────────────────────────────────────────────────────

export default function AdminCircuitsClient({
    initialCircuits,
}: {
    initialCircuits: Circuit[]
}) {
    const [circuits, setCircuits] = useState<Circuit[]>(initialCircuits)
    const [search, setSearch] = useState('')
    const [view, setView] = useState<'table' | 'grid'>('table')

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCircuit, setEditingCircuit] = useState<Circuit | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    // Form state
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // ── Filtered circuits ─────────────────────────────────────────
    const filtered = circuits.filter(c =>
        c.nom.toLowerCase().includes(search.toLowerCase()) ||
        c.region.toLowerCase().includes(search.toLowerCase())
    )

    // ── Open create dialog ────────────────────────────────────────
    function openCreate() {
        setEditingCircuit(null)
        setForm(EMPTY_FORM)
        setDialogOpen(true)
    }

    // ── Open edit dialog ──────────────────────────────────────────
    function openEdit(circuit: Circuit) {
        setEditingCircuit(circuit)
        setForm({
            nom: circuit.nom,
            description: circuit.description,
            prix: String(circuit.prix),
            duree: String(circuit.duree),
            region: circuit.region,
            image: circuit.image ?? '',
            actif: circuit.actif ?? true,
        })
        setDialogOpen(true)
    }

    // ── Submit form (create or update) ────────────────────────────
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        try {
            const isEdit = !!editingCircuit
            const url = '/api/admin/circuits'
            const method = isEdit ? 'PATCH' : 'POST'
            const body = isEdit
                ? { id: editingCircuit.id, ...form, prix: Number(form.prix), duree: Number(form.duree) }
                : { ...form, prix: Number(form.prix), duree: Number(form.duree) }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            // ✅ Check content-type before parsing JSON
            const contentType = res.headers.get('content-type')
            if (!contentType?.includes('application/json')) {
                const text = await res.text()
                console.error('Non-JSON response:', text)
                throw new Error('Réponse serveur invalide — voir la console')
            }
            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Erreur serveur')
            }

            if (isEdit) {
                setCircuits(prev => prev.map(c => c.id === data.data.id ? data.data : c))
                toast.success('Circuit mis à jour')
            } else {
                setCircuits(prev => [data.data, ...prev])
                toast.success('Circuit créé', { description: data.data.nom })
            }

            setDialogOpen(false)
            setForm(EMPTY_FORM)

        } catch (err: any) {
            toast.error('Erreur', { description: err.message })
        } finally {
            setSaving(false)
        }
    }

    // ── Toggle actif ──────────────────────────────────────────────
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
        } catch {
            toast.error('Erreur lors de la mise à jour')
        }
    }

    // ── Delete ────────────────────────────────────────────────────
    async function handleDelete() {
        if (!deleteId) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/circuits?id=${deleteId}`, {
                method: 'DELETE',
            })
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

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* ── Header ────────────────────────────────────────── */}
            <div className="bg-[#1B2D5B]">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[#B8962E] text-xs font-mono tracking-[0.4em] uppercase mb-2">
                                Administration
                            </p>
                            <h1
                                className="text-3xl font-light text-white"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
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
                        <div>
                            <div className="text-2xl font-light text-[#B8962E]"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {circuits.length}
                            </div>
                            <div className="text-white/30 text-[10px] font-mono tracking-widest uppercase mt-0.5">
                                Total
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <div className="text-2xl font-light text-[#B8962E]"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {circuits.filter(c => c.actif).length}
                            </div>
                            <div className="text-white/30 text-[10px] font-mono tracking-widest uppercase mt-0.5">
                                Actifs
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <div className="text-2xl font-light text-[#B8962E]"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {circuits.filter(c => !c.actif).length}
                            </div>
                            <div className="text-white/30 text-[10px] font-mono tracking-widest uppercase mt-0.5">
                                Inactifs
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Toolbar ───────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/30" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un circuit..."
                            className="pl-9 h-9 text-sm border-[#1B2D5B]/15 bg-white rounded-none"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-1 border border-[#1B2D5B]/10 bg-white p-1">
                        <button
                            onClick={() => setView('table')}
                            className={`p-1.5 transition-colors ${view === 'table' ? 'bg-[#1B2D5B] text-white' : 'text-[#1B2D5B]/40 hover:text-[#1B2D5B]'}`}
                        >
                            <List className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setView('grid')}
                            className={`p-1.5 transition-colors ${view === 'grid' ? 'bg-[#1B2D5B] text-white' : 'text-[#1B2D5B]/40 hover:text-[#1B2D5B]'}`}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                <AnimatePresence mode="wait">

                    {/* TABLE VIEW */}
                    {view === 'table' && (
                        <motion.div
                            key="table"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Card className="border-[#1B2D5B]/08 rounded-none shadow-none">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-[#1B2D5B]/08 hover:bg-transparent">
                                            <TableHead className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase">Circuit</TableHead>
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
                                                <TableCell colSpan={6} className="text-center py-12 text-[#1B2D5B]/30 text-sm">
                                                    Aucun circuit trouvé
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filtered.map((circuit, i) => (
                                                <motion.tr
                                                    key={circuit.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    className="border-[#1B2D5B]/06 hover:bg-[#1B2D5B]/[0.02] group"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {circuit.image ? (
                                                                <img
                                                                    src={circuit.image}
                                                                    alt={circuit.nom}
                                                                    className="w-10 h-8 object-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-8 bg-[#1B2D5B]/05 flex items-center justify-center flex-shrink-0">
                                                                    <ImageIcon className="h-3 w-3 text-[#1B2D5B]/20" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-light text-[#1B2D5B]">{circuit.nom}</p>
                                                                <p className="text-[10px] text-[#1B2D5B]/30 font-mono line-clamp-1 max-w-[200px]">
                                                                    {circuit.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="flex items-center gap-1.5 text-xs text-[#1B2D5B]/50">
                                                            <MapPin className="h-3 w-3 text-[#B8962E]" />
                                                            {circuit.region}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm font-light text-[#B8962E]">
                                                            {circuit.prix.toLocaleString('fr-DZ')}
                                                            <span className="text-[10px] text-[#1B2D5B]/30 ml-1">DZD</span>
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="flex items-center gap-1 text-xs text-[#1B2D5B]/50">
                                                            <Clock className="h-3 w-3" />
                                                            {circuit.duree}j
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={circuit.actif ?? false}
                                                                onCheckedChange={() => toggleActif(circuit)}
                                                                className="scale-75"
                                                            />
                                                            <span className={`text-[10px] font-mono ${circuit.actif ? 'text-emerald-600' : 'text-[#1B2D5B]/30'}`}>
                                                                {circuit.actif ? 'Actif' : 'Inactif'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => openEdit(circuit)}
                                                                className="p-1.5 text-[#1B2D5B]/40 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/05 transition-colors"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteId(circuit.id)}
                                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>
                        </motion.div>
                    )}

                    {/* GRID VIEW */}
                    {view === 'grid' && (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {filtered.map((circuit, i) => (
                                <motion.div
                                    key={circuit.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <Card className="border-[#1B2D5B]/08 rounded-none shadow-none overflow-hidden group hover:border-[#B8962E]/30 transition-colors">
                                        {/* Image */}
                                        <div className="relative h-36 bg-[#1B2D5B]/05">
                                            {circuit.image ? (
                                                <img src={circuit.image} alt={circuit.nom} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="h-6 w-6 text-[#1B2D5B]/15" />
                                                </div>
                                            )}
                                            {/* Status badge */}
                                            <div className="absolute top-2 right-2">
                                                <Badge className={`text-[9px] font-mono rounded-none ${circuit.actif ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                    {circuit.actif ? 'Actif' : 'Inactif'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <CardContent className="p-4">
                                            <h3 className="text-sm font-light text-[#1B2D5B] mb-1 line-clamp-1"
                                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                                {circuit.nom}
                                            </h3>
                                            <p className="text-[10px] text-[#1B2D5B]/40 font-mono mb-3 line-clamp-2">
                                                {circuit.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-xs text-[#1B2D5B]/40">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />{circuit.duree}j
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />{circuit.region.split('·')[0].trim()}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-light text-[#B8962E]">
                                                    {circuit.prix.toLocaleString('fr-DZ')} DZD
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1B2D5B]/06">
                                                <button
                                                    onClick={() => openEdit(circuit)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 h-7 text-[10px] font-mono tracking-wide text-[#1B2D5B]/50 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/05 transition-colors border border-[#1B2D5B]/10"
                                                >
                                                    <Pencil className="h-3 w-3" /> Modifier
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(circuit.id)}
                                                    className="flex items-center justify-center gap-1.5 h-7 px-3 text-[10px] font-mono tracking-wide text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-red-100"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => toggleActif(circuit)}
                                                    className="flex items-center justify-center h-7 px-3 text-[10px] font-mono border border-[#1B2D5B]/10 text-[#1B2D5B]/40 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/05 transition-colors"
                                                >
                                                    {circuit.actif ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Create / Edit Dialog ──────────────────────────── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl rounded-none p-0 overflow-hidden">
                    <DialogHeader className="px-8 pt-8 pb-0">
                        <DialogTitle
                            className="text-xl font-light text-[#1B2D5B]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            {editingCircuit ? 'Modifier le circuit' : 'Nouveau circuit'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#1B2D5B]/40 font-mono">
                            {editingCircuit ? `ID: ${editingCircuit.id}` : 'Remplissez les informations du circuit'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="px-8 py-6 space-y-5 max-h-[70vh] overflow-y-auto">

                            {/* Nom */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                    Nom du circuit *
                                </Label>
                                <Input
                                    required
                                    value={form.nom}
                                    onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                                    placeholder="ex: Circuit Sahara 8 jours"
                                    className="rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                    Description *
                                </Label>
                                <Textarea
                                    required
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Description du circuit..."
                                    className="rounded-none border-[#1B2D5B]/15 text-sm resize-none min-h-[90px]"
                                />
                                <p className="text-[10px] text-[#1B2D5B]/25 font-mono text-right">
                                    {form.description.length} caractères
                                </p>
                            </div>

                            {/* Prix + Durée */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                        Prix (DZD) *
                                    </Label>
                                    <div className="relative">
                                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                                        <Input
                                            required
                                            type="number"
                                            min="0"
                                            value={form.prix}
                                            onChange={e => setForm(f => ({ ...f, prix: e.target.value }))}
                                            placeholder="85000"
                                            className="pl-9 rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                        Durée (jours) *
                                    </Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                                        <Input
                                            required
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={form.duree}
                                            onChange={e => setForm(f => ({ ...f, duree: e.target.value }))}
                                            placeholder="8"
                                            className="pl-9 rounded-none border-[#1B2D5B]/15 h-10 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Région */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                    Région *
                                </Label>
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
                                {/* Image preview */}
                                {form.image && (
                                    <div className="mt-2 h-24 bg-[#1B2D5B]/05 overflow-hidden">
                                        <img
                                            src={form.image}
                                            alt="preview"
                                            className="w-full h-full object-cover"
                                            onError={e => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Actif toggle */}
                            <div className="flex items-center justify-between p-4 bg-[#F9F7F4] border border-[#1B2D5B]/08">
                                <div>
                                    <p className="text-sm text-[#1B2D5B] font-light">Circuit actif</p>
                                    <p className="text-[10px] text-[#1B2D5B]/40 font-mono">
                                        Visible sur le site public
                                    </p>
                                </div>
                                <Switch
                                    checked={form.actif}
                                    onCheckedChange={v => setForm(f => ({ ...f, actif: v }))}
                                />
                            </div>

                        </div>

                        <DialogFooter className="px-8 py-5 border-t border-[#1B2D5B]/08 bg-[#F9F7F4] gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                className="rounded-none border-[#1B2D5B]/15 text-[#1B2D5B]/60 h-9 px-5 text-xs tracking-widest"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="rounded-none bg-[#1B2D5B] hover:bg-[#B8962E] text-white h-9 px-6 text-xs tracking-widest gap-2 transition-all duration-300"
                            >
                                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {editingCircuit ? 'Mettre à jour' : 'Créer le circuit'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete confirmation ───────────────────────────── */}
            <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-light text-[#1B2D5B]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Supprimer ce circuit ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-[#1B2D5B]/50">
                            Cette action est irréversible. Tous les départs associés seront également supprimés.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none border-[#1B2D5B]/15 text-xs tracking-widest">
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="rounded-none bg-red-600 hover:bg-red-700 text-white text-xs tracking-widest gap-2"
                        >
                            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Supprimer définitivement
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
