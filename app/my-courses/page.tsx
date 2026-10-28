import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Sparkles } from 'lucide-react'
import { WishlistButton } from '@/components/wishlist-button'

type CourseData = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
    price: number;
};

type EnrollmentData = {
    course_id: string;
    courses: CourseData | null;
};

type CourseWithProgress = CourseData & {
    progressPercent: number;
};

export default async function MyCoursesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. جلب الكورسات المشترك فيها
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
      course_id,
      courses (
        id, title, slug, description, thumbnail_url, price
      )
    `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false })

    const coursesWithProgress: CourseWithProgress[] = []

    if (enrollments && enrollments.length > 0) {
        for (const enrollment of (enrollments as unknown as EnrollmentData[])) {
            const course = enrollment.courses
            if (!course) continue

            const { count: totalLessons } = await supabase
                .from('lessons')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', course.id)

            const { count: completedLessons } = await supabase
                .from('lesson_progress')
                .select('*', { count: 'exact', head: true })
                .eq('student_id', user.id)
                .eq('course_id', course.id)
                .eq('is_completed', true)

            const progressPercent = totalLessons && totalLessons > 0
                ? Math.round(((completedLessons || 0) / totalLessons) * 100)
                : 0

            coursesWithProgress.push({
                ...course,
                progressPercent
            })
        }
    }

    // 2. جلب كورسات مقترحة (لو مفيش كورسات)
    let suggestedCourses: CourseData[] = []
    if (coursesWithProgress.length === 0) {
        const { data: suggested } = await supabase
            .from('courses')
            .select('id, title, slug, description, thumbnail_url, price')
            .eq('is_published', true)
            .limit(3)

        suggestedCourses = (suggested as unknown as CourseData[]) || []
    }

    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-5xl relative">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="mb-10 animate-fade-up border-b border-white/5 pb-6">
                <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-emerald-400" />
                    كورساتي
                </h1>
                <p className="text-slate-400">هنا تجد جميع الكورسات التي قمت بالاشتراك فيها.</p>
            </div>

            {coursesWithProgress.length === 0 ? (
                <div className="space-y-12">
                    {/* الحالة الفاضية */}
                    <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-white/5 animate-fade-in backdrop-blur-sm">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2 text-white">لم تشترك في أي كورس بعد</h3>
                        <p className="text-slate-400 mb-8">تصفح الكورسات المتاحة وابدأ رحلتك التعليمية الآن.</p>
                        <Link href="/">
                            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)]">تصفح الكورسات</Button>
                        </Link>
                    </div>

                    {/* الكورسات المقترحة */}
                    {suggestedCourses.length > 0 && (
                        <div className="animate-fade-up delay-200">
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-6 h-6 text-emerald-400" />
                                <h2 className="text-2xl font-bold text-white">مقترح لك</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {suggestedCourses.map((course, index) => (
                                    <Link
                                        href={`/courses/${course.slug}`}
                                        key={course.id}
                                        className="group block bg-white/2 rounded-3xl overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="relative h-40 w-full bg-slate-800 border-b border-white/5 overflow-hidden">
                                            {course.thumbnail_url ? (
                                                <Image src={course.thumbnail_url} alt={course.title} fill placeholder="blur" blurDataURL={blurDataURL} className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-slate-500 text-xs">لا توجد صورة</div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] to-transparent opacity-80" />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold mb-2 line-clamp-1 text-white group-hover:text-emerald-400 transition-colors">{course.title}</h3>
                                            <p className="text-sm text-slate-400 line-clamp-2 min-h-[40px] mb-4">{course.description?.replace(/<[^>]*>?/gm, '')}</p>
                                            <div className="text-lg font-bold text-emerald-400">
                                                {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coursesWithProgress.map((course, index) => (
                        <Card
                            key={course.id}
                            className="flex flex-col bg-white/[0.02] border-white/5 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-2 group animate-fade-up overflow-hidden rounded-3xl"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative h-40 w-full bg-slate-800 overflow-hidden">
                                {course.thumbnail_url ? (
                                    <Image src={course.thumbnail_url} alt={course.title} fill placeholder="blur" blurDataURL={blurDataURL} className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm">لا توجد صورة</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] to-transparent opacity-80" />
                            </div>

                            <CardHeader className="pb-2 relative z-10">
                                <CardTitle className="line-clamp-1 group-hover:text-emerald-400 transition-colors text-white">{course.title}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-2 min-h-10 text-slate-400">
                                    {course.description?.replace(/<[^>]*>?/gm, '')}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 pb-4 relative z-10">
                                <div className="flex justify-between items-center mb-2 text-xs font-bold">
                                    <span className="text-slate-400">نسبة الإنجاز</span>
                                    <span className="text-emerald-400">{course.progressPercent}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-500" style={{ width: `${course.progressPercent}%` }} />
                                </div>
                            </CardContent>

                            <CardFooter className="pt-4 border-t border-white/5 relative z-10 bg-black/20">
                                <Link href={`/courses/${course.slug}`} className="w-full">
                                    <Button className="w-full bg-white/5 text-white hover:bg-emerald-500 hover:text-black transition-all border border-white/10 hover:border-emerald-500 font-bold">
                                        {course.progressPercent === 100 ? 'مراجعة الكورس' : 'متابعة التعلم'}
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