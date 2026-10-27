import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lms-platform-xxxx.vercel.app'
    const supabase = await createClient()

    // 1. الروابط الثابتة (الرئيسية والمنتدى)
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

    // 2. روابط الكورسات
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

    // 3. روابط مواضيع المنتدى
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
}