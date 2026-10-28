'use server'

import { createClient } from '@/lib/supabase/server'

type StudentAnswer = {
    questionId: string;
    selectedOption: number;
};

export async function startQuizAttemptAction(quizId: string, totalQuestions: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'يجب تسجيل الدخول' }

    // البحث عن محاولة سابقة لم تسلم
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

    // إنشاء محاولة جديدة
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

export async function submitQuizAction(attemptId: string, quizId: string, answers: StudentAnswer[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

    const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('id, correct_option_index')
        .eq('quiz_id', quizId)

    if (qError || !questions) return { error: 'حدث خطأ في جلب الأسئلة' }

    let score = 0
    const totalQuestions = questions.length

    answers.forEach((answer) => {
        const question = questions.find(q => q.id === answer.questionId)
        if (question && question.correct_option_index === answer.selectedOption) {
            score++
        }
    })

    // تحديث المحاولة بدل إنشاء واحدة جديدة
    const { error: updateError } = await supabase
        .from('quiz_attempts')
        .update({
            score: score,
            is_submitted: true
        })
        .eq('id', attemptId)
        .eq('student_id', user.id) // حماية إضافية

    if (updateError) return { error: 'حدث خطأ أثناء حفظ النتيجة' }

    return {
        success: true,
        score,
        totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100)
    }
}