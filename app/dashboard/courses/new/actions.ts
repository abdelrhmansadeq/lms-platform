'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createCourseAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'يجب تسجيل الدخول أولاً' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = Number(formData.get('price')) || 0
    // استقبال رابط الصورة
    const thumbnailUrl = formData.get('thumbnail_url') as string

    if (!title || title.trim().length < 3) {
        return { error: 'عنوان الكورس مطلوب (3 أحرف على الأقل)' }
    }

    const baseSlug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const uniqueSuffix = Math.random().toString(36).substring(2, 6)
    const slug = `${baseSlug || 'course'}-${uniqueSuffix}`

    const { error } = await supabase.from('courses').insert({
        instructor_id: user.id,
        title: title.trim(),
        description: description?.trim(),
        price: price,
        slug: slug,
        is_published: false,
        thumbnail_url: thumbnailUrl?.trim() || null, // حفظ الرابط أو null
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}