import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { locales } from '@/i18n/config'
import Navbar from "@/components/Navbar"
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "Explorea DZ",
    description: "Agence de voyage en Algérie",
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
        <ClerkProvider>
            <html
                lang={locale}
                dir={locale === "ar" ? "rtl" : "ltr"}
                className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            >
                <body className="min-h-full flex flex-col">
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <Navbar />
                        <main className="flex-1 pt-24 md:pt-28">
                            {children}
                            <Toaster />
                        </main>
                    </NextIntlClientProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}
