'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE, safeEqual, signAdminToken } from '@/lib/admin/auth'

export async function adminLoginAction(_prevState: { error?: string } | null, formData: FormData) {
    const username = String(formData.get('username') ?? '')
    const password = String(formData.get('password') ?? '')

    const okUser = safeEqual(username, process.env.ADMIN_USERNAME!)
    const okPass = safeEqual(password, process.env.ADMIN_PASSWORD!)

    if (!(okUser && okPass)) {
        return { error: 'بيانات الدخول غير صحيحة' }
    }

    const cookieStore = await cookies()
    cookieStore.set(ADMIN_COOKIE, signAdminToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // ساعة واحدة
        path: '/',
    })

    redirect('/admin')
}

export async function adminLogoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete(ADMIN_COOKIE)
    redirect('/admin-login')
}