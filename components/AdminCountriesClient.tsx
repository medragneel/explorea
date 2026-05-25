// components/AdminCountriesClient.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import { toast } from 'sonner'
import { getField } from '@/lib/i18n-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
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
import {
    Plus, Pencil, Trash2, Loader2,
    Globe, ImageIcon, Search, Eye, EyeOff,
} from 'lucide-react'
import type { Country } from '@/db/schema'

type CountryWithCount = Country & { circuitCount: number }

const EMPTY_FORM = {
    code: '',
    nameFr: '',
    nameAr: '',
    nameEn: '',
    continent: '',
    currency: '',
    flag: '',
    image: '',
    actif: true,
}

const CONTINENTS = ['Africa', 'Asia', 'Europe', 'South America', 'North America', 'Oceania', 'Antarctica']

const CURRENCIES_COMMON = [
    'DZD', 'MAD', 'TND', 'EGP', 'LYD', 'MRU',
    'EUR', 'USD', 'GBP', 'CHF',
    'SAR', 'AED', 'QAR', 'KWD', 'JOD',
    'KES', 'ZAR', 'ETB', 'NGN',
    'NPR', 'ISK', 'PEN', 'BRL',
]

export default function AdminCountriesClient({
    initialCountries,
}: {
    initialCountries: CountryWithCount[]
}) {
    const locale = useLocale()
    const [allCountries, setAllCountries] = useState<CountryWithCount[]>(initialCountries)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCountry, setEditingCountry] = useState<CountryWithCount | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const filtered = allCountries.filter(c => {
        if (!search.trim()) return true
        const name = getField(c.name, locale)
        return name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase()) ||
            c.continent.toLowerCase().includes(search.toLowerCase())
    })

    function openCreate() {
        setEditingCountry(null)
        setForm(EMPTY_FORM)
        setDialogOpen(true)
    }

    function openEdit(country: CountryWithCount) {
        setEditingCountry(country)
        const name = country.name as Record<string, string>
        setForm({
            code: country.code,
            nameFr: name.fr ?? '',
            nameAr: name.ar ?? '',
            nameEn: name.en ?? '',
            continent: country.continent,
            currency: country.currency,
            flag: (country.flag as string) ?? '',
            image: (country.image as string) ?? '',
            actif: country.actif ?? true,
        })
        setDialogOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                code: form.code.toUpperCase(),
                name: { fr: form.nameFr, ar: form.nameAr, en: form.nameEn },
                continent: form.continent,
                currency: form.currency.toUpperCase(),
                flag: form.flag || null,
                image: form.image || null,
                actif: form.actif,
            }

            const isEdit = !!editingCountry
            const url = '/api/admin/countries'
            const method = isEdit ? 'PATCH' : 'POST'
            const body = isEdit ? { id: editingCountry.id, ...payload } : payload

            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error || 'Erreur serveur')

            const updated = { ...data.data, circuitCount: editingCountry?.circuitCount ?? 0 }
            if (isEdit) {
                setAllCountries(prev => prev.map(c => c.id === updated.id ? updated : c))
                toast.success('Pays mis à jour')
            } else {
                setAllCountries(prev => [updated, ...prev])
                toast.success('Pays créé', { description: form.nameFr })
            }
            setDialogOpen(false)
        } catch (err: any) {
            toast.error('Erreur', { description: err.message })
        } finally {
            setSaving(false)
        }
    }

    async function toggleActif(country: CountryWithCount) {
        try {
            const res = await fetch('/api/admin/countries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: country.id, actif: !country.actif }),
            })
            const data = await res.json()
            if (data.success) {
                setAllCountries(prev => prev.map(c => c.id === data.data.id ? { ...data.data, circuitCount: c.circuitCount } : c))
                toast.success(data.data.actif ? 'Pays activé' : 'Pays désactivé')
            }
        } catch { toast.error('Erreur') }
    }

    async function handleDelete() {
        if (!deleteId) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/countries?id=${deleteId}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error)
            setAllCountries(prev => prev.filter(c => c.id !== deleteId))
            toast.success('Pays supprimé')
        } catch (err: any) {
            toast.error('Erreur', { description: err.message })
        } finally {
            setDeleting(false)
            setDeleteId(null)
        }
    }

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* Header */}
            <div className="bg-[#1B2D5B]">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[#B8962E] text-xs font-mono tracking-[0.4em] uppercase mb-2">Administration</p>
                            <h1 className="text-3xl font-light text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                Gestion des Pays
                            </h1>
                        </div>
                        <Button onClick={openCreate} className="bg-[#B8962E] hover:bg-[#D4AF5A] text-white rounded-none h-10 px-5 text-xs tracking-widest gap-2">
                            <Plus className="h-4 w-4" /> Nouveau pays
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8 mt-8 pt-6 border-t border-white/10">
                        {[
                            { value: allCountries.length, label: 'Total' },
                            { value: allCountries.filter(c => c.actif).length, label: 'Actifs' },
                            { value: allCountries.filter(c => c.circuitCount > 0).length, label: 'Avec circuits' },
                            { value: allCountries.reduce((s, c) => s + c.circuitCount, 0), label: 'Circuits total' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-8">
                                {i > 0 && <div className="h-8 w-px bg-white/10" />}
                                <div>
                                    <div className="text-2xl font-light text-[#B8962E]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{s.value}</div>
                                    <div className="text-white/30 text-[10px] font-mono tracking-widest uppercase mt-0.5">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="max-w-7xl mx-auto px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/30" />
                        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un pays..." className="pl-9 h-9 w-52 text-sm border-[#1B2D5B]/15 bg-white rounded-none" />
                    </div>
                    <span className="text-[10px] font-mono text-[#1B2D5B]/30">{filtered.length} pays</span>
                </div>
            </div>

            {/* Table */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                <Card className="border-[#1B2D5B]/08 rounded-none shadow-none">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-[#1B2D5B]/08 hover:bg-transparent">
                                {['Pays', 'Code', 'Continent', 'Devise', 'Circuits', 'Statut', 'Actions'].map(h => (
                                    <TableHead key={h} className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase">{h}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-[#1B2D5B]/30 text-sm">Aucun pays trouvé</TableCell>
                                </TableRow>
                            ) : filtered.map((country, i) => {
                                const name = getField(country.name, locale)
                                return (
                                    <motion.tr
                                        key={country.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="border-[#1B2D5B]/06 hover:bg-[#1B2D5B]/[0.02] group"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {(country.image as string) ? (
                                                    <img src={country.image as string} alt={name} className="w-10 h-7 object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-7 bg-[#1B2D5B]/05 flex items-center justify-center flex-shrink-0 text-lg">
                                                        {(country.flag as string) ?? <Globe className="h-4 w-4 text-[#1B2D5B]/20" />}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-light text-[#1B2D5B]">{name}</p>
                                                    <p className="text-[9px] font-mono text-[#1B2D5B]/30">{(country.flag as string) ?? ''} {country.code}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-mono text-[#1B2D5B]/50 bg-[#1B2D5B]/05 px-2 py-0.5">{country.code}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-[#1B2D5B]/50">{country.continent}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-mono text-[#B8962E]">{country.currency}</span>
                                        </TableCell>
                                        <TableCell>
                                            {country.circuitCount > 0 ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-mono rounded-none">
                                                    {country.circuitCount} circuit{country.circuitCount > 1 ? 's' : ''}
                                                </Badge>
                                            ) : (
                                                <span className="text-[10px] font-mono text-[#1B2D5B]/25">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch checked={country.actif ?? false} onCheckedChange={() => toggleActif(country)} className="scale-75" />
                                                <span className={`text-[10px] font-mono ${country.actif ? 'text-emerald-600' : 'text-[#1B2D5B]/30'}`}>
                                                    {country.actif ? 'Actif' : 'Inactif'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(country)} className="p-1.5 text-[#1B2D5B]/40 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/05 transition-colors">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => setDeleteId(country.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors" disabled={country.circuitCount > 0}>
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

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg rounded-none p-0 overflow-hidden">
                    <DialogHeader className="px-8 pt-8 pb-0">
                        <DialogTitle className="text-xl font-light text-[#1B2D5B]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {editingCountry ? 'Modifier le pays' : 'Nouveau pays'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#1B2D5B]/40 font-mono">
                            {editingCountry ? `ID: ${editingCountry.id}` : 'Ajoutez une nouvelle destination'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="px-8 py-6 space-y-4 max-h-[65vh] overflow-y-auto">

                            {/* Code + Flag + Currency */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Code ISO *</Label>
                                    <Input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                        placeholder="DZ" maxLength={2} className="rounded-none border-[#1B2D5B]/15 h-10 text-sm font-mono uppercase" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Drapeau</Label>
                                    <Input value={form.flag} onChange={e => setForm(f => ({ ...f, flag: e.target.value }))}
                                        placeholder="🇩🇿" className="rounded-none border-[#1B2D5B]/15 h-10 text-sm text-center text-lg" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Devise *</Label>
                                    <Input required value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value.toUpperCase() }))}
                                        placeholder="DZD" maxLength={3} className="rounded-none border-[#1B2D5B]/15 h-10 text-sm font-mono uppercase" />
                                </div>
                            </div>

                            {/* Names */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Nom *</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm w-6">🇫🇷</span>
                                        <Input required value={form.nameFr} onChange={e => setForm(f => ({ ...f, nameFr: e.target.value }))}
                                            placeholder="Algérie" className="flex-1 rounded-none border-[#1B2D5B]/15 h-9 text-sm" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm w-6">🇩🇿</span>
                                        <Input value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                                            placeholder="الجزائر" dir="rtl" className="flex-1 rounded-none border-[#1B2D5B]/15 h-9 text-sm text-right" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm w-6">🇬🇧</span>
                                        <Input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                                            placeholder="Algeria" className="flex-1 rounded-none border-[#1B2D5B]/15 h-9 text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Continent */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">Continent *</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {CONTINENTS.map(c => (
                                        <button
                                            key={c} type="button"
                                            onClick={() => setForm(f => ({ ...f, continent: c }))}
                                            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wide border transition-colors ${form.continent === c
                                                    ? 'bg-[#1B2D5B] text-white border-[#1B2D5B]'
                                                    : 'text-[#1B2D5B]/50 border-[#1B2D5B]/15 hover:border-[#1B2D5B]/30'
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Image URL */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                                    Image hero <span className="text-[#1B2D5B]/25 normal-case">(optionnel)</span>
                                </Label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                                    <Input type="url" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                                        placeholder="https://..." className="pl-9 rounded-none border-[#1B2D5B]/15 h-10 text-sm" />
                                </div>
                                {form.image && (
                                    <div className="h-20 overflow-hidden mt-1">
                                        <img src={form.image} alt="preview" className="w-full h-full object-cover"
                                            onError={e => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                )}
                            </div>

                            {/* Active */}
                            <div className="flex items-center justify-between p-4 bg-[#F9F7F4] border border-[#1B2D5B]/08">
                                <div>
                                    <p className="text-sm text-[#1B2D5B] font-light">Pays actif</p>
                                    <p className="text-[10px] text-[#1B2D5B]/40 font-mono">Visible sur la page destinations</p>
                                </div>
                                <Switch checked={form.actif} onCheckedChange={v => setForm(f => ({ ...f, actif: v }))} />
                            </div>
                        </div>

                        <DialogFooter className="px-8 py-5 border-t border-[#1B2D5B]/08 bg-[#F9F7F4] gap-3">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}
                                className="rounded-none border-[#1B2D5B]/15 text-[#1B2D5B]/60 h-9 px-5 text-xs tracking-widest">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={saving || !form.continent}
                                className="rounded-none bg-[#1B2D5B] hover:bg-[#B8962E] text-white h-9 px-6 text-xs tracking-widests gap-2 transition-all duration-300">
                                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {editingCountry ? 'Mettre à jour' : 'Créer le pays'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-light text-[#1B2D5B]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Supprimer ce pays ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-[#1B2D5B]/50">
                            Cette action est irréversible. Assurez-vous que ce pays n'a pas de circuits associés.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none border-[#1B2D5B]/15 text-xs tracking-widest">Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}
                            className="rounded-none bg-red-600 hover:bg-red-700 text-white text-xs tracking-widests gap-2">
                            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
