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
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

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
    'El M\'Ghair', 'El Meniaa'
]

export default function ReservationForm({
    departId,
    circuitNom,
}: {
    departId: string
    circuitNom: string
}) {
    const t = useTranslations('reservation')
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

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
        setLoading(true)

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, departId }),
            })

            if (res.ok) {
                toast({
                    title: '✅ ' + t('success'),
                    description: circuitNom,
                })
                setForm({
                    nom: '', telephone: '', email: '',
                    wilaya: '', nombrePersonnes: '1', notes: ''
                })
            } else {
                throw new Error()
            }
        } catch {
            toast({
                title: 'Erreur',
                description: 'Veuillez réessayer.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
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
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('wilaya')} *</Label>
                            <Select
                                required
                                value={form.wilaya}
                                onValueChange={v => setForm({ ...form, wilaya: v })}
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

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('submit')}
                    </Button>

                </form>
            </CardContent>
        </Card>
    )
}
