import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'

type QuizAttemptData = {
    id: string;
    score: number;
    total_questions: number;
    created_at: string;
    quizzes: { title: string; courses: { slug: string } | null } | null;
}

export default async function MyResultsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // جلب كل محاولات الطالب اللي سلمها
    const { data: attemptsData } = await supabase
        .from('quiz_attempts')
        .select(`
      id, score, total_questions, created_at,
      quizzes (
        title,
        courses ( slug )
      )
    `)
        .eq('student_id', user.id)
        .eq('is_submitted', true)
        .order('created_at', { ascending: false })

    const attempts = (attemptsData as unknown as QuizAttemptData[]) || []

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl relative animate-fade-up">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-emerald-400" />
                        سجل نتائجي
                    </h1>
                    <p className="text-slate-400 mt-2">هنا تجد كل الاختبارات التي قمت بحلها ودرجاتك فيها.</p>
                </div>
                <Link href="/profile">
                    <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
                        العودة للحساب
                    </Button>
                </Link>
            </div>

            {attempts.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
                    <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">لم تقم بحل أي اختبار بعد</h3>
                    <p className="text-slate-400 mb-6">تصفح كورساتك وابدأ باختبار مهاراتك.</p>
                    <Link href="/my-courses">
                        <Button className="bg-emerald-500 text-black font-bold hover:bg-emerald-400">الذهاب لكورساتي</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {attempts.map((attempt) => {
                        const percentage = Math.round((attempt.score / attempt.total_questions) * 100)
                        const isPassed = percentage >= 50

                        return (
                            <Card key={attempt.id} className="bg-white/[0.02] border-white/5 hover:border-emerald-500/30 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                                        {/* تفاصيل الاختبار */}
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{attempt.quizzes?.title || 'اختبار محذوف'}</h3>
                                            <p className="text-sm text-slate-400">
                                                {new Date(attempt.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>

                                        {/* النتيجة */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-sm text-slate-400 mb-1">الدرجة</p>
                                                <p className="font-bold text-lg text-white" dir="ltr">{attempt.score} / {attempt.total_questions}</p>
                                            </div>

                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold ${
                                                isPassed
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                <span dir="ltr">{percentage}%</span>
                                            </div>

                                            {/* زرار لو عايز يرجع للكورس */}
                                            {attempt.quizzes?.courses?.slug && (
                                                <Link href={`/courses/${attempt.quizzes.courses.slug}`}>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10">
                                                        <ArrowRight className="w-5 h-5" />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}