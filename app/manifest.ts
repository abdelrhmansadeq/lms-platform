import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'منصة LMS التعليمية',
        short_name: 'منصة LMS',
        description: 'منصة تعليمية متكاملة لتصفح الكورسات، حل الاختبارات، والتفاعل مع المجتمع.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0B0F17',
        theme_color: '#10B981',
        orientation: 'portrait',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any', // التعديل هنا
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any', // وضفنا دي هنا كمان للاحتياط
            },
        ],
    }
}