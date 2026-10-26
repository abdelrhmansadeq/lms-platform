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
    const thumbnailFile = formData.get('thumbnail_file') as File | null

    if (!title || title.trim().length < 3) {
        return { error: 'عنوان الكورس مطلوب (3 أحرف على الأقل)' }
    }

    // 1. جلب بيانات الكورس الحالية عشان نحافظ على الصورة القديمة لو مفيش صورة جديدة
    const { data: currentCourse } = await supabase
        .from('courses')
        .select('thumbnail_url')
        .eq('id', courseId)
        .single()

    let newThumbnailUrl = currentCourse?.thumbnail_url || null

    // 2. لو المدرس رفع صورة جديدة
    if (thumbnailFile && thumbnailFile.size > 0) {
        const fileExt = thumbnailFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('thumbnails')
            .upload(fileName, thumbnailFile)

        if (!uploadError) {
            const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(fileName)
            newThumbnailUrl = urlData.publicUrl
        } else {
            return { error: 'حدث خطأ أثناء رفع الصورة الجديدة.' }
        }
    }

    // 3. تحديث الكورس
    const { error } = await supabase
        .from('courses')
        .update({
            title: title.trim(),
            description: description?.trim(),
            price: price,
            thumbnail_url: newThumbnailUrl,
        })
        .eq('id', courseId)
        .eq('instructor_id', user.id)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/courses/${courseId}`)
    revalidatePath('/dashboard')
    redirect(`/dashboard/courses/${courseId}`)
}