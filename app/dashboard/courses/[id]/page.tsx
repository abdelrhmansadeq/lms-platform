import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddLessonForm } from './add-lesson-form'
import { PublishButton } from './publish-button'
import { ActivationCodes } from './activation-codes'
import { DeleteCourseButton } from './delete-buttons'
import { SortableLessonsList } from './sortable-lessons'
import { BookOpen, FileQuestion, Edit, ClipboardList } from 'lucide-react'

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
        <div className="space-y-8 relative">

            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* رأس الصفحة */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-sm animate-fade-up">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
                    <p className="text-slate-400 text-sm">{course.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${course.is_published ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
            {course.is_published ? 'منشور للطلاب' : 'مسودة'}
          </span>

                    <Link href={`/dashboard/courses/${course.id}/edit`}>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
                            <Edit className="w-4 h-4 ml-2" /> تعديل
                        </Button>
                    </Link>

                    <PublishButton courseId={course.id} isPublished={course.is_published} />
                    <DeleteCourseButton courseId={course.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* قائمة الدروس */}
                <div className="lg:col-span-2 space-y-4 animate-fade-up delay-100">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-emerald-400" />
                            الدروس ({lessons?.length || 0})
                        </h3>
                    </div>

                    {lessons?.length === 0 ? (
                        <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
                            <p className="text-slate-400">لم تقم بإضافة أي دروس لهذا الكورس بعد.</p>
                        </div>
                    ) : (
                        <SortableLessonsList
                            initialLessons={lessons as any || []}
                            courseId={course.id}
                            allAttachments={allAttachments as any || []}
                        />
                    )}
                </div>

                {/* العمود الجانبي */}
                <div className="space-y-6 animate-fade-up delay-200">
                    <Card className="bg-white/[0.02] border-white/5 shadow-sm rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-white">إضافة درس جديد</CardTitle>
                            <CardDescription className="text-slate-400">سيتم إضافة الدرس في نهاية القائمة.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AddLessonForm courseId={course.id} />
                        </CardContent>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/5 shadow-sm rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileQuestion className="w-5 h-5 text-emerald-400" />
                                الاختبارات
                            </CardTitle>
                            <CardDescription className="text-slate-400">إدارة اختبارات الكورس وأسئلتها.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/dashboard/courses/${course.id}/quizzes`} className="w-full">
                                <Button className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                                    إدارة الاختبارات
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/5 shadow-sm rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-emerald-400" />
                                إدارة الاشتراكات
                            </CardTitle>
                            <CardDescription className="text-slate-400">قم بتوليد أكواد لتفعيل الكورس للطلاب.</CardDescription>
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