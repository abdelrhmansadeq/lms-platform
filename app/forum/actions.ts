'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 1. دالة إنشاء موضوع جديد
export async function createPostAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const imageFile = formData.get('image') as File | null

    if (!title || title.trim().length < 5) {
        return { error: 'عنوان الموضوع مطلوب (5 أحرف على الأقل)' }
    }
    if (!content || content.trim().length < 10) {
        return { error: 'محتوى الموضوع مطلوب (10 أحرف على الأقل)' }
    }

    let imageUrl = null

    // لو فيه صورة مرفقة
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('forum-images')
            .upload(fileName, imageFile)

        if (uploadError) {
            return { error: 'حدث خطأ أثناء رفع الصورة. تأكد من أن حجمها معقول.' }
        }

        const { data: urlData } = supabase.storage.from('forum-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
    }

    // إضافة الموضوع في الداتابيز
    const { error } = await supabase.from('forum_posts').insert({
        author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl,
    })

    if (error) return { error: 'حدث خطأ أثناء إضافة الموضوع' }

    revalidatePath('/forum')
    redirect('/forum')
}

// 2. دالة الرد على موضوع
export async function createReplyAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

    const postId = formData.get('postId') as string
    const content = formData.get('content') as string

    if (!content || content.trim().length < 2) {
        return { error: 'الرد لا يمكن أن يكون فارغاً' }
    }

    const { error } = await supabase.from('forum_replies').insert({
        post_id: postId,
        author_id: user.id,
        content: content.trim(),
    })

    if (error) return { error: 'حدث خطأ أثناء إضافة الرد' }

    revalidatePath(`/forum/${postId}`)
    return { success: 'تم إضافة ردك بنجاح' }
}