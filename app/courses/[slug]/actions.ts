'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. اشتراك بكود تفعيل (النسخة الآمنة)
export async function enrollAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'يجب تسجيل الدخول أولاً للاشتراك' }

    const code = formData.get('code') as string
    const courseId = formData.get('courseId') as string

    if (!code) return { error: 'يرجى إدخال كود التفعيل' }

    const cleanCode = code.trim().toUpperCase()

    // التعديل هنا: بنبعت بس الكورس والكود، والـ ID بياخده السيرفر من الجلسة
    const { data, error } = await supabase.rpc('enroll_with_code', {
        p_course_id: courseId,
        p_code: cleanCode
    })

    if (error) {
        console.error("RPC Error:", error)
        return { error: 'حدث خطأ في النظام، يرجى المحاولة لاحقاً' }
    }

    if (data.error) return { error: data.error }

    revalidatePath(`/courses/[slug]`, 'page')
    return { success: 'تم الاشتراك في الكورس بنجاح' }
}

// 2. إضافة أو تعديل تقييم (سيبها زي ما هي)
export async function submitReviewAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'يجب تسجيل الدخول' }

    const courseId = formData.get('courseId') as string
    const rating = Number(formData.get('rating'))
    const comment = formData.get('comment') as string

    if (!rating || rating < 1 || rating > 5) {
        return { error: 'يرجى اختيار تقييم من 1 إلى 5 نجوم' }
    }

    const { error } = await supabase
        .from('reviews')
        .upsert({
            course_id: courseId,
            student_id: user.id,
            rating,
            comment: comment?.trim(),
        }, {
            onConflict: 'student_id, course_id'
        })

    if (error) return { error: error.message }

    revalidatePath(`/courses/[slug]`, 'page')
    return { success: 'تم حفظ تقييمك بنجاح. شكراً لك!' }
}

// 3. الاشتراك في كورس مجاني (سيبها زي ما هي)
export async function enrollFreeCourseAction(courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

    const { data: course } = await supabase.from('courses').select('price').eq('id', courseId).single()
    if (!course || Number(course.price) > 0) {
        return { error: 'هذا الكورس غير مجاني، يرجى استخدام كود التفعيل.' }
    }

    const { error } = await supabase
        .from('enrollments')
        .insert({
            student_id: user.id,
            course_id: courseId
        })

    if (error) {
        if (error.code === '23505') {
            return { success: 'أنت مشترك بالفعل في هذا الكورس' }
        }
        return { error: 'حدث خطأ أثناء الاشتراك، حاول مرة أخرى' }
    }

    revalidatePath(`/courses/[slug]`, 'page')
    return { success: 'تم الاشتراك في الكورس بنجاح! استمتع بالتعلم.' }
}