import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddLessonForm } from './add-lesson-form'
import { PublishButton } from './publish-button'
import { ActivationCodes } from './activation-codes'
import { DeleteLessonButton, DeleteCourseButton } from './delete-buttons'
import { AttachmentManager } from './attachment-manager'
import { EditLessonDialog } from './edit-lesson-dialog'

export default async function CourseManagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .eq('instructor_id', user.id)
        .single()

    if (!course) notFound()

    const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', course.id)
        .order('position', { ascending: true })

    // جلب المرفقات لكل دروس الكورس ده
    let allAttachments: any[] = []
    if (lessons && lessons.length > 0) {
        const lessonIds = lessons.map(l => l.id)
        const { data: attachments } = await supabase
            .from('lesson_attachments')
            .select('*')
            .in('lesson_id', lessonIds)

        if (attachments) allAttachments = attachments
    }

    const { data: activationCodes } = await supabase
        .from('activation_codes')
        .select('*')
        .eq('course_id', course.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            {/* رأس الصفحة */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-border">
                <div>
                    <h2 className="text-2xl font-bold">{course.title}</h2>
                    <p className="text-muted-foreground mt-1">{course.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full ${course.is_published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
            {course.is_published ? 'منشور للطلاب' : 'مسودة'}
          </span>
                    <Link href={`/dashboard/courses/${course.id}/edit`}>
                        <Button variant="outline" size="sm">تعديل الكورس</Button>
                    </Link>
                    <PublishButton courseId={course.id} isPublished={course.is_published} />
                    <DeleteCourseButton courseId={course.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* قائمة الدروس */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-semibold border-b border-border pb-2">الدروس ({lessons?.length || 0})</h3>
                    {lessons?.length === 0 ? (
                        <p className="text-muted-foreground text-sm">لم تقم بإضافة أي دروس لهذا الكورس بعد.</p>
                    ) : (
                        <div className="space-y-3">
                            {lessons?.map((lesson) => {
                                // فلترة المرفقات الخاصة بالدرس ده بس
                                const lessonAttachments = allAttachments.filter(a => a.lesson_id === lesson.id)

                                return (
                                    <div key={lesson.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-card hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                        {lesson.position}
                      </span>
                                            <div>
                                                <p className="font-medium line-clamp-1">{lesson.title}</p>
                                                <p className="text-xs text-muted-foreground" dir="ltr">ID: {lesson.youtube_id}</p>
                                            </div>
                                        </div>
                                        {/* أزرار التعديل والحذف والمرفقات */}
                                        <div className="flex items-center gap-1">
                                            <AttachmentManager
                                                lessonId={lesson.id}
                                                courseId={course.id}
                                                lessonTitle={lesson.title}
                                                initialAttachments={lessonAttachments}
                                            />
                                            <EditLessonDialog lesson={lesson} courseId={course.id} />
                                            <DeleteLessonButton lessonId={lesson.id} courseId={course.id} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* العمود الجانبي */}
                <div className="space-y-6">
                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle>إضافة درس جديد</CardTitle>
                            <CardDescription>سيتم إضافة الدرس في نهاية القائمة.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AddLessonForm courseId={course.id} />
                        </CardContent>
                    </Card>

                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle>الاختبارات</CardTitle>
                            <CardDescription>إدارة اختبارات الكورس وأسئلتها.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/dashboard/courses/${course.id}/quizzes`} className="w-full">
                                <Button className="w-full" variant="secondary">إدارة الاختبارات</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle>إدارة الاشتراكات</CardTitle>
                            <CardDescription>قم بتوليد أكواد لتفعيل الكورس للطلاب.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ActivationCodes courseId={course.id} initialCodes={activationCodes || []} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}