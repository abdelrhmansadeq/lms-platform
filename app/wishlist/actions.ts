'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWishlistAction(courseId: string, isCurrentlyWishlisted: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'يجب تسجيل الدخول أولاً لإضافة الكورسات للمفضلة' }
    }

    if (isCurrentlyWishlisted) {
        // إزالة من المفضلة
        const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('student_id', user.id)
            .eq('course_id', courseId)

        if (error) return { error: 'حدث خطأ أثناء الإزالة من المفضلة' }

        revalidatePath('/wishlist')
        revalidatePath('/')
        revalidatePath(`/courses/[slug]`, 'page')
        return { success: 'تم الإزالة من المفضلة' }

    } else {
        // إضافة للمفضلة
        const { error } = await supabase
            .from('wishlists')
            .insert({
                student_id: user.id,
                course_id: courseId
            })

        if (error) return { error: 'حدث خطأ أثناء الإضافة للمفضلة' }

        revalidatePath('/wishlist')
        revalidatePath('/')
        revalidatePath(`/courses/[slug]`, 'page')
        return { success: 'تم الإضافة للمفضلة بنجاح' }
    }
}