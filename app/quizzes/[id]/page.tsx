import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { QuizClient } from './quiz-client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { startQuizAttemptAction } from './actions'

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

type QuestionData = {
    id: string;
    question_text: string;
    options: string[];
}

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: quizData } = await supabase
        .from('quizzes')
        .select(`id, title, duration_minutes, courses (id, slug, title)`)
        .eq('id', id)
        .single()

    if (!quizData) notFound()

    const quiz = quizData as unknown as QuizWithCourse;
    const course = quiz.courses;

    if (!course) notFound();

    const { data: questionsData, error: questionsError } = await supabase.rpc('get_quiz_questions', {
        p_quiz_id: quiz.id
    })

    if (questionsError) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold mb-4 text-red-400">غير مصرح لك بالدخول لهذا الاختبار</h2>
                <Link href={`/courses/${course.slug}`}><Button>العودة للكورس</Button></Link>
            </div>
        )
    }

    const questions = questionsData as QuestionData[]

    if (!questions || questions.length === 0) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold mb-4 text-white">هذا الاختبار لا يحتوي على أسئلة حتى الآن.</h2>
                <Link href={`/courses/${course.slug}`}><Button>العودة للكورس</Button></Link>
            </div>
        )
    }

    const attemptData = await startQuizAttemptAction(quiz.id, questions.length)

    if (attemptData.error) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold mb-4 text-red-400">{attemptData.error}</h2>
                <Link href={`/courses/${course.slug}`}><Button>العودة للكورس</Button></Link>
            </div>
        )
    }

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

            {/* التعديل هنا: شلنا quizId */}
            <QuizClient
                quizTitle={quiz.title}
                courseSlug={course.slug}
                questions={questions}
                durationMinutes={quiz.duration_minutes || 0}
                attemptId={attemptData.attemptId!}
                startedAt={attemptData.startedAt!}
            />
        </div>
    )
}