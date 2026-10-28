'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// دالة مساعدة للتأكد إن اللي بيعمل الأكشن ده أدمن
async function verifyAdmin(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role === 'admin'
}

// 1. تغيير حالة الحظر (Ban/Unban)
export async function toggleBanUserAction(userId: string, currentBanState: boolean) {
    const supabase = await createClient()

    if (!(await verifyAdmin(supabase))) {
        return { error: 'غير مصرح. هذه العملية للمشرف العام فقط.' }
    }

    // منع الأدمن من حظر نفسه
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id === userId) return { error: 'لا يمكنك حظر حسابك الشخصي' }

    const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentBanState })
        .eq('id', userId)

    if (error) return { error: 'حدث خطأ أثناء تنفيذ العملية' }

    revalidatePath('/admin/users')
    return { success: currentBanState ? 'تم إلغاء حظر المستخدم' : 'تم حظر المستخدم بنجاح' }
}

// 2. تغيير رتبة المستخدم (ترقية طالب لمدرس أو العكس)
export async function changeUserRoleAction(userId: string, newRole: string) {
    const supabase = await createClient()

    if (!(await verifyAdmin(supabase))) {
        return { error: 'غير مصرح. هذه العملية للمشرف العام فقط.' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id === userId) return { error: 'لا يمكنك تغيير رتبتك الخاصة' }

    if (!['student', 'instructor', 'admin'].includes(newRole)) {
        return { error: 'رتبة غير صالحة' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

    if (error) return { error: 'حدث خطأ أثناء تغيير الرتبة' }

    revalidatePath('/admin/users')
    return { success: 'تم تغيير رتبة المستخدم بنجاح' }
}