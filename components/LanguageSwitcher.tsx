'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/lib/navigation' // ✅ next-intl router
import { useTransition, useEffect, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe, Loader2, Check } from 'lucide-react'

const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇩🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
]

export default function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    function switchLocale(newLocale: string) {
        if (newLocale === locale) return
        startTransition(() => {
            // ✅ next-intl router handles locale prefix automatically
            router.replace(pathname, { locale: newLocale })
        })
    }

    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" disabled className="gap-2 text-[#1B2D5B]/40">
                <Globe className="h-4 w-4" />
            </Button>
        )
    }

    const currentLang = languages.find(l => l.code === locale)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    className="gap-2 text-[#1B2D5B]/60 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/5"
                >
                    {isPending
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Globe className="h-4 w-4" />
                    }
                    <span className="text-xs">{currentLang?.flag} {currentLang?.label}</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-[160px]">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => switchLocale(lang.code)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-base">{lang.flag}</span>
                            <span className="text-sm">{lang.label}</span>
                        </div>
                        {locale === lang.code && (
                            <Check className="h-3.5 w-3.5 text-[#B8962E]" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
