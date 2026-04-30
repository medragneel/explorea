// components/home/FeaturedCircuits.tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { MapPin, ArrowRight } from 'lucide-react'
import { Link } from '@/lib/navigation'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.12, ease: EASE } }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

const CIRCUITS = [
    { id: '550e8400-e29b-41d4-a716-446655440001', title: 'Grand Erg Oriental', region: 'Ouargla · Tamanrasset', days: 8, price: '85 000', tag: 'Bestseller', color: 'from-amber-900/80 to-orange-950/90', accent: '#D97706', description: 'Traversée épique des grandes dunes du Sahara algérien avec bivouac sous les étoiles.' },
    { id: '550e8400-e29b-41d4-a716-446655440002', title: "Tassili n'Ajjer", region: 'Djanet · UNESCO', days: 10, price: '110 000', tag: 'Exclusif', color: 'from-red-900/80 to-stone-950/90', accent: '#DC2626', description: 'Art rupestre préhistorique et paysages lunaires dans ce joyau du patrimoine mondial.' },
    { id: '550e8400-e29b-41d4-a716-446655440003', title: 'Casbah & Côte', region: 'Alger · Béjaïa', days: 5, price: '45 000', tag: 'Nouveau', color: 'from-sky-900/80 to-blue-950/90', accent: '#0284C7', description: 'De la médina millénaire aux criques turquoise de la Kabylie maritime.' },
    { id: '550e8400-e29b-41d4-a716-446655440004', title: 'Route des Ksour', region: "Ghardaïa · M'Zab", days: 6, price: '62 000', tag: 'Culturel', color: 'from-yellow-900/80 to-amber-950/90', accent: '#CA8A04', description: 'Architecture mozabite et cités millénaires au cœur du désert pierreux.' },
]

export default function FeaturedCircuits() {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })

    return (
        <section className="py-28 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
            <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-amber-500" />
                            <span className="text-amber-500 text-xs tracking-[0.3em] uppercase font-light font-mono">Nos Circuits</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-light leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Les trésors<br /><em className="text-amber-300">d'Algérie</em>
                        </motion.h2>
                    </div>
                    <motion.div variants={fadeUp} custom={2}>
                        <Link href="/circuits" className="inline-flex items-center gap-2 text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-none tracking-widest text-xs h-10 px-6 transition-all duration-300">
                            Voir tout <ArrowRight className="h-3 w-3" />
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CIRCUITS.map((circuit, i) => (
                        <motion.div
                            key={circuit.id}
                            variants={fadeUp}
                            custom={i}
                            whileHover={{ y: -6 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="group relative overflow-hidden cursor-pointer"
                            style={{ minHeight: i === 0 ? '420px' : '280px' }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${circuit.color} transition-all duration-700`} />
                            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500" style={{ background: circuit.accent }} />
                            <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <Badge className="text-[10px] tracking-[0.2em] uppercase font-mono rounded-none px-3 py-1" style={{ background: `${circuit.accent}30`, color: circuit.accent, border: `1px solid ${circuit.accent}40` }}>
                                        {circuit.tag}
                                    </Badge>
                                    <div className="text-white/40 text-xs font-mono">{circuit.days} jours</div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="h-3 w-3 text-white/40" />
                                        <span className="text-white/50 text-xs tracking-wide font-mono">{circuit.region}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-light text-white mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                        {circuit.title}
                                    </h3>
                                    <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-sm">{circuit.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-white/30 text-[10px] font-mono tracking-widest uppercase mb-1">À partir de</div>
                                            <div className="text-xl font-light" style={{ color: circuit.accent }}>
                                                {circuit.price} <span className="text-sm text-white/40">DZD</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/circuits/${circuit.id}`}
                                            className="inline-flex items-center h-9 px-5 rounded-none text-[10px] tracking-widest transition-all duration-300 text-black"
                                            style={{ background: circuit.accent }}
                                        >
                                            Réserver
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `linear-gradient(135deg, ${circuit.accent}08, transparent 50%)` }} />
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    )
}
