'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logoutAction() {
    const supabase = await createClient()

    // إنهاء الجلسة
    await supabase.auth.signOut()

    // توجيه المستخدم لصفحة تسجيل الدخول
    redirect('/login')
}