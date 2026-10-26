'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateCourseAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'غير مصرح' }

    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = Number(formData.get('price')) || 0
    // استقبال رابط الصورة
    const thumbnailUrl = formData.get('thumbnail_url') as string

    if (!title || title.trim().length < 3) {
        return { error: 'عنوان الكورس مطلوب (3 أحرف على الأقل)' }
    }

    const { error } = await supabase
        .from('courses')
        .update({
            title: title.trim(),
            description: description?.trim(),
            price: price,
            thumbnail_url: thumbnailUrl?.trim() || null, // حفظ الرابط أو null
        })
        .eq('id', courseId)
        .eq('instructor_id', user.id)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/courses/${courseId}`)
    revalidatePath('/dashboard')
    redirect(`/dashboard/courses/${courseId}`)
}