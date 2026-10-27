'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// تعليم إشعار واحد كمقروء
export async function markAsReadAction(notificationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

    revalidatePath('/', 'layout')
}

// تعليم كل الإشعارات كمقروءة
export async function markAllAsReadAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)

    revalidatePath('/', 'layout')
}