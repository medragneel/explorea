import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n/config'

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'as-needed',
})

const isProtectedRoute = createRouteMatcher([
    '/:locale/mon-compte(.*)',
])

const isApiRoute = createRouteMatcher(['/api/(.*)'])

export default clerkMiddleware((auth, req) => {
    if (isApiRoute(req)) return // ✅ skip intl + auth for API routes

    if (isProtectedRoute(req)) auth.protect()
    return intlMiddleware(req)
})

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/'],  // ✅ removed api/trpc from matcher
}
