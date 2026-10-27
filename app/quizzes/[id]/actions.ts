'use server'

import { createClient } from '@/lib/supabase/server'

type StudentAnswer = {
    questionId: string;
    selectedOption: number; // رقم الاختيار اللي الطالب اختاره
};

export async function submitQuizAction(quizId: string, answers: StudentAnswer[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

    // 1. جلب الأسئلة الصحيحة من الداتابيز
    const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('id, correct_option_index')
        .eq('quiz_id', quizId)

    if (qError || !questions) return { error: 'حدث خطأ في جلب الأسئلة' }

    // 2. حساب الدرجة
    let score = 0
    const totalQuestions = questions.length

    answers.forEach((answer) => {
        const question = questions.find(q => q.id === answer.questionId)
        // لو الطالب اختار الإجابة الصح، نزود درجته
        if (question && question.correct_option_index === answer.selectedOption) {
            score++
        }
    })

    // 3. حفظ النتيجة في الداتابيز
    const { error: insertError } = await supabase
        .from('quiz_attempts')
        .insert({
            quiz_id: quizId,
            student_id: user.id,
            score: score,
            total_questions: totalQuestions
        })

    if (insertError) return { error: 'حدث خطأ أثناء حفظ النتيجة' }

    // 4. إرجاع النتيجة للواجهة
    return {
        success: true,
        score,
        totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100)
    }
}