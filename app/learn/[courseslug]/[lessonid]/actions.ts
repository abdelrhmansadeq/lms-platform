'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. دالة حفظ تقدم الفيديو (مع إضافة شارة الخريج)
export async function saveProgressAction(lessonId: string, courseId: string, watchedSeconds: number, duration: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

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

    // 🌟 منطق منح شارة "خريج" لما يخلص الكورس كله
    if (isCompleted) {
        // 1. عدد دروس الكورس
        const { count: totalLessons } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId)

        // 2. عدد الدروس اللي الطالب خلصها
        const { count: completedLessons } = await supabase
            .from('lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', user.id)
            .eq('course_id', courseId)
            .eq('is_completed', true)

        // 3. لو خلص كل الدروس
        if (totalLessons && completedLessons && totalLessons === completedLessons) {
            // بنجيب شارة الخريج
            const { data: badge } = await supabase
                .from('badges')
                .select('id')
                .eq('name', 'خريج')
                .single()

            if (badge) {
                // بنديها للطالب (لو معندوش الشارة دي قبل كده)
                const { error: badgeError } = await supabase.from('user_badges').insert({
                    user_id: user.id,
                    badge_id: badge.id
                })

                // لو مكنش معاه الشارة، نبعتله إشعار
                if (!badgeError) {
                    await supabase.from('notifications').insert({
                        user_id: user.id,
                        title: 'إنجاز جديد! 🏆',
                        message: 'مبروك! لقد حصلت على شارة "خريج" لإتمامك الكورس بالكامل.',
                        link: '/profile'
                    })
                }
            }
        }
    }
    // --------------------------------------------------

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

// 4. إضافة ملاحظة جديدة (Video Note)
export async function addLessonNoteAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'يجب تسجيل الدخول' }

    const lessonId = formData.get('lessonId') as string
    const content = formData.get('content') as string
    const timestampSeconds = Number(formData.get('timestampSeconds'))

    if (!content || content.trim().length < 2) {
        return { error: 'الملاحظة لا يمكن أن تكون فارغة' }
    }

    const { error } = await supabase.from('lesson_notes').insert({
        user_id: user.id,
        lesson_id: lessonId,
        content: content.trim(),
        timestamp_seconds: timestampSeconds
    })

    if (error) return { error: 'حدث خطأ أثناء إضافة الملاحظة' }

    revalidatePath(`/learn/[courseslug]/[lessonid]`, 'page')
    return { success: 'تم إضافة الملاحظة بنجاح' }
}

// 5. حذف ملاحظة
export async function deleteLessonNoteAction(noteId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    const { error } = await supabase
        .from('lesson_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id)

    if (error) return { error: 'حدث خطأ أثناء حذف الملاحظة' }

    revalidatePath(`/learn/[courseslug]/[lessonid]`, 'page')
    return { success: 'تم حذف الملاحظة' }
}