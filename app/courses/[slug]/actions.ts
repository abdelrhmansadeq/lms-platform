'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enrollAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'يجب تسجيل الدخول أولاً للاشتراك' }
    }

    const code = formData.get('code') as string
    const courseId = formData.get('courseId') as string

    if (!code) {
        return { error: 'يرجى إدخال كود التفعيل' }
    }

    // تحويل الكود لحروف كبيرة وإزالة المسافات الزائدة
    const cleanCode = code.trim().toUpperCase()

    // استدعاء دالة قاعدة البيانات اللي عملناها
    const { data, error } = await supabase.rpc('enroll_with_code', {
        p_student_id: user.id,
        p_course_id: courseId,
        p_code: cleanCode // بنبعت الكود النظيف هنا
    })

    if (error) {
        console.error("RPC Error:", error)
        return { error: 'حدث خطأ في النظام، يرجى المحاولة لاحقاً' }
    }

    if (data.error) {
        return { error: data.error }
    }

    // تحديث الصفحة عشان تظهر الدروس
    revalidatePath(`/courses/[slug]`, 'page')
    return { success: data.success }
}