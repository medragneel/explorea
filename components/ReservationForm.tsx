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
import { Loader2, CheckCircle2 } from 'lucide-react'

const wilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi',
    'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa',
    'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda',
    'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', "M'Sila",
    'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès',
    'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila',
    'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa',
    'Relizane', 'Timimoun', 'Bordj Badji Mokhtar',
    'Ouled Djellal', 'Béni Abbès', 'In Salah',
    'In Guezzam', 'Touggourt', 'Djanet',
    "El M'Ghair", 'El Meniaa'
]

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
        wilaya: '',
        nombrePersonnes: '1',
        notes: '',
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        // ✅ guard against missing departId
        if (!departId) {
            toast.error('Aucune date de départ disponible', {
                description: 'Veuillez contacter notre équipe directement.',
            })
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
                // ✅ success
                setSubmitted(true)
                toast.success(t('success'), {
                    description: circuitNom,
                })
                setForm({
                    nom: '', telephone: '', email: '',
                    wilaya: '', nombrePersonnes: '1', notes: ''
                })
            } else {
                // ❌ server returned error with message
                console.error('API error:', data.error)
                toast.error('Erreur', {
                    description: data.error || 'Veuillez réessayer.',
                })
            }
        } catch (err) {
            // ❌ network or parse error
            console.error('Network error:', err)
            toast.error('Erreur de connexion', {
                description: 'Vérifiez votre connexion et réessayez.',
            })
        } finally {
            setLoading(false)
        }
    }

    // ── Success state ──────────────────────────────────────────────
    if (submitted) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center text-center py-12 gap-4">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    <div>
                        <h3 className="text-lg font-medium text-[#1B2D5B] mb-2">
                            Demande envoyée !
                        </h3>
                        <p className="text-sm text-[#1B2D5B]/50 max-w-xs mx-auto">
                            Notre équipe vous contactera sous 24h pour confirmer votre réservation de <strong>{circuitNom}</strong>.
                        </p>
                    </div>
                    <p className="text-xs font-mono text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2">
                        💵 Paiement en espèces à la confirmation
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')} — {circuitNom}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nom">{t('name')} *</Label>
                            <Input
                                id="nom"
                                required
                                value={form.nom}
                                onChange={e => setForm({ ...form, nom: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telephone">{t('phone')} *</Label>
                            <Input
                                id="telephone"
                                required
                                type="tel"
                                placeholder="0661 234 567"
                                value={form.telephone}
                                onChange={e => setForm({ ...form, telephone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">{t('email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="optionnel"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('wilaya')} *</Label>
                            <Select
                                value={form.wilaya}
                                onValueChange={v => setForm({ ...form, wilaya: v ?? '' })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {wilayas.map(w => (
                                        <SelectItem key={w} value={w}>{w}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="people">{t('people')} *</Label>
                            <Input
                                id="people"
                                type="number"
                                min="1"
                                max="20"
                                required
                                value={form.nombrePersonnes}
                                onChange={e => setForm({ ...form, nombrePersonnes: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">{t('notes')}</Label>
                        <Textarea
                            id="notes"
                            rows={3}
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                        />
                    </div>
                    {!departId && (
                        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
                            ⚠️ Aucune date de départ disponible pour ce circuit. Contactez-nous au +213 21 XX XX XX.
                        </div>
                    )}


                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || !form.wilaya}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('submit')}
                    </Button>

                </form>
            </CardContent>
        </Card>
    )
}
