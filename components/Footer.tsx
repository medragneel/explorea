// components/home/Footer.tsx
import Image from 'next/image'
import { Link } from '@/lib/navigation'
import { Phone, Mail, MapPin } from 'lucide-react'

const LINKS = {
    destinations: [
        { label: 'Sahara & Grand Erg', href: '/circuits/550e8400-e29b-41d4-a716-446655440001' },
        { label: "Tassili n'Ajjer", href: '/circuits/550e8400-e29b-41d4-a716-446655440002' },
        { label: 'Route des Ksour', href: '/circuits/550e8400-e29b-41d4-a716-446655440003' },
        { label: 'Casbah & Côte', href: '/circuits/550e8400-e29b-41d4-a716-446655440004' },
        { label: 'Hoggar & Assekrem', href: '/circuits/550e8400-e29b-41d4-a716-446655440005' },
    ],
    agence: [
        { label: 'À propos', href: '/a-propos' },
        { label: 'Nos circuits', href: '/circuits' },
        { label: 'Destinations', href: '/destinations' },
        { label: 'Contact', href: '/contact' },
        { label: 'Mentions légales', href: '/mentions-legales' },
    ],
}

export default function Footer() {
    return (
        <footer className="bg-[#080604] border-t border-white/[0.06]">
            {/* Main footer */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="block mb-6">
                            <Image
                                src="/explorea_logo_dark.png"
                                alt="Explorea — Explorez sans limites"
                                width={120}
                                height={80}
                                className="object-contain h-auto brightness-0 invert opacity-90"
                            />
                        </Link>
                        <p className="text-white/30 text-xs leading-relaxed font-light mb-6 max-w-[220px]">
                            Agence de voyage premium spécialisée dans les destinations algériennes depuis 2006.
                        </p>
                        {/* Social */}
                        {/*

                        <div className="flex items-center gap-4">
                            {[
                                { href: '#', label: 'Instagram' },
                                { href: '#', label: 'Facebook' },
                                { href: '#', label: 'YouTube' },
                            ].map(s => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/30 hover:text-amber-400 hover:border-amber-400/30 transition-all duration-300"
                                >
                                    {s.label}
                                </a>
                            ))}
                        </div>
                    */}
                    </div>

                        {/* Destinations */}
                        <div>
                            <h4 className="text-[9px] font-mono tracking-[0.4em] uppercase text-amber-500/60 mb-5">
                                Destinations
                            </h4>
                            <ul className="space-y-3">
                                {LINKS.destinations.map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-xs font-light text-white/30 hover:text-white/70 transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Agence */}
                        <div>
                            <h4 className="text-[9px] font-mono tracking-[0.4em] uppercase text-amber-500/60 mb-5">
                                Agence
                            </h4>
                            <ul className="space-y-3">
                                {LINKS.agence.map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-xs font-light text-white/30 hover:text-white/70 transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-[9px] font-mono tracking-[0.4em] uppercase text-amber-500/60 mb-5">
                                Contact
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    { icon: Phone, value: '+213 21 XX XX XX', href: 'tel:+21321XXXXXX' },
                                    { icon: Mail, value: 'contact@explorea.dz', href: 'mailto:contact@explorea.dz' },
                                    { icon: MapPin, value: 'Alger, Algérie', href: null },
                                ].map(item => (
                                    <li key={item.value} className="flex items-start gap-2.5">
                                        <item.icon className="h-3.5 w-3.5 text-amber-500/40 flex-shrink-0 mt-0.5" />
                                        {item.href ? (
                                            <a href={item.href} className="text-xs font-light text-white/30 hover:text-white/70 transition-colors duration-200">
                                                {item.value}
                                            </a>
                                        ) : (
                                            <span className="text-xs font-light text-white/30">{item.value}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {/* Certifications */}
                            <div className="mt-6 pt-6 border-t border-white/[0.06]">
                                <p className="text-[9px] font-mono tracking-[0.3em] uppercase text-white/15 mb-3">Agréée</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-white/20 border border-white/10 px-2 py-1">IATA</span>
                                    <span className="text-[9px] font-mono text-white/20 border border-white/10 px-2 py-1">APST</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/[0.04]">
                    <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="text-[10px] font-mono tracking-widest text-white/15">
                            © {new Date().getFullYear()} Explorea · Tous droits réservés
                        </p>
                        <div className="flex items-center gap-1">
                            <div className="h-px w-6 bg-amber-500/20" />
                            <span className="text-[9px] font-mono tracking-[0.3em] text-amber-500/30 uppercase px-2">
                                Explorez sans limites
                            </span>
                            <div className="h-px w-6 bg-amber-500/20" />
                        </div>
                        <div className="flex items-center gap-4">
                            {['CGV', 'Confidentialité', 'Cookies'].map(item => (
                                <Link key={item} href="#" className="text-[9px] font-mono text-white/15 hover:text-white/40 transition-colors uppercase tracking-widest">
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
        </footer>
    )
}
