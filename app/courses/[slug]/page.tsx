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
import { CheckCircle2, Lock, PlayCircle, UserCircle2 } from 'lucide-react'

// التعديل هنا: تعريف نوع للتقييم بدل any
type ReviewWithProfile = {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    student_id: string;
    profiles: {
        full_name: string | null;
    } | null;
};

export default async function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (!course) notFound()

    let isEnrolled = false
    if (user) {
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('student_id', user.id)
            .eq('course_id', course.id)
            .single()
        if (enrollment) isEnrolled = true
    }

    const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', course.id)
        .order('position', { ascending: true })

    // جلب التقييمات (ضفنا student_id هنا عشان نعرف تقييم الطالب الحالي)
    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
      id, rating, comment, created_at, student_id,
      profiles (full_name)
    `)
        .eq('course_id', course.id)
        .order('created_at', { ascending: false })

    // التعديل هنا: بنحول البيانات للنوع اللي عرفناه فوق
    const typedReviews = (reviews as unknown as ReviewWithProfile[]) || []
    const reviewsCount = typedReviews.length
    const avgRating = reviewsCount > 0
        ? (typedReviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewsCount).toFixed(1)
        : 0

    // هل الطالب ده قيّم الكورس قبل كده؟
    const myReview = user ? typedReviews.find(r => r.student_id === user.id) : null

    let completedLessonIds: string[] = []
    let courseProgress = 0

    if (isEnrolled && user && lessons) {
        const { data: progress } = await supabase
            .from('lesson_progress')
            .select('lesson_id, is_completed')
            .eq('student_id', user.id)
            .eq('course_id', course.id)
            .eq('is_completed', true)

        if (progress) {
            completedLessonIds = progress.map(p => p.lesson_id)
            if (lessons.length > 0) {
                courseProgress = Math.round((completedLessonIds.length / lessons.length) * 100)
            }
        }
    }

    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6 animate-fade-up">
                    {course.thumbnail_url && (
                        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-border shadow-lg relative bg-muted">
                            <Image src={course.thumbnail_url} alt={course.title} fill priority placeholder="blur" blurDataURL={blurDataURL} className="object-cover" />
                        </div>
                    )}

                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>

                        {/* عرض متوسط التقييم */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-yellow-500 font-bold text-lg">{avgRating}</span>
                            <StarRating initialRating={Number(avgRating)} readonly size="sm" />
                            <span className="text-sm text-muted-foreground">({reviewsCount} تقييم)</span>
                        </div>

                        <p className="text-muted-foreground text-lg whitespace-pre-wrap leading-relaxed">{course.description}</p>
                    </div>

                    <Card className="bg-card border-border shadow-sm animate-fade-up delay-100">
                        <CardHeader>
                            <CardTitle>محتوى الكورس</CardTitle>
                            <CardDescription className="flex justify-between items-center">
                                <span>عدد الدروس: {lessons?.length || 0} درس</span>
                                {isEnrolled && (
                                    <span className="font-bold text-primary">إنجازك: {courseProgress}%</span>
                                )}
                            </CardDescription>
                            {isEnrolled && (
                                <div className="pt-2"><Progress value={courseProgress} className="h-2" /></div>
                            )}
                        </CardHeader>
                        <CardContent>
                            {!isEnrolled && (!lessons || lessons.length === 0) ? (
                                <div className="bg-muted/50 border border-border border-dashed p-8 text-center rounded-xl">
                                    <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground">محتوى الكورس محمي. يرجى الاشتراك بكود التفعيل لعرض الدروس.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lessons?.map((lesson, index) => {
                                        const isCompleted = completedLessonIds.includes(lesson.id)
                                        return (
                                            <div key={lesson.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-background hover:bg-muted/50 transition-colors animate-fade-up" style={{ animationDelay: `${(index + 2) * 50}ms` }}>
                                                <div className="flex items-center gap-3">
                                                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full text-sm font-bold">{lesson.position}</span>}
                                                    <span className={`font-medium ${isCompleted ? 'text-muted-foreground line-through' : ''}`}>{lesson.title}</span>
                                                </div>
                                                {isEnrolled && (
                                                    <Link href={`/learn/${course.slug}/${lesson.id}`}>
                                                        <Button size="sm" variant={isCompleted ? "secondary" : "outline"} className={`gap-2 ${!isCompleted && 'border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground'}`}>
                                                            <PlayCircle className="w-4 h-4" />
                                                            {isCompleted ? 'مراجعة' : 'مشاهدة'}
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* قسم التقييمات */}
                    <div className="pt-6 animate-fade-up delay-200" id="reviews">
                        <h3 className="text-2xl font-bold mb-6">تقييمات الطلاب</h3>

                        {isEnrolled && (
                            <div className="mb-8">
                                <ReviewForm courseId={course.id} existingReview={myReview} />
                            </div>
                        )}

                        <div className="space-y-4">
                            {typedReviews.length > 0 ? (
                                typedReviews.map((review) => (
                                    <div key={review.id} className="p-4 bg-card border border-border rounded-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <UserCircle2 className="w-8 h-8 text-muted-foreground" />
                                                <div>
                                                    <p className="font-semibold text-sm">{review.profiles?.full_name || 'طالب مجهول'}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(review.created_at).toLocaleDateString('ar-EG')}
                                                    </p>
                                                </div>
                                            </div>
                                            <StarRating initialRating={review.rating} readonly size="sm" />
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-muted-foreground mt-3">{review.comment}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-6 bg-muted/20 rounded-xl border border-dashed">
                                    لا توجد تقييمات لهذا الكورس بعد. كن أول من يقيّمه!
                                </p>
                            )}
                        </div>
                    </div>

                </div>

                <div className="animate-fade-up delay-200">
                    <Card className="sticky top-24 bg-card border-border shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-center text-primary">
                                {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!user ? (
                                <div className="text-center space-y-4">
                                    <p className="text-sm text-muted-foreground">سجل دخولك أولاً للاشتراك في الكورس.</p>
                                    <Link href="/login"><Button className="w-full">تسجيل الدخول</Button></Link>
                                </div>
                            ) : isEnrolled ? (
                                <div className="text-center space-y-4">
                                    <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        أنت مشترك في هذا الكورس
                                    </div>
                                    <Button className="w-full" disabled>أنت مشترك بالفعل</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground text-center mb-2">لديك كود تفعيل؟ أدخله هنا للاشتراك.</p>
                                    <EnrollForm courseId={course.id} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}