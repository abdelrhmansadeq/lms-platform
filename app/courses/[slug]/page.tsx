/* eslint-disable @next/next/no-img-element */
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EnrollForm } from './enroll-form'
import { CheckCircle2, Lock } from 'lucide-react'

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

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6">
                    {course.thumbnail_url && (
                        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-border shadow-lg relative bg-muted">
                            <img
                                src={course.thumbnail_url}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div>
                        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                        <p className="text-muted-foreground text-lg whitespace-pre-wrap leading-relaxed">{course.description}</p>
                    </div>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle>محتوى الكورس</CardTitle>
                            <CardDescription>عدد الدروس: {lessons?.length || 0} درس</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!isEnrolled && (!lessons || lessons.length === 0) ? (
                                <div className="bg-muted/50 border border-border border-dashed p-8 text-center rounded-xl">
                                    <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground">محتوى الكورس محمي. يرجى الاشتراك بكود التفعيل لعرض الدروس.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lessons?.map((lesson) => (
                                        <div key={lesson.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-background hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full text-sm font-bold">
                          {lesson.position}
                        </span>
                                                <span className="font-medium">{lesson.title}</span>
                                            </div>
                                            {isEnrolled && (
                                                <Link href={`/learn/${course.slug}/${lesson.id}`}>
                                                    <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-white">مشاهدة</Button>
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="sticky top-24 bg-card border-border shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-center">
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
                                    <div className="bg-green-500/10 text-green-500 p-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
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