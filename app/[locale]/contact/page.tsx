// app/[locale]/contact/page.tsx
import ContactForm from '@/components/ContactForm'
import { getTranslations } from 'next-intl/server'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default async function ContactPage() {
    const t = await getTranslations('contact')

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
                        {[
                            {
                                icon: Phone,
                                label: 'Téléphone',
                                value: '+213 21 XX XX XX',
                                sub: 'Lun–Sam · 8h–18h',
                                href: 'tel:+21321XXXXXX',
                            },
                            {
                                icon: Mail,
                                label: 'Email',
                                value: 'contact@explorea.dz',
                                sub: 'Réponse sous 24h',
                                href: 'mailto:contact@explorea.dz',
                            },
                            {
                                icon: MapPin,
                                label: 'Adresse',
                                value: 'Alger, Algérie',
                                sub: 'Sur rendez-vous',
                                href: null,
                            },
                            {
                                icon: Clock,
                                label: 'Horaires',
                                value: 'Lun–Ven 8h–18h',
                                sub: 'Sam 9h–13h',
                                href: null,
                            },
                        ].map((item) => (
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
                                        <a
                                            href={item.href}
                                            className="text-sm font-light text-[#1B2D5B] hover:text-[#B8962E] transition-colors block"
                                        >
                                            {item.value}
                                        </a>
                                    ) : (
                                        <p className="text-sm font-light text-[#1B2D5B]">{item.value}</p>
                                    )}
                                    <p className="text-[10px] text-[#1B2D5B]/30 font-mono mt-0.5">{item.sub}</p>
                                </div>
                            </div>
                        ))}

                        {/* Social links */}
                        <div className="bg-[#1B2D5B] p-5">
                            <p className="text-[9px] font-mono tracking-[0.3em] text-[#B8962E]/60 uppercase mb-4">
                                Suivez-nous
                            </p>
                            <div className="flex flex-col gap-2">
                                {[
                                    { name: 'Facebook', url: '#' },
                                    { name: 'Instagram', url: '#' },
                                    { name: 'YouTube', url: '#' },
                                ].map(s => (
                                    <a
                                        key={s.name}
                                        href={s.url}
                                        className="text-xs font-mono tracking-widest text-white/40 hover:text-[#B8962E] transition-colors uppercase"
                                    >
                                        {s.name}
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
