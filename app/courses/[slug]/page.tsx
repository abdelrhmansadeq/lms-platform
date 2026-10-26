import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EnrollForm } from './enroll-form'

export default async function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // جلب الكورس
    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (!course) notFound()

    // هل الطالب مشترك؟
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

    // جلب الدروس (بسبب الـ RLS، لو مش مشترك هترجع فاضية)
    const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', course.id)
        .order('position', { ascending: true })

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* تفاصيل الكورس */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                        <p className="text-muted-foreground text-lg">{course.description}</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>محتوى الكورس</CardTitle>
                            <CardDescription>عدد الدروس: {lessons?.length || 0} درس</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!isEnrolled && (!lessons || lessons.length === 0) ? (
                                <div className="bg-zinc-50 dark:bg-zinc-900 border border-dashed p-6 text-center rounded-lg">
                                    <p className="text-muted-foreground">🔒 محتوى الكورس محمي. يرجى الاشتراك بكود التفعيل لعرض الدروس.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lessons?.map((lesson) => (
                                        <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-md">
                                            <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs font-bold">
                          {lesson.position}
                        </span>
                                                <span className="font-medium">{lesson.title}</span>
                                            </div>
                                            {isEnrolled && (
                                                <Link href={`/learn/${course.slug}/${lesson.id}`}>
                                                    <Button size="sm" variant="outline">مشاهدة</Button>
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* صندوق الاشتراك */}
                <div>
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-2xl text-primary">
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
                                    <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm font-medium">
                                        أنت مشترك في هذا الكورس بالفعل ✅
                                    </div>
                                    <Button className="w-full" disabled>أنت مشترك</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground text-center">لديك كود تفعيل؟ أدخله هنا للاشتراك.</p>
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