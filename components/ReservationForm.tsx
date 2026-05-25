// components/ReservationForm.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import {
    Loader2,
    CheckCircle2,
    User,
    Phone,
    Mail,
    MapPin,
    Globe,
    MessageSquare,
    Users,
    Banknote,
} from 'lucide-react'

// ── ISO countries list (most common travel markets) ───────────────────────
const COUNTRIES = [
    { code: 'DZ', name: 'Algérie 🇩🇿' },
    { code: 'MA', name: 'Maroc 🇲🇦' },
    { code: 'TN', name: 'Tunisie 🇹🇳' },
    { code: 'FR', name: 'France 🇫🇷' },
    { code: 'BE', name: 'Belgique 🇧🇪' },
    { code: 'CH', name: 'Suisse 🇨🇭' },
    { code: 'CA', name: 'Canada 🇨🇦' },
    { code: 'GB', name: 'Royaume-Uni 🇬🇧' },
    { code: 'DE', name: 'Allemagne 🇩🇪' },
    { code: 'ES', name: 'Espagne 🇪🇸' },
    { code: 'IT', name: 'Italie 🇮🇹' },
    { code: 'NL', name: 'Pays-Bas 🇳🇱' },
    { code: 'US', name: 'États-Unis 🇺🇸' },
    { code: 'AE', name: 'Émirats Arabes 🇦🇪' },
    { code: 'SA', name: 'Arabie Saoudite 🇸🇦' },
    { code: 'QA', name: 'Qatar 🇶🇦' },
    { code: 'KW', name: 'Koweït 🇰🇼' },
    { code: 'LY', name: 'Libye 🇱🇾' },
    { code: 'EG', name: 'Égypte 🇪🇬' },
    { code: 'SN', name: 'Sénégal 🇸🇳' },
    { code: 'NG', name: 'Nigeria 🇳🇬' },
    { code: 'ZA', name: 'Afrique du Sud 🇿🇦' },
    { code: 'JP', name: 'Japon 🇯🇵' },
    { code: 'CN', name: 'Chine 🇨🇳' },
    { code: 'AU', name: 'Australie 🇦🇺' },
    { code: 'BR', name: 'Brésil 🇧🇷' },
    { code: 'OTHER', name: 'Autre pays' },
]

// ─────────────────────────────────────────────────────────────────────────

