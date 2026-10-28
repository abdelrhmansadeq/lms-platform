import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js' // <--- غيرنا الاستيراد هنا

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lms-platform-xxxx.vercel.app'

    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/forum`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
    ]

    try {
        // بنكريت Client عادي من غير كوكيز عشان نمنع مشكلة الـ Dynamic
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // 1. روابط الكورسات
        const { data: courses } = await supabase
            .from('courses')
            .select('slug, created_at')
            .eq('is_published', true)

        const courseRoutes = (courses || []).map((course) => ({
            url: `${baseUrl}/courses/${course.slug}`,
            lastModified: new Date(course.created_at),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }))

        // 2. روابط مواضيع المنتدى
        const { data: posts } = await supabase
            .from('forum_posts')
            .select('id, created_at')

        const postRoutes = (posts || []).map((post) => ({
            url: `${baseUrl}/forum/${post.id}`,
            lastModified: new Date(post.created_at),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }))

        return [...staticRoutes, ...courseRoutes, ...postRoutes]
    } catch (error) {
        console.error('Error generating sitemap:', error)
        return staticRoutes
    }
}