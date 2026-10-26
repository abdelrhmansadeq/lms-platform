'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
    }

    // لو كله تمام، نوجهه للصفحة الرئيسية (هنغيرها للداشبورد بعدين)
    redirect('/')
}