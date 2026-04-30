// components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
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
    User,
    Phone,
    Mail,
    MessageSquare,
    Send,
    Loader2,
    CheckCircle2,
} from 'lucide-react'

const SUJETS = [
    'Demande de renseignements',
    'Réservation de circuit',
    'Circuit sur mesure',
    'Devis voyage de groupe',
    'Partenariat',
    'Réclamation',
    'Autre',
]

const WILAYAS = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa',
    'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa',
    'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel',
    'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla',
    'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès',
    'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
    'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma',
    'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun',
    'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès', 'In Salah',
    'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa',
]

export default function ContactForm() {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [form, setForm] = useState({
        nom: '',
        email: '',
        telephone: '',
        wilaya: '',
        sujet: '',
        message: '',
    })

    const set = (field: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm(f => ({ ...f, [field]: e.target.value }))

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.sujet) {
            toast.error('Veuillez sélectionner un sujet')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error)
            setSubmitted(true)
            toast.success('Message envoyé !', {
                description: 'Nous vous répondrons dans les 24h.',
            })
        } catch (err: any) {
            toast.error('Erreur', { description: err.message || 'Veuillez réessayer.' })
        } finally {
            setLoading(false)
        }
    }

    // ── Success state ─────────────────────────────────────────────
    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-[#1B2D5B]/08 p-12 flex flex-col items-center text-center gap-5"
            >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                    <h3
                        className="text-xl font-light text-[#1B2D5B] mb-2"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        Message envoyé !
                    </h3>
                    <p className="text-sm text-[#1B2D5B]/50 max-w-sm leading-relaxed">
                        Merci <strong className="text-[#1B2D5B]">{form.nom}</strong>. Notre équipe
                        vous contactera dans les 24 à 48 heures.
                    </p>
                </div>
                <button
                    onClick={() => { setSubmitted(false); setForm({ nom: '', email: '', telephone: '', wilaya: '', sujet: '', message: '' }) }}
                    className="text-xs font-mono tracking-widest text-[#B8962E] uppercase hover:text-[#1B2D5B] transition-colors"
                >
                    Envoyer un autre message
                </button>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-[#1B2D5B]/08"
        >
            {/* Form header */}
            <div className="px-8 py-6 border-b border-[#1B2D5B]/06 bg-[#1B2D5B]/[0.02]">
                <h2
                    className="text-lg font-light text-[#1B2D5B]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Envoyez-nous un message
                </h2>
                <p className="text-xs text-[#1B2D5B]/40 font-mono mt-1">
                    Tous les champs marqués * sont obligatoires
                </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

                {/* Nom + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                            Nom complet *
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                            <Input
                                required
                                value={form.nom}
                                onChange={set('nom')}
                                placeholder="Votre nom"
                                className="pl-9 h-10 rounded-none border-[#1B2D5B]/15 text-sm focus-visible:ring-[#B8962E]/20"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                            Email *
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                            <Input
                                required
                                type="email"
                                value={form.email}
                                onChange={set('email')}
                                placeholder="votre@email.com"
                                className="pl-9 h-10 rounded-none border-[#1B2D5B]/15 text-sm focus-visible:ring-[#B8962E]/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Téléphone + Wilaya */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                            Téléphone
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                            <Input
                                type="tel"
                                value={form.telephone}
                                onChange={set('telephone')}
                                placeholder="0661 234 567"
                                className="pl-9 h-10 rounded-none border-[#1B2D5B]/15 text-sm focus-visible:ring-[#B8962E]/20"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                            Wilaya
                        </Label>
                        <Select
                            value={form.wilaya}
                            onValueChange={v => setForm(f => ({ ...f, wilaya: v ?? '' }))}
                        >
                            <SelectTrigger className="h-10 rounded-none border-[#1B2D5B]/15 text-sm">
                                <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {WILAYAS.map(w => (
                                    <SelectItem key={w} value={w} className="text-sm">{w}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Sujet */}
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                        Sujet *
                    </Label>
                    <Select
                        value={form.sujet}
                        onValueChange={v => setForm(f => ({ ...f, sujet: v ?? '' }))}
                        required
                    >
                        <SelectTrigger className="h-10 rounded-none border-[#1B2D5B]/15 text-sm">
                            <SelectValue placeholder="Choisissez un sujet..." />
                        </SelectTrigger>
                        <SelectContent>
                            {SUJETS.map(s => (
                                <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                        Message *
                    </Label>
                    <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-3.5 w-3.5 text-[#1B2D5B]/25" />
                        <Textarea
                            required
                            value={form.message}
                            onChange={set('message')}
                            placeholder="Décrivez votre demande en détail..."
                            className="pl-9 rounded-none border-[#1B2D5B]/15 text-sm resize-none min-h-[130px] focus-visible:ring-[#B8962E]/20"
                            maxLength={1000}
                        />
                    </div>
                    <p className="text-[10px] font-mono text-[#1B2D5B]/25 text-right">
                        {form.message.length}/1000
                    </p>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1B2D5B]/06">
                    <p className="text-[10px] font-mono text-[#1B2D5B]/25">
                        Réponse garantie sous 24–48h
                    </p>
                    <Button
                        type="submit"
                        disabled={loading || !form.sujet}
                        className="rounded-none bg-[#1B2D5B] hover:bg-[#B8962E] text-white h-10 px-6 text-xs tracking-widest gap-2 transition-all duration-300"
                    >
                        {loading
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Send className="h-3.5 w-3.5" />
                        }
                        Envoyer le message
                    </Button>
                </div>
            </form>
        </motion.div>
    )
}
