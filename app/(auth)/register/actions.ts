'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function registerAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as string || 'student'

    if (!email || !password || !fullName) {
        return { error: 'يرجى تعبئة جميع الحقول المطلوبة' }
    }

    if (password.length < 6) {
        return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
    }

    const supabase = await createClient()

    // إنشاء الحساب وتمرير الاسم والدور في الـ metadata عشان التريجر بتاعنا يقراهم
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    // لو كله تمام، نوجهه لصفحة تسجيل الدخول
    redirect('/login')
}