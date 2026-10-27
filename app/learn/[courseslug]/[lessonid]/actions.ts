'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. دالة حفظ تقدم الفيديو (القديمة)
export async function saveProgressAction(lessonId: string, courseId: string, watchedSeconds: number, duration: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    // لو الطالب شاف 90% من الفيديو، نعتبره خلص
    const isCompleted = duration > 0 && (watchedSeconds / duration) >= 0.9

    const { error } = await supabase
        .from('lesson_progress')
        .upsert({
            student_id: user.id,
            lesson_id: lessonId,
            course_id: courseId,
            watched_seconds: Math.floor(watchedSeconds),
            is_completed: isCompleted,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'student_id, lesson_id'
        })

    if (error) return { error: error.message }
    return { success: true }
}

// 2. إضافة تعليق جديد للدرس (Q&A)
export async function addLessonCommentAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'يجب تسجيل الدخول' }

    const lessonId = formData.get('lessonId') as string
    const content = formData.get('content') as string

    if (!content || content.trim().length < 2) {
        return { error: 'التعليق لا يمكن أن يكون فارغاً' }
    }

    const { error } = await supabase.from('lesson_comments').insert({
        lesson_id: lessonId,
        user_id: user.id,
        content: content.trim()
    })

    if (error) return { error: 'حدث خطأ أثناء إضافة التعليق' }

    revalidatePath(`/learn/[courseslug]/[lessonid]`, 'page')
    return { success: 'تم إضافة تعليقك بنجاح' }
}

// 3. حذف تعليق
export async function deleteLessonCommentAction(commentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    const { error } = await supabase
        .from('lesson_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id)

    if (error) return { error: 'حدث خطأ أثناء حذف التعليق' }

    revalidatePath(`/learn/[courseslug]/[lessonid]`, 'page')
    return { success: 'تم حذف التعليق' }
}