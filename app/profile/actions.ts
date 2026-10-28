'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'غير مصرح' }

    const fullName = formData.get('full_name') as string
    const bio = formData.get('bio') as string
    const avatarFile = formData.get('avatar_file') as File | null

    if (!fullName || fullName.trim().length < 3) {
        return { error: 'الاسم مطلوب (3 أحرف على الأقل)' }
    }

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

    let newAvatarUrl = currentProfile?.avatar_url || null

    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile)

        if (!uploadError) {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
            newAvatarUrl = urlData.publicUrl

            // 🛡️ مسح الصورة القديمة
            if (currentProfile?.avatar_url) {
                const oldFileName = currentProfile.avatar_url.split('/').pop()
                if (oldFileName) {
                    await supabase.storage.from('avatars').remove([oldFileName])
                }
            }
        } else {
            return { error: 'حدث خطأ أثناء رفع الصورة' }
        }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName.trim(),
            bio: bio?.trim() || null,
            avatar_url: newAvatarUrl
        })
        .eq('id', user.id)

    if (error) return { error: 'حدث خطأ أثناء تحديث البيانات' }

    revalidatePath('/profile')
    revalidatePath('/', 'layout')

    return { success: 'تم تحديث بياناتك بنجاح' }
}