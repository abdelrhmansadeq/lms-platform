/* eslint-disable @next/next/no-img-element */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type EnrollmentWithCourse = {
    course_id: string;
    courses: {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        thumbnail_url: string | null; // ضفنا الصورة هنا
    } | null;
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

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">كورساتي</h1>
                <p className="text-muted-foreground">هنا تجد جميع الكورسات التي قمت بالاشتراك فيها.</p>
            </div>

            {(!enrollments || enrollments.length === 0) ? (
                <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                    <h3 className="text-xl font-semibold mb-2">لم تشترك في أي كورس بعد</h3>
                    <p className="text-muted-foreground mb-6">تصفح الكورسات المتاحة وابدأ رحلتك التعليمية الآن.</p>
                    <Link href="/">
                        <Button>تصفح الكورسات</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(enrollments as unknown as EnrollmentWithCourse[]).map((enrollment) => {
                        const course = enrollment.courses
                        if (!course) return null

                        return (
                            <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
                                {/* صورة الكورس */}
                                <div className="relative h-40 w-full bg-zinc-100 dark:bg-zinc-800 border-b">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">لا توجد صورة</div>
                                    )}
                                </div>

                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2 min-h-10">
                                        {course.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardFooter className="pt-4 border-t">
                                    <Link href={`/courses/${course.slug}`} className="w-full">
                                        <Button className="w-full">متابعة التعلم</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}