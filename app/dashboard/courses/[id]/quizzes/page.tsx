import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowRight, Plus, FileQuestion, BarChart3 } from 'lucide-react'

type QuizWithCounts = {
    id: string;
    title: string;
    created_at: string;
    questions: { id: string }[];
    quiz_attempts: { id: string }[];
}

export default async function QuizzesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: course } = await supabase.from('courses').select('title').eq('id', id).eq('instructor_id', user.id).single()
    if (!course) notFound()

    const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('id, title, created_at, questions(id), quiz_attempts(id)')
        .eq('course_id', id)
        .order('created_at', { ascending: false })

    const quizzes = (quizzesData as unknown as QuizWithCounts[]) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/dashboard/courses/${id}`}>
                    <Button variant="outline" size="icon"><ArrowRight className="w-4 h-4" /></Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-white">اختبارات الكورس</h2>
                    <p className="text-slate-400">{course.title}</p>
                </div>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-lg font-semibold text-white">كل الاختبارات ({quizzes?.length || 0})</h3>
                <Link href={`/dashboard/courses/${id}/quizzes/new`}>
                    <Button className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold"><Plus className="w-4 h-4" /> إضافة اختبار جديد</Button>
                </Link>
            </div>

            {(!quizzes || quizzes.length === 0) ? (
                <div className="text-center py-20 bg-white/2 rounded-xl border border-dashed border-white/10">
                    <FileQuestion className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-white">لا توجد اختبارات</h3>
                    <p className="text-slate-400 mb-6">أضف اختباراً لطلابك لتقييم مستواهم.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id} className="bg-white/2 border-white/5 flex flex-col justify-between">
                            <CardHeader>
                                <CardTitle className="text-white">{quiz.title}</CardTitle>
                                <CardDescription className="flex gap-4 mt-2 text-slate-400">
                                    <span>الأسئلة: {quiz.questions?.length || 0}</span>
                                    <span>المشاركات: {quiz.quiz_attempts?.length || 0}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-4 border-t border-white/5">
                                <Link href={`/dashboard/courses/${id}/quizzes/${quiz.id}/results`} className="w-full">
                                    <Button variant="outline" className="w-full gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10">
                                        <BarChart3 className="w-4 h-4" /> عرض نتائج الطلاب
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}