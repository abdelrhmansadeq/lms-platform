'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMessageAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'يجب تسجيل الدخول' }

    const receiverId = formData.get('receiverId') as string
    const courseId = formData.get('courseId') as string
    const content = formData.get('content') as string

    if (!content || content.trim().length === 0) return { error: 'لا يمكن إرسال رسالة فارغة' }
    if (receiverId === user.id) return { error: 'لا يمكنك إرسال رسالة لنفسك' }
    if (!courseId) return { error: 'خطأ في تحديد الكورس' }

    // 1. هل أنا طالب في الكورس ده، والمستقبل هو المدرس؟
    const { data: asStudent } = await supabase
        .from('enrollments')
        .select('id, courses!inner(id, instructor_id)')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .eq('courses.instructor_id', receiverId)
        .maybeSingle()

    // 2. هل أنا المدرس في الكورس ده، والمستقبل هو الطالب؟
    const { data: asInstructor } = await supabase
        .from('enrollments')
        .select('id, courses!inner(id, instructor_id)')
        .eq('student_id', receiverId)
        .eq('course_id', courseId)
        .eq('courses.instructor_id', user.id)
        .maybeSingle()

    if (!asStudent && !asInstructor) {
        return { error: 'غير مصرح لك بتبادل الرسائل في هذا الكورس.' }
    }

    // 3. إرسال الرسالة
    const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        course_id: courseId,
        content: content.trim()
    })

    if (error) return { error: 'حدث خطأ أثناء إرسال الرسالة' }

    return { success: 'تم الإرسال' }
}