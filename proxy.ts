import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n/config'

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'as-needed', // ✅ fr has no prefix, /ar/... and /en/... do
})

const isProtectedRoute = createRouteMatcher([
    '/:locale/mon-compte(.*)',
])

export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) auth.protect()
    return intlMiddleware(req)
})

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
