'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe, Loader2 } from 'lucide-react'
import { locales } from '@/i18n/config'

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

    const currentLang = languages.find(l => l.code === locale)

    function switchLocale(newLocale: string) {
        if (newLocale === locale) return

        // Remove any existing locale prefix from the path
        let newPath = pathname

        // Strip current locale prefix if it exists
        for (const loc of locales) {
            if (newPath.startsWith(`/${loc}`)) {
                newPath = newPath.slice(`/${loc}`.length) || '/'
                break
            }
        }

        // Add new locale prefix (skip for default locale if using as-needed)
        const finalPath = newLocale === 'fr'
            ? newPath                        // fr is default, no prefix needed
            : `/${newLocale}${newPath}`

        startTransition(() => {
            router.push(finalPath)
            router.refresh()
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>  {/* ✅ asChild fixes the button nesting */}
                <Button variant="ghost" size="sm" className="gap-2" disabled={isPending}>
                    {isPending
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Globe className="h-4 w-4" />
                    }
                    <span>{currentLang?.flag} {currentLang?.label}</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => switchLocale(lang.code)}
                        className={locale === lang.code ? 'bg-accent font-medium' : 'cursor-pointer'}
                    >
                        <span className="mr-2 text-base">{lang.flag}</span>
                        {lang.label}
                        {locale === lang.code && (
                            <span className="ml-auto text-xs text-muted-foreground">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
