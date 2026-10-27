import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, UserCircle2 } from 'lucide-react'

export default async function QuizResultsPage({ params }: { params: Promise<{ id: string, quizid: string }> }) {
    const { id, quizid } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // التأكد إن المدرس صاحب الكورس
    const { data: course } = await supabase.from('courses').select('title').eq('id', id).eq('instructor_id', user.id).single()
    if (!course) notFound()

    // جلب بيانات الاختبار
    const { data: quiz } = await supabase.from('quizzes').select('title').eq('id', quizid).single()
    if (!quiz) notFound()

    // جلب محاولات الطلاب مع أسمائهم
    const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select(`
      id, score, total_questions, created_at,
      profiles (full_name)
    `)
        .eq('quiz_id', quizid)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/dashboard/courses/${id}/quizzes`}>
                    <Button variant="outline" size="icon"><ArrowRight className="w-4 h-4" /></Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold">نتائج الطلاب</h2>
                    <p className="text-muted-foreground">{quiz.title} - {course.title}</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                {(!attempts || attempts.length === 0) ? (
                    <div className="p-12 text-center text-muted-foreground">
                        لم يقم أي طالب بتقديم هذا الاختبار حتى الآن.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-medium">اسم الطالب</th>
                                <th className="px-6 py-4 font-medium">الدرجة</th>
                                <th className="px-6 py-4 font-medium">النسبة المئوية</th>
                                <th className="px-6 py-4 font-medium">التاريخ</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                            {attempts.map((attempt: any) => {
                                const percentage = Math.round((attempt.score / attempt.total_questions) * 100)
                                return (
                                    <tr key={attempt.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-2 font-medium">
                                            <UserCircle2 className="w-5 h-5 text-muted-foreground" />
                                            {attempt.profiles?.full_name || 'طالب'}
                                        </td>
                                        <td className="px-6 py-4" dir="ltr">
                                            {attempt.score} / {attempt.total_questions}
                                        </td>
                                        <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full font-bold ${percentage >= 50 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {percentage}%
                        </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs">
                                            {new Date(attempt.created_at).toLocaleString('ar-EG')}
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}