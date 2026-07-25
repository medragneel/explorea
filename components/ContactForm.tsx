// components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    User, Phone, Mail, MessageSquare,
    Send, Loader2, CheckCircle2, Globe, MapPin,
} from 'lucide-react'

// ── Subjects by locale ─────────────────────────────────────────────────────
// These are pulled from messages, defined below

export default function ContactForm() {
    const t = useTranslations('contact.form')
    const locale = useLocale()
    const isRTL = locale === 'ar'

    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [form, setForm] = useState({
        nom: '',
        email: '',
        telephone: '',
        country: '',
        sujet: '',
        message: '',
    })

    const set = (field: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm(f => ({ ...f, [field]: e.target.value }))

    // Subjects come from messages file — keys only here
    const SUJET_KEYS = [
        'inquiry', 'booking', 'custom', 'group',
        'partnership', 'complaint', 'other',
    ] as const

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.sujet) {
            toast.error(t('error_subject'))
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    sujet: t(`subjects.${form.sujet}`), // send translated subject in email
                }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error)
            setSubmitted(true)
            toast.success(t('success_title'), { description: t('success_desc') })
        } catch (err: any) {
            toast.error(t('error_title'), { description: err.message || t('error_retry') })
        } finally {
            setLoading(false)
        }
    }

    // ── Success state ─────────────────────────────────────────────────
    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-[#1B2D5B]/08 p-12 flex flex-col items-center text-center gap-5"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                    <h3
                        className="text-xl font-light text-[#1B2D5B] mb-2"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        {t('success_title')}
                    </h3>
                    <p className="text-sm text-[#1B2D5B]/50 max-w-sm leading-relaxed">
                        {t('success_desc_long').replace('{name}', form.nom)}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSubmitted(false)
                        setForm({ nom: '', email: '', telephone: '', country: '', sujet: '', message: '' })
                    }}
                    className="text-xs font-mono tracking-widest text-[#B8962E] uppercase hover:text-[#1B2D5B] transition-colors"
                >
                    {t('send_another')}
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
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Form header */}
            <div className="px-8 py-6 border-b border-[#1B2D5B]/06 bg-[#1B2D5B]/[0.02]">
                <h2
                    className="text-lg font-light text-[#1B2D5B]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    {t('title')}
                </h2>
                <p className="text-xs text-[#1B2D5B]/40 font-mono mt-1">
                    {t('required_hint')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

                {/* Nom + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/50 uppercase">
                            {t('name')} *
                        </Label>
                        <div className="relative">
                            <User className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25 ${isRTL ? 'right-3' : 'left-3'}`} />
                            <Input
                                required
                                value={form.nom}
                                onChange={set('nom')}
                                placeholder={t('name_placeholder')}
                                className={`h-10 rounded-none border-[#1B2D5B]/15 text-sm focus-visible:ring-[#B8962E]/20 ${isRTL ? 'pr-9 text-right' : 'pl-9'}`}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                            {t('email')} *
                        </Label>
                        <div className="relative">
                            <Mail className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25 ${isRTL ? 'right-3' : 'left-3'}`} />
                            <Input
                                required
                                type="email"
                                value={form.email}
                                onChange={set('email')}
                                placeholder={t('email_placeholder')}
                                className={`h-10 rounded-none border-[#1B2D5B]/15 text-sm focus-visible:ring-[#B8962E]/20 ${isRTL ? 'pr-9 text-right' : 'pl-9'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Téléphone + Pays */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                            {t('phone')}
                        </Label>
                        <div className="relative">
                            <Phone className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25 ${isRTL ? 'right-3' : 'left-3'}`} />
                            <Input
                                type="tel"
                                value={form.telephone}
                                onChange={set('telephone')}
                                placeholder={t('phone_placeholder')}
                                className={`h-10 rounded-none border-[#1B2D5B]/15 text-sm focus-visible:ring-[#B8962E]/20 ${isRTL ? 'pr-9 text-right' : 'pl-9'}`}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                            {t('country')}
                        </Label>
                        <div className="relative">
                            <Globe className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/25 ${isRTL ? 'right-3' : 'left-3'}`} />
                            <Input
                                value={form.country}
                                onChange={set('country')}
                                placeholder={t('country_placeholder')}
                                className={`h-10 rounded-none border-[#1B2D5B]/15 text-sm focus-visible:ring-[#B8962E]/20 ${isRTL ? 'pr-9 text-right' : 'pl-9'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Sujet */}
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                        {t('subject')} *
                    </Label>
                    <Select
                        value={form.sujet}
                        onValueChange={v => setForm(f => ({ ...f, sujet: v }))}
                    >
                        <SelectTrigger className={`h-10 rounded-none border-[#1B2D5B]/15 text-sm ${isRTL ? 'text-right' : ''}`}>
                            <SelectValue placeholder={t('subject_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {SUJET_KEYS.map(key => (
                                <SelectItem key={key} value={key} className="text-sm">
                                    {t(`subjects.${key}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                        {t('message')} *
                    </Label>
                    <div className="relative">
                        <MessageSquare className={`absolute top-3 h-3.5 w-3.5 text-[#1B2D5B]/25 ${isRTL ? 'right-3' : 'left-3'}`} />
                        <Textarea
                            required
                            value={form.message}
                            onChange={set('message')}
                            placeholder={t('message_placeholder')}
                            className={`rounded-none border-[#1B2D5B]/15 text-sm resize-none min-h-[130px] focus-visible:ring-[#B8962E]/20 ${isRTL ? 'pr-9 text-right' : 'pl-9'}`}
                            maxLength={1000}
                        />
                    </div>
                    <p className={`text-[10px] font-mono text-[#1B2D5B]/25 ${isRTL ? 'text-left' : 'text-right'}`}>
                        {form.message.length}/1000
                    </p>
                </div>

                {/* Submit */}
                <div className={`flex items-center justify-between pt-2 border-t border-[#1B2D5B]/06 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <p className="text-[10px] font-mono text-[#1B2D5B]/25">
                        {t('response_time')}
                    </p>
                    <Button
                        type="submit"
                        disabled={loading || !form.sujet}
                        className="rounded-none bg-[#1B2D5B] hover:bg-[#B8962E] text-white h-10 px-6 text-xs tracking-widests gap-2 transition-all duration-300"
                    >
                        {loading
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Send className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                        }
                        {t('submit')}
                    </Button>
                </div>

            </form>
        </motion.div>
    )
}
