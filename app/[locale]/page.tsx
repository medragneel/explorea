'use client'

import { useRef, useState, useEffect } from 'react'
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    useInView,
    AnimatePresence,
} from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    ChevronDown,
    ArrowRight,
    MapPin,
    Clock,
    Users,
    Star,
    Compass,
    Tent,
    Camera,
    Globe,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
    { value: '48+', label: 'Destinations', icon: MapPin },
    { value: '12K', label: 'Voyageurs', icon: Users },
    { value: '18', label: 'Années', icon: Clock },
    { value: '4.9', label: 'Note moyenne', icon: Star },
]

const CIRCUITS = [
    {
        id: 1,
        title: 'Grand Erg Oriental',
        region: 'Ouargla · Tamanrasset',
        days: 8,
        price: '85 000',
        tag: 'Bestseller',
        color: 'from-amber-900/80 to-orange-950/90',
        accent: '#D97706',
        description: 'Traversée épique des grandes dunes du Sahara algérien avec bivouac sous les étoiles.',
    },
    {
        id: 2,
        title: "Tassili n'Ajjer",
        region: 'Djanet · UNESCO',
        days: 10,
        price: '110 000',
        tag: 'Exclusif',
        color: 'from-red-900/80 to-stone-950/90',
        accent: '#DC2626',
        description: 'Art rupestre préhistorique et paysages lunaires dans ce joyau du patrimoine mondial.',
    },
    {
        id: 3,
        title: 'Casbah & Côte',
        region: 'Alger · Béjaïa',
        days: 5,
        price: '45 000',
        tag: 'Nouveau',
        color: 'from-sky-900/80 to-blue-950/90',
        accent: '#0284C7',
        description: 'De la médina millénaire aux criques turquoise de la Kabylie maritime.',
    },
    {
        id: 4,
        title: "Route des Ksour",
        region: "Ghardaïa · M'Zab",
        days: 6,
        price: '62 000',
        tag: 'Culturel',
        color: 'from-yellow-900/80 to-amber-950/90',
        accent: '#CA8A04',
        description: 'Architecture mozabite et cités millénaires au cœur du désert pierreux.',
    },
]

const EXPERIENCES = [
    { icon: Compass, title: 'Méharées', desc: "Traversées à dos de dromadaire sur d'anciens itinéraires caravaniers." },
    { icon: Tent, title: 'Bivouacs', desc: 'Nuits sous les étoiles avec campements de luxe en plein désert.' },
    { icon: Camera, title: 'Photographie', desc: 'Circuits dédiés aux photographes dans les plus beaux paysages.' },
    { icon: Globe, title: 'Sur mesure', desc: 'Chaque voyage pensé et façonné selon vos désirs.' },
]

const TESTIMONIALS = [
    {
        name: 'Sophie Laurent',
        origin: 'Paris, France',
        text: "Une expérience qui a changé ma vision du monde. Le Sahara algérien est d'une beauté à couper le souffle.",
        rating: 5,
        circuit: 'Grand Erg Oriental',
    },
    {
        name: 'Ahmed Benali',
        origin: 'Montréal, Canada',
        text: "Retourner aux racines à travers le Tassili... Indescriptible. L'équipe est exceptionnelle.",
        rating: 5,
        circuit: "Tassili n'Ajjer",
    },
    {
        name: 'Marco Ferretti',
        origin: 'Milan, Italie',
        text: "Ghardaïa m'a envoûté. Architecture, culture, hospitalité — tout est parfait.",
        rating: 5,
        circuit: 'Route des Ksour',
    },
]

