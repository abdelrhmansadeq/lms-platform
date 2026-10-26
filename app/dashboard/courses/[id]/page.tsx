import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { addLessonAction, togglePublishAction } from './actions'
// import Link from 'next/link'

// مكونات العميل (Client Components) المطلوبة للتفاعل
import { AddLessonForm } from './add-lesson-form'
import { PublishButton } from './publish-button'

// التعديل هنا: نوع الـ params بقى Promise
export default async function CourseManagePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()

    // التعديل هنا: لازم await للـ params الأول
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // جلب الكورس (استخدمنا id بدل params.id)
    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .eq('instructor_id', user.id)
        .single()

    if (!course) notFound()

    // جلب الدروس
    const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', course.id)
        .order('position', { ascending: true })

    return (
        <div className="space-y-8">
            {/* رأس الصفحة */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border">
                <div>
                    <h2 className="text-2xl font-bold">{course.title}</h2>
                    <p className="text-muted-foreground mt-1">{course.description}</p>
                </div>
                <div className="flex items-center gap-4">
          <span className={`text-sm px-3 py-1 rounded-full ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {course.is_published ? 'منشور للطلاب' : 'مسودة'}
          </span>
                    <PublishButton courseId={course.id} isPublished={course.is_published} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* قائمة الدروس */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-semibold border-b pb-2">الدروس ({lessons?.length || 0})</h3>
                    {lessons?.length === 0 ? (
                        <p className="text-muted-foreground text-sm">لم تقم بإضافة أي دروس لهذا الكورس بعد.</p>
                    ) : (
                        <div className="space-y-3">
                            {lessons?.map((lesson) => (
                                <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-zinc-950">
                                    <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {lesson.position}
                    </span>
                                        <div>
                                            <p className="font-medium">{lesson.title}</p>
                                            <p className="text-xs text-muted-foreground" dir="ltr">ID: {lesson.youtube_id}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* فورم إضافة درس */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>إضافة درس جديد</CardTitle>
                            <CardDescription>سيتم إضافة الدرس في نهاية القائمة.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AddLessonForm courseId={course.id} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}