'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createCourseAction(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // التأكد من تسجيل الدخول
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'يجب تسجيل الدخول أولاً' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = Number(formData.get('price')) || 0

    if (!title || title.trim().length < 3) {
        return { error: 'عنوان الكورس مطلوب (3 أحرف على الأقل)' }
    }

    // توليد slug فريد تلقائياً (من العنوان + أرقام عشوائية لتجنب التكرار)
    const baseSlug = title.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/(^-|-$)+/g, '')
    const uniqueSuffix = Math.random().toString(36).substring(2, 6)
    const slug = `${baseSlug || 'course'}-${uniqueSuffix}`

    // إدخال الكورس في قاعدة البيانات
    const { error } = await supabase.from('courses').insert({
        instructor_id: user.id,
        title: title.trim(),
        description: description?.trim(),
        price: price,
        slug: slug,
        is_published: false, // مش هيظهر للطلاب غير لما ننشره
    })

    if (error) {
        return { error: error.message }
    }

    // تحديث كاش لوحة التحكم عشان الكورس الجديد يظهر
    revalidatePath('/dashboard')

    // التوجيه للوحة التحكم بعد النجاح
    redirect('/dashboard')
}