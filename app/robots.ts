import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    // اللينك ده هيتقرأ من Vercel أوتوماتيك، ولو مش موجود هيستخدم اللينك الافتراضي
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lms-platform-xxxx.vercel.app'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/dashboard/',
                '/profile/',
                '/wishlist/',
                '/login/',
                '/register/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}