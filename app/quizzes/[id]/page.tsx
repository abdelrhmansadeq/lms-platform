import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { QuizClient } from './quiz-client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { startQuizAttemptAction } from './actions' // <--- ضفنا ده عشان نبدأ المحاولة

type QuizWithCourse = {
    id: string;
    title: string;
    duration_minutes: number;
    courses: {
        id: string;
        slug: string;
        title: string;
    } | null;
};

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. جلب بيانات الاختبار
    const { data: quizData } = await supabase
        .from('quizzes')
        .select(`
      id, title, duration_minutes,
      courses (id, slug, title)
    `)
        .eq('id', id)
        .single()

    if (!quizData) notFound()

    const quiz = quizData as unknown as QuizWithCourse;
    const course = quiz.courses;

    if (!course) notFound();

    // 2. التأكد إن الطالب مشترك في الكورس
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', course.id)
        .single()

    if (!enrollment) {
        redirect(`/courses/${course.slug}`)
    }

    // 3. جلب الأسئلة
    const { data: questions } = await supabase
        .from('questions')
        .select('id, question_text, options')
        .eq('quiz_id', quiz.id)

    if (!questions || questions.length === 0) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold mb-4 text-white">هذا الاختبار لا يحتوي على أسئلة حتى الآن.</h2>
                <Link href={`/courses/${course.slug}`}><Button>العودة للكورس</Button></Link>
            </div>
        )
    }

    // 4. بدء المحاولة (تسجيل وقت البدء في الداتابيز)
    const attemptData = await startQuizAttemptAction(quiz.id, questions.length)

    if (attemptData.error) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold mb-4 text-red-400">{attemptData.error}</h2>
                <Link href={`/courses/${course.slug}`}><Button>العودة للكورس</Button></Link>
            </div>
        )
    }

    const attemptId = attemptData.attemptId!
    const startedAt = attemptData.startedAt!

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-3xl">
            <div className="mb-6 animate-fade-up">
                <Link href={`/courses/${course.slug}`}>
                    <Button variant="ghost" className="gap-2 hover:bg-muted text-slate-400 hover:text-white">
                        <ArrowRight className="w-4 h-4" />
                        العودة للكورس
                    </Button>
                </Link>
            </div>

            <QuizClient
                quizId={quiz.id}
                quizTitle={quiz.title}
                courseSlug={course.slug}
                questions={questions}
                durationMinutes={quiz.duration_minutes || 0}
                attemptId={attemptId} // <--- بنمرر الـ ID
                startedAt={startedAt} // <--- بنمرر وقت البدء
            />
        </div>
    )
}