// app/[locale]/contact/page.tsx
import { getTranslations } from 'next-intl/server'
import ContactForm from '@/components/ContactForm'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function generateMetadata_ContactPage({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params

    const titles: Record<string, string> = {
        fr: 'Contact — Planifiez votre voyage avec Explorea',
        en: 'Contact — Plan your trip with Explorea',
        ar: 'تواصل معنا — خطط لرحلتك مع إكسبلوريا',
    }
    const descs: Record<string, string> = {
        fr: 'Contactez notre équipe pour planifier votre circuit sur mesure. Réponse garantie sous 24–48h.',
        en: 'Contact our team to plan your tailor-made circuit. Reply guaranteed within 24–48h.',
        ar: 'تواصل مع فريقنا لتخطيط جولتك المخصصة. رد مضمون خلال 24–48 ساعة.',
    }

    return {
        title: titles[locale] ?? titles.fr,
        description: descs[locale] ?? descs.fr,
        alternates: {
            canonical: `${BASE}/${locale}/contact`,
            languages: { fr: `${BASE}/fr/contact`, ar: `${BASE}/ar/contact`, en: `${BASE}/en/contact` },
        },
        openGraph: {
            title: titles[locale] ?? titles.fr,
            description: descs[locale] ?? descs.fr,
            url: `${BASE}/${locale}/contact`,
        },
    }
}



export default async function ContactPage() {
    const t = await getTranslations('contact')

    const INFO_ITEMS = [
        {
            icon: Phone,
            label: t('info.phone_label'),
            value: '+213 21 XX XX XX',
            sub: t('info.phone_sub'),
            href: 'tel:+21321XXXXXX',
        },
        {
            icon: Mail,
            label: t('info.email_label'),
            value: 'contact@explorea.dz',
            sub: t('info.email_sub'),
            href: 'mailto:contact@explorea.dz',
        },
        {
            icon: MapPin,
            label: t('info.address_label'),
            value: t('info.address_value'),
            sub: t('info.address_sub'),
            href: null,
        },
        {
            icon: Clock,
            label: t('info.hours_label'),
            value: t('info.hours_value'),
            sub: t('info.hours_sub'),
            href: null,
        },
    ]

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* Header */}
            <div className="bg-[#1B2D5B] relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-[#B8962E]/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-px w-10 bg-[#B8962E]" />
                        <span className="text-[#B8962E] text-xs font-mono tracking-[0.4em] uppercase">
                            Explorea · Contact
                        </span>
                    </div>
                    <h1
                        className="text-4xl md:text-6xl font-light text-white mb-4 leading-tight"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        {t('title')}
                    </h1>
                    <p className="text-white/50 text-base max-w-xl leading-relaxed font-light">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left — Info cards */}
                    <div className="space-y-4">
                        {INFO_ITEMS.map(item => (
                            <div
                                key={item.label}
                                className="bg-white border border-[#1B2D5B]/08 p-5 flex items-start gap-4 group hover:border-[#B8962E]/30 transition-colors"
                            >
                                <div className="w-9 h-9 bg-[#B8962E]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B8962E]/20 transition-colors">
                                    <item.icon className="h-4 w-4 text-[#B8962E]" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-mono tracking-[0.3em] text-[#1B2D5B]/30 uppercase mb-1">
                                        {item.label}
                                    </p>
                                    {item.href ? (
                                        <a href={item.href}
                                            className="text-sm font-light text-[#1B2D5B] hover:text-[#B8962E] transition-colors block">
                                            {item.value}
                                        </a>
                                    ) : (
                                        <p className="text-sm font-light text-[#1B2D5B]">{item.value}</p>
                                    )}
                                    <p className="text-[10px] text-[#1B2D5B]/30 font-mono mt-0.5">{item.sub}</p>
                                </div>
                            </div>
                        ))}

                        {/* Social */}
                        <div className="bg-[#1B2D5B] p-5">
                            <p className="text-[9px] font-mono tracking-[0.3em] text-[#B8962E]/60 uppercase mb-4">
                                {t('info.follow_us')}
                            </p>
                            <div className="flex flex-col gap-2">
                                {['Facebook', 'Instagram', 'YouTube'].map(s => (
                                    <a key={s} href="#"
                                        className="text-xs font-mono tracking-widest text-white/40 hover:text-[#B8962E] transition-colors uppercase">
                                        {s}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — Form */}
                    <div className="lg:col-span-2">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    )
}
