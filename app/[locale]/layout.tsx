import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { locales } from '@/i18n/config'
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Toaster } from '@/components/ui/sonner'

import { getTranslations } from 'next-intl/server'

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})


const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'meta' })

    return {
        metadataBase: new URL(BASE),
        title: {
            default: t('site_title'),
            template: `%s · Explorea`,
        },
        description: t('site_description'),
        keywords: ['voyage Algérie', 'circuit désert', 'Sahara', 'Tassili', 'tourisme Algérie', 'Algeria tours'],
        authors: [{ name: 'Explorea', url: BASE }],
        creator: 'Explorea',

        // ── Multilingual alternates ──────────────────────────────────────
        alternates: {
            canonical: `${BASE}/${locale}`,
            languages: {
                'fr': `${BASE}/fr`,
                'ar': `${BASE}/ar`,
                'en': `${BASE}/en`,
                'es': `${BASE}/es`,
                'it': `${BASE}/it`,
                'x-default': `${BASE}/fr`,
            },
        },

        // ── Open Graph ──────────────────────────────────────────────────
        openGraph: {
            type: 'website',
            siteName: 'Explorea',
            locale: locale === 'ar' ? 'ar_DZ' : locale === 'en' ? 'en_US' : 'fr_FR',
            title: t('site_title'),
            description: t('site_description'),
            images: [
                {
                    url: `${BASE}/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: 'Explorea — Voyages d\'Exception',
                },
            ],
        },

        // ── Twitter / X card ────────────────────────────────────────────
        twitter: {
            card: 'summary_large_image',
            title: t('site_title'),
            description: t('site_description'),
            images: [`${BASE}/og-image.png`],
        },

        // ── Robots ──────────────────────────────────────────────────────
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    }
}


export function generateStaticParams() {
    return locales.map((locale) => ({ locale }))  // ✅ fixed markdown corruption
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>  // ✅ Next.js 15: params is a Promise
}) {
    const { locale } = await params
    const messages = await getMessages({ locale })

    return (
        <ClerkProvider afterSignOutUrl="/">
            <html
                lang={locale}
                dir={locale === "ar" ? "rtl" : "ltr"}
                className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            >
                <head>
                    <link
                        rel="preload"
                        as="image"
                        href="/hero-poster.jpg"
                        fetchPriority="high"   // ← tells browser this is LCP
                    />
                </head>
                <body className="min-h-full flex flex-col">
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <Navbar />
                        <main className="flex-1 pt-24 md:pt-28">
                            {children}
                            <Toaster />
                        </main>
                        <Footer />
                    </NextIntlClientProvider>
                </body>
            </html>
        </ClerkProvider >
    )
}