export default function ReservationForm({
    departId,
    circuitNom,
}: {
    departId: string
    circuitNom: string
}) {
    const t = useTranslations('reservation')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const [form, setForm] = useState({
        nom: '',
        telephone: '',
        email: '',
        country: '',      // ✅ ISO country code instead of wilaya
        city: '',      // ✅ free text city
        nombrePersonnes: '1',
        notes: '',
    })

    const set = (field: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm(f => ({ ...f, [field]: e.target.value }))

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!departId) {
            toast.error('Aucune date disponible', {
                description: 'Veuillez contacter notre équipe directement.',
            })
            return
        }

        if (!form.country) {
            toast.error('Veuillez sélectionner votre pays')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, departId }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setSubmitted(true)
                toast.success(t('success'), { description: circuitNom })
                setForm({
                    nom: '', telephone: '', email: '',
                    country: '', city: '', nombrePersonnes: '1', notes: '',
                })
            } else {
                console.error('API error:', data.error)
                toast.error('Erreur', { description: data.error || 'Veuillez réessayer.' })
            }
        } catch (err) {
            console.error('Network error:', err)
            toast.error('Erreur de connexion', {
                description: 'Vérifiez votre connexion et réessayez.',
            })
        } finally {
            setLoading(false)
        }
    }

    // ── Success state ─────────────────────────────────────────────────
    if (submitted) {
        return (
            <Card className="border-[#1B2D5B]/08 rounded-none shadow-none">
                <CardContent className="flex flex-col items-center text-center py-12 gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-light text-[#1B2D5B] mb-2"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Demande envoyée !
                        </h3>
                        <p className="text-sm text-[#1B2D5B]/50 max-w-xs mx-auto leading-relaxed">
                            Notre équipe vous contactera sous 24h pour confirmer votre réservation de{' '}
                            <strong className="text-[#1B2D5B]">{circuitNom}</strong>.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5">
                        <Banknote className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <p className="text-xs text-amber-700">
                            Paiement en espèces à la confirmation
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-[#1B2D5B]/08 rounded-none shadow-none">
            <CardHeader className="border-b border-[#1B2D5B]/06 bg-[#1B2D5B]/[0.02] px-6 py-4">
                <CardTitle className="text-base font-light text-[#1B2D5B]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {t('title')} — {circuitNom}
                </CardTitle>
                <p className="text-[10px] font-mono text-[#1B2D5B]/30 mt-1">
                    * Champs obligatoires
                </p>
            </CardHeader>

            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Nom + Téléphone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                {t('name')} *
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                                <Input
                                    required
                                    value={form.nom}
                                    onChange={set('nom')}
                                    placeholder="Votre nom complet"
                                    className="pl-9 h-10 rounded-none border-[#1B2D5B]/15 text-sm focus-visible:ring-[#B8962E]/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                                {t('phone')} *
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                                <Input
                                    required
                                    type="tel"
                                    value={form.telephone}
                                    onChange={set('telephone')}
                                    placeholder="+213 661 234 567"
                                    className="pl-9 h-10 rounded-none border-[#1B2D5B]/15 text-sm focus-visible:ring-[#B8962E]/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                            {t('email')}{' '}
                            <span className="text-[#1B2D5B]/25 normal-case font-light">(optionnel)</span>
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                            <Input
                                type="email"
                                value={form.email}
                                onChange={set('email')}
                                placeholder="votre@email.com"
                                className="pl-9 h-10 rounded-none border-[#1B2D5B]/15 text-sm focus-visible:ring-[#B8962E]/20"
                            />
                        </div>
                    </div>

                    {/* Country + City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                                Pays *
                            </Label>
                            <Select
                                required
                                value={form.country}
                                onValueChange={v => setForm(f => ({ ...f, country: v }))}
                            >
                                <SelectTrigger className="h-10 rounded-none border-[#1B2D5B]/15 text-sm">
                                    <Globe className="h-3.5 w-3.5 text-[#1B2D5B]/25 mr-2 flex-shrink-0" />
                                    <SelectValue placeholder="Sélectionnez..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                    {COUNTRIES.map(c => (
                                        <SelectItem key={c.code} value={c.code} className="text-sm">
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                                Ville *
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                                <Input
                                    required
                                    value={form.city}
                                    onChange={set('city')}
                                    placeholder="Votre ville"
                                    className="pl-9 h-10 rounded-none border-[#1B2D5B]/15 text-sm focus-visible:ring-[#B8962E]/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nombre de personnes */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                            {t('people')} *
                        </Label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, nombrePersonnes: String(Math.max(1, Number(f.nombrePersonnes) - 1)) }))}
                                className="w-10 h-10 border border-[#1B2D5B]/15 flex items-center justify-center text-[#1B2D5B]/60 hover:bg-[#1B2D5B]/5 hover:text-[#1B2D5B] transition-all text-lg"
                            >
                                −
                            </button>
                            <div className="flex-1 flex items-center justify-center gap-2 border border-[#1B2D5B]/10 h-10 bg-[#F9F7F4]">
                                <Users className="h-3.5 w-3.5 text-[#1B2D5B]/30" />
                                <span className="text-lg font-light text-[#1B2D5B]"
                                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                    {form.nombrePersonnes}
                                </span>
                                <span className="text-xs text-[#1B2D5B]/30 font-mono">
                                    personne{Number(form.nombrePersonnes) > 1 ? 's' : ''}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, nombrePersonnes: String(Math.min(20, Number(f.nombrePersonnes) + 1)) }))}
                                className="w-10 h-10 border border-[#1B2D5B]/15 flex items-center justify-center text-[#1B2D5B]/60 hover:bg-[#1B2D5B]/5 hover:text-[#1B2D5B] transition-all text-lg"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                            {t('notes')}{' '}
                            <span className="text-[#1B2D5B]/25 normal-case font-light">(optionnel)</span>
                        </Label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                            <Textarea
                                value={form.notes}
                                onChange={set('notes')}
                                placeholder="Demandes spéciales, régime alimentaire, mobilité réduite..."
                                className="pl-9 rounded-none border-[#1B2D5B]/15 text-sm resize-none min-h-[80px] focus-visible:ring-[#B8962E]/20"
                                maxLength={500}
                            />
                        </div>
                        <p className="text-[10px] font-mono text-[#1B2D5B]/25 text-right">
                            {form.notes.length}/500
                        </p>
                    </div>

                    {/* Cash note */}
                    {!departId && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3">
                            <Banknote className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">
                                Aucune date disponible actuellement. Votre demande sera traitée comme un circuit sur mesure.
                            </p>
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={loading || !form.country || !form.city}
                        className="w-full h-11 rounded-none bg-[#1B2D5B] hover:bg-[#B8962E] text-white text-xs tracking-widest transition-all duration-300 gap-2"
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {t('submit')}
                    </Button>

                </form>
            </CardContent>
        </Card>
    )
}
