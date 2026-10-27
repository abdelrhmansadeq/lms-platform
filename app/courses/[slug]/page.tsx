import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { EnrollForm } from './enroll-form'
import { ReviewForm } from './review-form'
import { StarRating } from '@/components/star-rating'
import { CheckCircle2, Lock, PlayCircle, UserCircle2, FileQuestion, ArrowLeft, BookOpen, Clock } from 'lucide-react'

type ReviewWithProfile = {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    student_id: string;
    profiles: { full_name: string | null; } | null;
};

type QuizData = { id: string; title: string; };

type CourseWithInstructor = {
    id: string;
    instructor_id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
    price: number;
    is_published: boolean;
    profiles: { full_name: string | null; } | null;
};

export default async function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: courseData } = await supabase
        .from('courses')
        .select(`*, profiles (full_name)`)
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (!courseData) notFound()
    const course = courseData as unknown as CourseWithInstructor

    let isEnrolled = false
    if (user) {
        const { data: enrollment } = await supabase
            .from('enrollments').select('id').eq('student_id', user.id).eq('course_id', course.id).single()
        if (enrollment) isEnrolled = true
    }

    const { data: lessons } = await supabase.from('lessons').select('*').eq('course_id', course.id).order('position', { ascending: true })
    const { data: quizzesData } = await supabase.from('quizzes').select('id, title').eq('course_id', course.id).order('created_at', { ascending: true })
    const quizzes = quizzesData as QuizData[] || []

    const { data: reviews } = await supabase
        .from('reviews')
        .select(`id, rating, comment, created_at, student_id, profiles (full_name)`)
        .eq('course_id', course.id)
        .order('created_at', { ascending: false })

    const typedReviews = (reviews as unknown as ReviewWithProfile[]) || []
    const reviewsCount = typedReviews.length
    const avgRating = reviewsCount > 0 ? (typedReviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewsCount).toFixed(1) : 0
    const myReview = user ? typedReviews.find(r => r.student_id === user.id) : null

    let completedLessonIds: string[] = []
    let courseProgress = 0

    if (isEnrolled && user && lessons) {
        const { data: progress } = await supabase
            .from('lesson_progress').select('lesson_id, is_completed').eq('student_id', user.id).eq('course_id', course.id).eq('is_completed', true)

        if (progress) {
            completedLessonIds = progress.map(p => p.lesson_id)
            if (lessons.length > 0) courseProgress = Math.round((completedLessonIds.length / lessons.length) * 100)
        }
    }

    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-6xl relative">

            {/* Glow في الخلفية */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                <div className="lg:col-span-2 space-y-8 animate-fade-up">

                    {/* صورة الغلاف */}
                    {course.thumbnail_url && (
                        <div className="w-full h-64 md:h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-slate-800 group">
                            <Image src={course.thumbnail_url} alt={course.title} fill priority placeholder="blur" blurDataURL={blurDataURL} className="object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />
                            <div className="absolute bottom-6 right-6 left-6">
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">{course.title}</h1>
                                <div className="flex flex-wrap items-center gap-4">
                                    <Link href={`/instructors/${course.instructor_id}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                                        <UserCircle2 className="w-4 h-4" />
                                        بواسطة: <span className="font-semibold text-white">{course.profiles?.full_name || 'مدرس'}</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* التفاصيل */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl font-bold text-emerald-400">{avgRating}</span>
                            <StarRating initialRating={Number(avgRating)} readonly size="md" />
                            <span className="text-sm text-slate-400 font-medium">({reviewsCount} تقييم)</span>
                        </div>
                        <p className="text-slate-400 text-lg whitespace-pre-wrap leading-relaxed">{course.description}</p>
                    </div>

                    {/* محتوى الكورس */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-sm animate-fade-up delay-100">
                        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-2xl font-bold flex items-center gap-2 text-white"><BookOpen className="w-6 h-6 text-emerald-400"/> محتوى الكورس</h3>
                                <span className="text-sm font-medium bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">{lessons?.length || 0} درس</span>
                            </div>
                            {isEnrolled && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm font-bold mb-2 text-white">
                                        <span>إنجازك</span>
                                        <span className="text-emerald-400">{courseProgress}%</span>
                                    </div>
                                    <Progress value={courseProgress} className="h-2 bg-white/10" />
                                </div>
                            )}
                        </div>

                        <div className="p-2">
                            {!isEnrolled && (!lessons || lessons.length === 0) ? (
                                <div className="bg-white/5 border border-white/10 border-dashed p-10 text-center rounded-2xl m-4">
                                    <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-400 text-lg">محتوى الكورس محمي. يرجى الاشتراك لعرض الدروس.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {lessons?.map((lesson, index) => {
                                        const isCompleted = completedLessonIds.includes(lesson.id)
                                        return (
                                            <div key={lesson.id} className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.04] transition-all duration-200 border border-transparent hover:border-white/10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-[#0B0F17] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 transition-colors">
                                                        {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <span className="text-sm font-bold text-slate-400 group-hover:text-emerald-400">{lesson.position}</span>}
                                                    </div>
                                                    <div>
                                                        <span className={`font-semibold text-lg block ${isCompleted ? 'text-slate-500' : 'text-slate-200'}`}>{lesson.title}</span>
                                                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3"/> فيديو تعليمي</span>
                                                    </div>
                                                </div>
                                                {isEnrolled && (
                                                    <Link href={`/learn/${course.slug}/${lesson.id}`}>
                                                        <Button size="sm" variant={isCompleted ? "ghost" : "secondary"} className={`gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${!isCompleted && 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black'}`}>
                                                            <PlayCircle className="w-4 h-4" />
                                                            {isCompleted ? 'مراجعة' : 'ابدأ'}
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* الاختبارات */}
                        {isEnrolled && quizzes.length > 0 && (
                            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                                <h4 className="font-bold text-xl mb-4 flex items-center gap-2 text-white"><FileQuestion className="w-5 h-5 text-emerald-400"/> اختبارات الكورس</h4>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {quizzes.map((quiz) => (
                                        <div key={quiz.id} className="flex flex-col justify-between p-5 border border-white/5 rounded-2xl bg-white/[0.02] hover:border-emerald-500/30 transition-colors shadow-sm">
                                            <span className="font-bold text-lg mb-4 text-slate-200">{quiz.title}</span>
                                            <Link href={`/quizzes/${quiz.id}`}>
                                                <Button size="sm" className="w-full gap-2 bg-white/5 hover:bg-emerald-500 text-white hover:text-black transition-colors border border-white/10 hover:border-emerald-500">
                                                    بدء الاختبار <ArrowLeft className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* التقييمات */}
                    <div className="pt-8 animate-fade-up delay-200" id="reviews">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white"><StarRating initialRating={0} readonly size="sm"/> تقييمات الطلاب</h3>

                        {isEnrolled && <div className="mb-8"><ReviewForm courseId={course.id} existingReview={myReview} /></div>}

                        <div className="grid gap-4 sm:grid-cols-2">
                            {typedReviews.length > 0 ? (
                                typedReviews.map((review) => (
                                    <div key={review.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                                                    {review.profiles?.full_name?.charAt(0) || 'ط'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-200">{review.profiles?.full_name || 'طالب'}</p>
                                                    <p className="text-[10px] text-slate-500">{new Date(review.created_at).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                            </div>
                                            <StarRating initialRating={review.rating} readonly size="sm" />
                                        </div>
                                        {review.comment && <p className="text-sm text-slate-400 leading-relaxed">{review.comment}</p>}
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">
                                    <p className="text-slate-500">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* صندوق الاشتراك (Glassmorphism) */}
                <div className="animate-fade-up delay-200">
                    <div className="sticky top-24">
                        <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                            <div className="bg-gradient-to-b from-emerald-500/10 to-transparent p-8 text-center border-b border-white/5">
                                <p className="text-sm font-medium text-slate-400 mb-2">سعر الكورس</p>
                                <CardTitle className="text-5xl font-extrabold text-white tracking-tight">
                                    {course.price === 0 ? 'مجاني' : `${course.price}`}
                                    {course.price !== 0 && <span className="text-2xl text-slate-400"> ج.م</span>}
                                </CardTitle>
                            </div>

                            <CardContent className="p-6 space-y-4">
                                {!user ? (
                                    <div className="text-center space-y-4">
                                        <p className="text-sm text-slate-400">سجل دخولك أولاً للاشتراك في الكورس.</p>
                                        <Link href="/login"><Button className="w-full h-12 text-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold">تسجيل الدخول</Button></Link>
                                    </div>
                                ) : isEnrolled ? (
                                    <div className="text-center space-y-4">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" /> أنت مشترك في هذا الكورس
                                        </div>
                                        <Button className="w-full h-12 text-lg bg-white/5 border border-white/10 text-white hover:bg-white/10" disabled>أنت مشترك بالفعل</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-400 text-center mb-4">لديك كود تفعيل؟ أدخله هنا.</p>
                                        <EnrollForm courseId={course.id} />
                                    </div>
                                )}

                                <div className="pt-4 space-y-3 text-sm text-slate-400">
                                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> وصول كامل مدى الحياة</p>
                                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> شهادة إتمام (قريباً)</p>
                                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> دعم فني ومجتمع تفاعلي</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}