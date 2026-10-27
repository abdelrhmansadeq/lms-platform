import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, UserCircle2 } from 'lucide-react'
import { ExportCsvButton } from './export-button'

export default async function QuizResultsPage({ params }: { params: Promise<{ id: string, quizid: string }> }) {
    const { id, quizid } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: course } = await supabase.from('courses').select('title').eq('id', id).eq('instructor_id', user.id).single()
    if (!course) notFound()

    const { data: quiz } = await supabase.from('quizzes').select('title').eq('id', quizid).single()
    if (!quiz) notFound()

    const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select(`
      id, score, total_questions, created_at,
      profiles (full_name)
    `)
        .eq('quiz_id', quizid)
        .order('created_at', { ascending: false })

    // تجهيز البيانات للتصدير
    const exportData = (attempts || []).map((attempt: any) => ({
        name: attempt.profiles?.full_name || 'طالب مجهول',
        score: attempt.score,
        total: attempt.total_questions,
        percentage: Math.round((attempt.score / attempt.total_questions) * 100),
        date: new Date(attempt.created_at).toLocaleDateString('ar-EG')
    }))

    return (
        <div className="space-y-6 max-w-4xl mx-auto relative animate-fade-up">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/courses/${id}/quizzes`}>
                        <Button variant="outline" size="icon" className="bg-white/5 border-white/10 hover:bg-white/10"><ArrowRight className="w-4 h-4" /></Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-white">نتائج الطلاب</h2>
                        <p className="text-slate-400 text-sm">{quiz.title} - {course.title}</p>
                    </div>
                </div>

                {/* زرار التصدير */}
                <ExportCsvButton data={exportData} quizTitle={quiz.title} />
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
                {(!attempts || attempts.length === 0) ? (
                    <div className="p-16 text-center text-slate-400">
                        <UserCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>لم يقم أي طالب بتقديم هذا الاختبار حتى الآن.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-white/5 text-slate-300 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 font-bold">اسم الطالب</th>
                                <th className="px-6 py-4 font-bold">الدرجة</th>
                                <th className="px-6 py-4 font-bold">النسبة المئوية</th>
                                <th className="px-6 py-4 font-bold">التاريخ</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                            {attempts.map((attempt: any) => {
                                const percentage = Math.round((attempt.score / attempt.total_questions) * 100)
                                return (
                                    <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3 font-medium text-slate-200">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">
                                                {attempt.profiles?.full_name?.charAt(0) || 'ط'}
                                            </div>
                                            {attempt.profiles?.full_name || 'طالب'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300" dir="ltr">
                                            {attempt.score} / {attempt.total_questions}
                                        </td>
                                        <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${percentage >= 50 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {percentage}%
                        </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">
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