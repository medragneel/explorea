// components/Navbar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useUser, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Menu } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
    const t = useTranslations('nav')
    const { isSignedIn } = useUser()
    const locale = useLocale()
    const [open, setOpen] = useState(false)

    const links = [
        { href: `/${locale}`, label: t('home') },
        { href: `/${locale}/circuits`, label: t('circuits') },
        { href: `/${locale}/destinations`, label: t('destinations') },
        { href: `/${locale}/contact`, label: t('contact') },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">

                {/* Logo */}
                <Link href={`/${locale}`} className="font-bold text-xl tracking-widest">
                    SAHA<span className="text-amber-500">R</span>A
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <LanguageSwitcher />

                    {isSignedIn ? (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/${locale}/mon-compte`}>{t('my_account')}</Link>
                            </Button>
                            <UserButton afterSignOutUrl={`/${locale}`} />
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/${locale}/connexion`}>{t('login')}</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href={`/${locale}/inscription`}>{t('register')}</Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile menu */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex flex-col gap-4 mt-8">
                                {links.map(link => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-lg font-medium"
                                        onClick={() => setOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <Separator />
                                {!isSignedIn && (
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" asChild>
                                            <Link href={`/${locale}/connexion`}>{t('login')}</Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href={`/${locale}/inscription`}>{t('register')}</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

            </div>
        </header>
    )
}
