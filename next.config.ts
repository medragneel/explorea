// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {

    // ── Image optimization ───────────────────────────────────────────────
    images: {
        formats: ['image/avif', 'image/webp'], // auto-convert to modern formats
        remotePatterns: [
            // Allow any external image URL (Supabase storage, Unsplash, etc.)
            { protocol: 'https', hostname: '**' },
            { protocol: 'http', hostname: 'localhost' },
        ],
        // Preload hero images faster
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 3600, // cache optimized images for 1 hour
    },

    // ── Bundle optimization ──────────────────────────────────────────────
    experimental: {
        // Tree-shake these large packages — only import what's used
        optimizePackageImports: [
            'framer-motion',
            'lucide-react',
            'date-fns',
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-switch',
            '@radix-ui/react-alert-dialog',
        ],
    },

    // ── HTTP headers ─────────────────────────────────────────────────────
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    // Security headers
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                ],
            },
            {
                // Cache static assets aggressively
                source: '/(.*)\\.(ico|png|jpg|jpeg|svg|webp|avif|woff2|woff)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
        ]
    },

}

export default withNextIntl(nextConfig)
