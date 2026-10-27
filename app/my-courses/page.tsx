import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// تعريف الأنواع (Types) بدل any
type CourseData = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
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

    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
      course_id,
      courses (
        id, title, slug, description, thumbnail_url
      )
    `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false })

    // استخدمنا const بدل let
    const coursesWithProgress: CourseWithProgress[] = []

    if (enrollments && enrollments.length > 0) {
        // عملنا Casting للنوع عشان نتجنب any
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

    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-5xl">
            <div className="mb-8 animate-fade-up">
                <h1 className="text-3xl font-bold mb-2">كورساتي</h1>
                <p className="text-muted-foreground">هنا تجد جميع الكورسات التي قمت بالاشتراك فيها.</p>
            </div>

            {(!coursesWithProgress || coursesWithProgress.length === 0) ? (
                <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border animate-fade-in">
                    <h3 className="text-xl font-semibold mb-2">لم تشترك في أي كورس بعد</h3>
                    <p className="text-muted-foreground mb-6">تصفح الكورسات المتاحة وابدأ رحلتك التعليمية الآن.</p>
                    <Link href="/">
                        <Button>تصفح الكورسات</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coursesWithProgress.map((course, index) => (
                        <Card
                            key={course.id}
                            className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden bg-card border-border group animate-fade-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative h-40 w-full bg-muted border-b border-border overflow-hidden">
                                {course.thumbnail_url ? (
                                    <Image src={course.thumbnail_url} alt={course.title} fill placeholder="blur" blurDataURL={blurDataURL} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">لا توجد صورة</div>
                                )}
                            </div>

                            <CardHeader className="pb-2">
                                <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">{course.title}</CardTitle>
                                {/* هنا صلحنا min-h-[40px] لـ min-h-10 */}
                                <CardDescription className="line-clamp-2 mt-2 min-h-10">
                                    {course.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 pb-4">
                                <div className="flex justify-between items-center mb-2 text-xs font-medium">
                                    <span className="text-muted-foreground">نسبة الإنجاز</span>
                                    <span className="text-primary">{course.progressPercent}%</span>
                                </div>
                                <Progress value={course.progressPercent} className="h-2" />
                            </CardContent>

                            <CardFooter className="pt-4 border-t border-border">
                                <Link href={`/courses/${course.slug}`} className="w-full">
                                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all">
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