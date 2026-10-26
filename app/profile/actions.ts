'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'غير مصرح' }

    const fullName = formData.get('full_name') as string

    if (!fullName || fullName.trim().length < 3) {
        return { error: 'الاسم مطلوب (3 أحرف على الأقل)' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', user.id)

    if (error) return { error: 'حدث خطأ أثناء تحديث البيانات' }

    // تحديث الكاش عشان الاسم الجديد يظهر في الـ Navbar فورًا
    revalidatePath('/profile')
    revalidatePath('/', 'layout')

    return { success: 'تم تحديث بياناتك بنجاح' }
}