// ─── Animation variants ───────────────────────────────────────────────────────

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, delay: i * 0.12, ease: EASE },
    }),
}

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.7 } },
}

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })
    return (
        <motion.div
            ref={ref}
            variants={stagger}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className={className}
        >
            {children}
        </motion.div>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-amber-500" />
            <span className="text-amber-500 text-xs tracking-[0.3em] uppercase font-light font-mono">
                {children}
            </span>
        </motion.div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const heroRef = useRef<HTMLDivElement>(null)

    const [playing, setPlaying] = useState(true)
    const [muted, setMuted] = useState(true)
    const [videoProgress, setVideoProgress] = useState(0)

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

    const videoY = useTransform(smoothProgress, [0, 1], ['0%', '30%'])
    const videoScale = useTransform(smoothProgress, [0, 1], [1, 1.12])
    const textY = useTransform(smoothProgress, [0, 1], ['0%', '60%'])
    const overlayOpacity = useTransform(smoothProgress, [0, 0.5], [0.55, 0.85])
    const heroOpacity = useTransform(smoothProgress, [0, 0.8], [1, 0])

    function togglePlay() {
        if (!videoRef.current) return
        if (playing) { videoRef.current.pause(); setPlaying(false) }
        else { videoRef.current.play(); setPlaying(true) }
    }

    function toggleMute() {
        if (!videoRef.current) return
        videoRef.current.muted = !muted
        setMuted(!muted)
    }

    useEffect(() => {
        const v = videoRef.current
        if (!v) return
        const update = () => setVideoProgress((v.currentTime / v.duration) * 100 || 0)
        v.addEventListener('timeupdate', update)
        return () => v.removeEventListener('timeupdate', update)
    }, [])

    function seekVideo(e: React.MouseEvent<HTMLDivElement>) {
        const v = videoRef.current
        if (!v) return
        const rect = e.currentTarget.getBoundingClientRect()
        const pct = (e.clientX - rect.left) / rect.width
        v.currentTime = pct * v.duration
    }

    return (
        <div ref={containerRef} className="bg-[#080604] text-[#EDE8DF] overflow-x-hidden">

            {/* ── HERO ─────────────────────────────────────────────────────────── */}
            <section ref={heroRef} className="relative h-screen overflow-hidden">

                <motion.div className="absolute inset-0 z-0" style={{ y: videoY, scale: videoScale }}>
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                </motion.div>

                <motion.div
                    className="absolute inset-0 z-10 bg-gradient-to-t from-[#080604] via-[#080604]/40 to-[#080604]/20"
                    style={{ opacity: overlayOpacity }}
                />

                <div
                    className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '128px 128px',
                    }}
                />

                <motion.div
                    className="absolute inset-0 z-20 flex flex-col justify-end pb-32 px-8 md:px-16 lg:px-24"
                    style={{ y: textY, opacity: heroOpacity }}
                >
                    <motion.div initial="hidden" animate="visible" variants={stagger}>
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                            <div className="h-px w-12 bg-amber-400" />
                            <span className="text-amber-400 text-xs tracking-[0.4em] uppercase font-mono">
                                Agence de Voyage Premium · Algérie
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            custom={1}
                            className="text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] tracking-tight mb-6"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            L'Algérie
                            <br />
                            <em className="text-amber-300 not-italic">Intemporelle</em>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            custom={2}
                            className="text-[#EDE8DF]/60 text-base md:text-lg font-light tracking-wide max-w-lg mb-10 leading-relaxed"
                        >
                            Du Sahara mystique aux côtes méditerranéennes — des voyages d'exception façonnés pour les âmes aventurières.
                        </motion.p>

                        <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4 items-center">
                            <Button
                                size="lg"
                                className="bg-amber-500 hover:bg-amber-400 text-black font-medium tracking-wide px-8 h-12 rounded-none transition-all duration-300"
                            >
                                Découvrir nos circuits
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10 font-light tracking-widest text-xs px-8 h-12 rounded-none transition-all duration-300"
                            >
                                Sur mesure
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.6 }}
                    className="absolute bottom-8 left-8 md:left-16 lg:left-24 z-30 flex flex-col gap-3"
                >
                    <div className="w-48 h-px bg-white/20 cursor-pointer relative group" onClick={seekVideo}>
                        <motion.div
                            className="absolute left-0 top-0 h-full bg-amber-400 origin-left"
                            style={{ width: `${videoProgress}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlay}
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs tracking-widest"
                        >
                            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            <span className="font-mono">{playing ? 'PAUSE' : 'PLAY'}</span>
                        </button>
                        <div className="w-px h-3 bg-white/20" />
                        <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                            {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    className="absolute bottom-8 right-8 md:right-16 z-30 flex flex-col items-center gap-2"
                >
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                        <ChevronDown className="h-5 w-5 text-white/40" />
                    </motion.div>
                    <span
                        className="text-white/30 text-[9px] tracking-[0.3em] uppercase font-mono"
                        style={{ writingMode: 'vertical-rl' }}
                    >
                        Scroll
                    </span>
                </motion.div>
            </section>

            {/* ── STATS BAR ────────────────────────────────────────────────────── */}
            <AnimatedSection>
                <div className="border-y border-white/[0.06] bg-[#0D0A07]">
                    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/[0.06]">
                        {STATS.map((stat, i) => (
                            <motion.div key={stat.label} variants={fadeUp} custom={i} className="flex flex-col items-center gap-1 px-6 py-4">
                                <stat.icon className="h-4 w-4 text-amber-500/60 mb-2" />
                                <span className="text-4xl md:text-5xl font-light text-amber-300" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                    {stat.value}
                                </span>
                                <span className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-mono">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* ── CIRCUITS ─────────────────────────────────────────────────────── */}
            <section className="py-28 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
                <AnimatedSection>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <SectionLabel>Nos Circuits</SectionLabel>
                            <motion.h2
                                variants={fadeUp}
                                custom={1}
                                className="text-4xl md:text-5xl font-light leading-tight"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                Les trésors<br />
                                <em className="text-amber-300">d'Algérie</em>
                            </motion.h2>
                        </div>
                        <motion.div variants={fadeUp} custom={2}>
                            <Button variant="ghost" className="text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-none tracking-widest text-xs h-10 px-6 transition-all duration-300">
                                Voir tout <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                        </motion.div>
                    </div>
                </AnimatedSection>

                <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div
                                className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
                                style={{ background: circuit.accent }}
                            />
                            <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <Badge
                                        className="text-[10px] tracking-[0.2em] uppercase font-mono rounded-none px-3 py-1"
                                        style={{ background: `${circuit.accent}30`, color: circuit.accent, border: `1px solid ${circuit.accent}40` }}
                                    >
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
                                        <Button
                                            size="sm"
                                            className="rounded-none tracking-widest text-[10px] h-9 px-5 transition-all duration-300"
                                            style={{ background: circuit.accent, color: '#000' }}
                                        >
                                            Réserver
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                style={{ background: `linear-gradient(135deg, ${circuit.accent}08, transparent 50%)` }}
                            />
                        </motion.div>
                    ))}
                </AnimatedSection>
            </section>

            {/* ── PARALLAX QUOTE ───────────────────────────────────────────────── */}
            <ParallaxQuote />

            {/* ── EXPERIENCES ──────────────────────────────────────────────────── */}
            <section className="py-28 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
                <AnimatedSection>
                    <SectionLabel>Nos Expériences</SectionLabel>
                    <motion.h2
                        variants={fadeUp}
                        custom={1}
                        className="text-4xl md:text-5xl font-light mb-16 leading-tight"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        Voyager autrement,<br />
                        <em className="text-amber-300">vivre pleinement</em>
                    </motion.h2>
                </AnimatedSection>

                <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04]">
                    {EXPERIENCES.map((exp, i) => (
                        <motion.div
                            key={exp.title}
                            variants={fadeUp}
                            custom={i}
                            whileHover={{ backgroundColor: 'rgba(217,119,6,0.06)' }}
                            className="bg-[#080604] p-10 group cursor-pointer transition-colors duration-300 relative overflow-hidden"
                        >
                            <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500" style={{ background: '#D97706' }} />
                            <exp.icon className="h-6 w-6 text-amber-500/60 mb-6 group-hover:text-amber-400 transition-colors duration-300" />
                            <h3 className="text-xl font-light mb-4 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {exp.title}
                            </h3>
                            <p className="text-white/40 text-sm leading-relaxed">{exp.desc}</p>
                        </motion.div>
                    ))}
                </AnimatedSection>
            </section>

            {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
            <section className="py-28 bg-[#0D0A07] px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <AnimatedSection>
                        <SectionLabel>Témoignages</SectionLabel>
                        <motion.h2
                            variants={fadeUp}
                            custom={1}
                            className="text-4xl md:text-5xl font-light mb-16"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            Ce qu'ils disent<br />
                            <em className="text-amber-300">de leurs voyages</em>
                        </motion.h2>
                    </AnimatedSection>

                    <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={t.name} variants={fadeUp} custom={i}>
                                <Card className="bg-[#100D08] border-white/[0.06] rounded-none overflow-hidden group hover:border-amber-500/20 transition-colors duration-300">
                                    <CardContent className="p-8">
                                        <div className="flex gap-0.5 mb-6">
                                            {Array.from({ length: t.rating }).map((_, j) => (
                                                <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <blockquote
                                            className="text-white/70 text-base leading-relaxed mb-8 italic"
                                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                        >
                                            "{t.text}"
                                        </blockquote>
                                        <div className="flex items-center justify-between border-t border-white/[0.06] pt-6">
                                            <div>
                                                <div className="text-white text-sm font-medium">{t.name}</div>
                                                <div className="text-white/30 text-xs font-mono tracking-wide">{t.origin}</div>
                                            </div>
                                            <Badge className="bg-amber-500/10 text-amber-400/80 border-amber-500/20 rounded-none text-[9px] font-mono tracking-wider">
                                                {t.circuit}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatedSection>
                </div>
            </section>

            {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
            <CTABanner />

            {/* ── FOOTER ───────────────────────────────────────────────────────── */}
            <footer className="border-t border-white/[0.06] py-12 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-2xl font-light tracking-widest" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        SAHA<span className="text-amber-400">R</span>A
                    </div>
                    <p className="text-white/20 text-xs font-mono tracking-widest">
                        © 2025 SAHARA Travel · Tous droits réservés
                    </p>
                    <div className="flex gap-6">
                        {['Instagram', 'Facebook', 'YouTube'].map(s => (
                            <a key={s} href="#" className="text-white/20 hover:text-amber-400 text-xs font-mono tracking-widest transition-colors duration-300">
                                {s}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}

// ─── Parallax Quote ───────────────────────────────────────────────────────────

function ParallaxQuote() {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: '-100px' })
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
    const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%'])
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

    return (
        <section ref={ref} className="relative py-40 overflow-hidden">
            <motion.div className="absolute inset-0 z-0" style={{ y }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1C1209] via-[#2A1A08] to-[#0D0804]" />
                {[200, 400, 600].map((size) => (
                    <div
                        key={size}
                        className="absolute top-1/2 left-1/2 rounded-full border border-amber-500/[0.06]"
                        style={{ width: size, height: size, transform: 'translate(-50%, -50%)' }}
                    />
                ))}
            </motion.div>

            <motion.div className="relative z-10 max-w-4xl mx-auto px-6 text-center" style={{ opacity }}>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1, ease: EASE }}
                >
                    <div className="text-9xl text-amber-500/10 leading-none mb-4 select-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        "
                    </div>
                    <blockquote
                        className="text-3xl md:text-4xl lg:text-5xl font-light italic text-white/80 leading-relaxed mb-10"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        Le désert ne se visite pas — il se vit, il se respire, il vous transforme pour toujours.
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-amber-500/40" />
                        <cite className="text-amber-500/70 text-xs tracking-[0.4em] uppercase font-mono not-italic">
                            Ibn Battuta · XIVe siècle
                        </cite>
                        <div className="h-px w-12 bg-amber-500/40" />
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: '-60px' })
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
    const bgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

    return (
        <section ref={ref} className="relative py-32 overflow-hidden">
            <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-950/80 via-orange-950/60 to-amber-900/80" />
            </motion.div>

            <motion.div
                className="relative z-10 max-w-4xl mx-auto px-6 text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, ease: EASE }}
            >
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-px w-10 bg-amber-400/50" />
                    <span className="text-amber-400/70 text-xs tracking-[0.4em] uppercase font-mono">
                        Votre aventure commence ici
                    </span>
                    <div className="h-px w-10 bg-amber-400/50" />
                </div>

                <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Prêt pour votre<br />
                    <em className="text-amber-300">odyssée saharienne ?</em>
                </h2>

                <p className="text-white/50 text-base mb-10 max-w-lg mx-auto leading-relaxed">
                    Nos experts créent votre voyage sur mesure. Contactez-nous et partez dans 48h.
                </p>

                <div className="flex flex-wrap gap-4 justify-center">
                    <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-none tracking-wide px-10 h-13 text-sm transition-all duration-300">
                        Planifier mon voyage
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-none tracking-widest text-xs px-8 transition-all duration-300">
                        Voir les circuits
                    </Button>
                </div>
            </motion.div>
        </section>
    )
}
