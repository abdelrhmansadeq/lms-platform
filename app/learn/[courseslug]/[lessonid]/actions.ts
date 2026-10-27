'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveProgressAction(lessonId: string, courseId: string, watchedSeconds: number, duration: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح' }

    // لو الطالب شاف 90% من الفيديو، نعتبره خلص
    const isCompleted = duration > 0 && (watchedSeconds / duration) >= 0.9

    const { error } = await supabase
        .from('lesson_progress')
        .upsert({
            student_id: user.id,
            lesson_id: lessonId,
            course_id: courseId,
            watched_seconds: Math.floor(watchedSeconds),
            is_completed: isCompleted,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'student_id, lesson_id'
        })

    if (error) return { error: error.message }
    return { success: true }
}