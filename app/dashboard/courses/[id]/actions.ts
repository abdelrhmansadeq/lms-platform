'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// دالة مساعدة لاستخراج ID فيديو اليوتيوب من الرابط
function extractYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url.trim(); // لو المستخدم حط الـ ID مباشرة
}

export async function addLessonAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
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

// دالة توليد كود تفعيل جديد
export async function generateActivationCodeAction(courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'غير مصرح' }

    // التأكد إن الكورس بتاع المدرس ده
    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single()
    if (course?.instructor_id !== user.id) {
        return { error: 'غير مصرح لك بتوليد أكواد لهذا الكورس' }
    }

    // توليد كود عشوائي آمن (مثال: ACT-A1B2C3)
    // بنستخدم الدالة العشوائية ونحولها لأرقام وحروف إنجليزية
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase()
    const newCode = `ACT-${randomString}`

    // حفظ الكود في قاعدة البيانات
    const { error } = await supabase.from('activation_codes').insert({
        code: newCode,
        course_id: courseId,
    })

    if (error) {
        // لو الكود اتكرر بالصدفة (احتمال ضعيف جدًا)
        return { error: 'حدث خطأ أثناء توليد الكود، حاول مرة أخرى' }
    }

    // تحديث الصفحة عشان الكود الجديد يظهر
    revalidatePath(`/dashboard/courses/${courseId}`)
    return { success: 'تم توليد الكود بنجاح' }
}