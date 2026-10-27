'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// دالة مساعدة لاستخراج ID فيديو اليوتيوب
function extractYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url.trim();
}

// 1. إضافة درس
export async function addLessonAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'غير مصرح لك' }

    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const youtubeUrlOrId = formData.get('youtube_id') as string

    if (!title || !youtubeUrlOrId) return { error: 'العنوان ورابط اليوتيوب مطلوبان' }

    const youtube_id = extractYouTubeId(youtubeUrlOrId)

    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single()
    if (course?.instructor_id !== user.id) return { error: 'غير مصرح لك بإضافة دروس لهذا الكورس' }

    const { count } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', courseId)
    const position = (count || 0) + 1

    const { error } = await supabase.from('lessons').insert({
        course_id: courseId,
        title,
        content,
        youtube_id,
        position
    })

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/courses/${courseId}`)
    return { success: 'تم إضافة الدرس بنجاح' }
}

// 2. نشر / إلغاء نشر الكورس
export async function togglePublishAction(courseId: string, currentState: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    const { error } = await supabase
        .from('courses')
        .update({ is_published: !currentState })
        .eq('id', courseId)
        .eq('instructor_id', user.id)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/courses/${courseId}`)
    revalidatePath('/dashboard')
    return { success: 'تم تحديث حالة الكورس' }
}

// 3. حذف درس
export async function deleteLessonAction(lessonId: string, courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single()
    if (course?.instructor_id !== user.id) return { error: 'غير مصرح لك' }

    const { error } = await supabase.from('lessons').delete().eq('id', lessonId)

    if (error) return { error: 'حدث خطأ أثناء حذف الدرس' }

    revalidatePath(`/dashboard/courses/${courseId}`)
    return { success: 'تم حذف الدرس بنجاح' }
}

// 4. حذف كورس
export async function deleteCourseAction(courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    const { error } = await supabase.from('courses').delete().eq('id', courseId).eq('instructor_id', user.id)

    if (error) return { error: 'حدث خطأ أثناء حذف الكورس' }

    revalidatePath('/dashboard')
    return { success: 'تم حذف الكورس بنجاح' }
}

// 5. توليد كود تفعيل
export async function generateActivationCodeAction(courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'غير مصرح' }

    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single()
    if (course?.instructor_id !== user.id) return { error: 'غير مصرح لك بتوليد أكواد لهذا الكورس' }

    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase()
    const newCode = `ACT-${randomString}`

    const { error } = await supabase.from('activation_codes').insert({
        code: newCode,
        course_id: courseId,
    })

    if (error) return { error: 'حدث خطأ أثناء توليد الكود، حاول مرة أخرى' }

    revalidatePath(`/dashboard/courses/${courseId}`)
    return { success: 'تم توليد الكود بنجاح' }
}

// 6. تعديل درس
export async function updateLessonAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    const lessonId = formData.get('lessonId') as string
    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const youtubeUrlOrId = formData.get('youtube_id') as string

    if (!title || !youtubeUrlOrId) return { error: 'العنوان ورابط اليوتيوب مطلوبان' }

    const youtube_id = extractYouTubeId(youtubeUrlOrId);

    const { error } = await supabase
        .from('lessons')
        .update({ title, content, youtube_id })
        .eq('id', lessonId)
        .eq('course_id', courseId)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/courses/${courseId}`)
    return { success: 'تم تعديل الدرس بنجاح' }
}

// 7. إضافة مرفق لدرس (مع عنوان)
export async function addAttachmentAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    const lessonId = formData.get('lessonId') as string
    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string // <--- استقبال العنوان
    const file = formData.get('file') as File | null

    if (!title || title.trim().length < 2) return { error: 'يرجى كتابة اسم للمرفق (حرفين على الأقل)' }
    if (!file || file.size === 0) return { error: 'يرجى اختيار ملف أولاً' }
    if (file.size > 10 * 1024 * 1024) return { error: 'حجم الملف يجب أن يكون أقل من 10 ميجابايت' }

    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single()
    if (course?.instructor_id !== user.id) return { error: 'غير مصرح لك' }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('lesson-files')
        .upload(fileName, file)

    if (uploadError) return { error: 'حدث خطأ أثناء رفع الملف' }

    const { data: urlData } = supabase.storage.from('lesson-files').getPublicUrl(fileName)

    // حفظ المرفق مع العنوان في الداتابيز
    const { error: dbError } = await supabase.from('lesson_attachments').insert({
        lesson_id: lessonId,
        title: title.trim(), // <--- حفظنا العنوان
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type
    })

    if (dbError) return { error: 'حدث خطأ أثناء حفظ بيانات الملف' }

    revalidatePath(`/dashboard/courses/${courseId}`)
    return { success: 'تم إضافة المرفق بنجاح' }
}

// 8. حذف مرفق
export async function deleteAttachmentAction(attachmentId: string, courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single()
    if (course?.instructor_id !== user.id) return { error: 'غير مصرح لك' }

    const { error } = await supabase.from('lesson_attachments').delete().eq('id', attachmentId)

    if (error) return { error: 'حدث خطأ أثناء حذف المرفق' }

    revalidatePath(`/dashboard/courses/${courseId}`)
    return { success: 'تم حذف المرفق بنجاح' }
}