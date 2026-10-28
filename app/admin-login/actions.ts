'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function adminLoginAction(_prevState: { error?: string } | null, formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    // التحقق من المتغيرات السرية
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const cookieStore = await cookies()

        // بنكريت كوكي آمن جداً ومشفّر (httpOnly)
        cookieStore.set('admin_session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // صالح لمدة يوم كامل
            path: '/',
        })

        redirect('/admin') // التعديل هنا
    } else {
        return { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }
    }
}

export async function adminLogoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
    redirect('/admin-login')
}