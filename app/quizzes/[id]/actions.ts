'use server'

import { createClient } from '@/lib/supabase/server'

type StudentAnswer = {
    questionId: string;
    selectedOption: number;
};

export async function startQuizAttemptAction(quizId: string, totalQuestions: number) {
    // ... (سيب الدالة دي زي ما هي من غير تعديل) ...
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'يجب تسجيل الدخول' }

    const { data: existingAttempt } = await supabase
        .from('quiz_attempts')
        .select('id, started_at')
        .eq('quiz_id', quizId)
        .eq('student_id', user.id)
        .eq('is_submitted', false)
        .maybeSingle()

    if (existingAttempt) {
        return { attemptId: existingAttempt.id, startedAt: existingAttempt.started_at }
    }

    const { data: newAttempt, error } = await supabase
        .from('quiz_attempts')
        .insert({
            quiz_id: quizId,
            student_id: user.id,
            score: 0,
            total_questions: totalQuestions,
            is_submitted: false,
            started_at: new Date().toISOString()
        })
        .select('id, started_at')
        .single()

    if (error || !newAttempt) return { error: 'حدث خطأ في بدء الاختبار' }

    return { attemptId: newAttempt.id, startedAt: newAttempt.started_at }
}

// التعديل هنا: استخدام الـ RPC الآمنة
export async function submitQuizAction(attemptId: string, answers: StudentAnswer[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

    // تحويل شكل البيانات للي الـ RPC مستنياها
    const formattedAnswers = answers.map(ans => ({
        question_id: ans.questionId,
        option_index: ans.selectedOption
    }))

    const { data, error } = await supabase.rpc('submit_quiz', {
        p_attempt_id: attemptId,
        p_answers: formattedAnswers
    })

    if (error) return { error: 'حدث خطأ في النظام أثناء التصحيح' }
    if (data.error) return { error: data.error }

    return {
        success: true,
        score: data.score,
        totalQuestions: data.total,
        percentage: Math.round((data.score / data.total) * 100)
    }
}