'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// دالة مساعدة لاستخراج ID فيديو اليوتيوب من الرابط
function extractYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url.trim(); // لو المستخدم حط الـ ID مباشرة
}

export async function addLessonAction(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'غير مصرح لك' }

    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const youtubeUrlOrId = formData.get('youtube_id') as string

    if (!title || !youtubeUrlOrId) {
        return { error: 'العنوان ورابط اليوتيوب مطلوبان' }
    }

    // استخراج الـ ID
    const youtube_id = extractYouTubeId(youtubeUrlOrId)

    // التأكد إن الكورس ده تابع للمدرس الحالي (حماية إضافية فوق الـ RLS)
    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single()
    if (course?.instructor_id !== user.id) {
        return { error: 'غير مصرح لك بإضافة دروس لهذا الكورس' }
    }

    // تحديد ترتيب الدرس (آخر درس + 1)
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

export async function togglePublishAction(courseId: string, currentState: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    const { error } = await supabase
        .from('courses')
        .update({ is_published: !currentState })
        .eq('id', courseId)
        .eq('instructor_id', user.id) // حماية إضافية

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/courses/${courseId}`)
    revalidatePath('/dashboard')
    return { success: 'تم تحديث حالة الكورس' }
}