'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessageAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'يجب تسجيل الدخول' }

    const receiverId = formData.get('receiverId') as string
    const content = formData.get('content') as string

    if (!content || content.trim().length === 0) {
        return { error: 'لا يمكن إرسال رسالة فارغة' }
    }

    const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim()
    })

    if (error) return { error: 'حدث خطأ أثناء إرسال الرسالة' }

    // مش محتاجين revalidatePath هنا عشان الـ Realtime هيتكفل بالتحديث
    return { success: 'تم الإرسال' }
}