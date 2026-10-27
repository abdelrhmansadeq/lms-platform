import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Plus, FileQuestion } from 'lucide-react'

export default async function QuizzesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: course } = await supabase.from('courses').select('title').eq('id', id).eq('instructor_id', user.id).single()
    if (!course) notFound()

    const { data: quizzes } = await supabase
        .from('quizzes')
        .select('id, title, created_at, questions(id)')
        .eq('course_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/dashboard/courses/${id}`}>
                    <Button variant="outline" size="icon"><ArrowRight className="w-4 h-4" /></Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold">اختبارات الكورس</h2>
                    <p className="text-muted-foreground">{course.title}</p>
                </div>
            </div>

            <div className="flex justify-between items-center border-b border-border pb-4">
                <h3 className="text-lg font-semibold">كل الاختبارات ({quizzes?.length || 0})</h3>
                <Link href={`/dashboard/courses/${id}/quizzes/new`}>
                    <Button className="gap-2"><Plus className="w-4 h-4" /> إضافة اختبار جديد</Button>
                </Link>
            </div>

            {(!quizzes || quizzes.length === 0) ? (
                <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
                    <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">لا توجد اختبارات</h3>
                    <p className="text-muted-foreground mb-6">أضف اختباراً لطلابك لتقييم مستواهم.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id} className="bg-card">
                            <CardHeader>
                                <CardTitle>{quiz.title}</CardTitle>
                                <CardDescription>
                                    عدد الأسئلة: {(quiz.questions as any)?.length || 0}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}