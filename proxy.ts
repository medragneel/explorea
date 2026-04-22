import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n/config'

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'as-needed'
})

const isProtectedRoute = createRouteMatcher([
    '/:locale/mon-compte(.*)',
])

export default clerkMiddleware((auth, req) => {
    // 1. Run i18n routing FIRST
    const response = intlMiddleware(req)

    // 2. Protect routes
    if (isProtectedRoute(req)) {
        auth.protect()
    }

    return response
})

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
