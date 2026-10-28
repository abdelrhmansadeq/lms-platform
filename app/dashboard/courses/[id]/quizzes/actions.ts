'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type QuestionData = {
    text: string;
    options: string[];
    correctIndex: number;
};

export async function createQuizAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'غير مصرح' }

    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string
    const durationMinutes = Number(formData.get('duration_minutes')) || 0
    const questionsJson = formData.get('questions') as string

    if (!title || title.trim().length < 3) {
        return { error: 'عنوان الاختبار مطلوب (3 أحرف على الأقل)' }
    }

    let questions: QuestionData[] = []
    try {
        questions = JSON.parse(questionsJson)
    } catch {
        return { error: 'حدث خطأ في قراءة الأسئلة' }
    }

    if (questions.length === 0) {
        return { error: 'يجب إضافة سؤال واحد على الأقل' }
    }

    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single()
    if (course?.instructor_id !== user.id) return { error: 'غير مصرح لك' }

    // 1. إنشاء الاختبار
    const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
            course_id: courseId,
            instructor_id: user.id,
            title: title.trim(),
            duration_minutes: durationMinutes
        })
        .select('id')
        .single()

    if (quizError || !quiz) return { error: 'حدث خطأ أثناء إنشاء الاختبار' }

    // 2. تجهيز الأسئلة وحفظها
    const questionsToInsert = questions.map((q) => ({
        quiz_id: quiz.id,
        question_text: q.text,
        options: q.options,
        position: 1
    }))

    // إضافة الإجابات في الجدول الجديد
    const { data: insertedQuestions, error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select('id')

    if (questionsError || !insertedQuestions) return { error: 'حدث خطأ أثناء حفظ الأسئلة' }

    // ربط الإجابات الصحيحة بالأسئلة اللي اتسجلت
    const answersToInsert = insertedQuestions.map((q, index) => ({
        question_id: q.id,
        correct_option_index: questions[index].correctIndex
    }))

    const { error: answersError } = await supabase
        .from('question_answers')
        .insert(answersToInsert)

    if (answersError) return { error: 'حدث خطأ أثناء حفظ الإجابات الصحيحة' }

    revalidatePath(`/dashboard/courses/${courseId}/quizzes`)
    redirect(`/dashboard/courses/${courseId}/quizzes`)
}