'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMessageAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'يجب تسجيل الدخول' }

    const receiverId = formData.get('receiverId') as string
    const content = formData.get('content') as string

    if (!content || content.trim().length === 0) {
        return { error: 'لا يمكن إرسال رسالة فارغة' }
    }

    if (receiverId === user.id) {
        return { error: 'لا يمكنك إرسال رسالة لنفسك' }
    }

    // 🛡️ الحماية الجديدة: التأكد إن فيه علاقة (كورس) بين الطرفين
    // الحالة 1: اللي بيبعت طالب، واللي بيستقبل مدرس. لازم الطالب يكون مشترك في كورس للمدرس ده.
    const { data: enrollmentAsStudent } = await supabase
        .from('enrollments')
        .select(`
      id,
      courses!inner (instructor_id)
    `)
        .eq('student_id', user.id)
        .eq('courses.instructor_id', receiverId)
        .maybeSingle()

    // الحالة 2: اللي بيبعت مدرس، واللي بيستقبل طالب. لازم الطالب يكون مشترك في كورس للمدرس ده.
    let isAuthorized = !!enrollmentAsStudent;

    if (!isAuthorized) {
        const { data: enrollmentAsInstructor } = await supabase
            .from('enrollments')
            .select(`
        id,
        courses!inner (instructor_id)
      `)
            .eq('student_id', receiverId)
            .eq('courses.instructor_id', user.id)
            .maybeSingle()

        isAuthorized = !!enrollmentAsInstructor;
    }

    // لو مفيش علاقة بينهم، نرفض الرسالة
    if (!isAuthorized) {
        return { error: 'غير مصرح لك بمراسلة هذا المستخدم. يجب أن تكون هناك علاقة كورس بينكما.' }
    }

    // لو عدى الحماية، نبعت الرسالة
    const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim()
    })

    if (error) return { error: 'حدث خطأ أثناء إرسال الرسالة' }

    return { success: 'تم الإرسال' }
}