import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlayCircle, CheckCircle2 } from 'lucide-react'
import { VideoPlayer } from './video-player' // هنعمل المكون ده تحت

export default async function LessonPlayerPage({
                                                   params
                                               }: {
    params: Promise<{ courseslug: string, lessonid: string }>
}) {
    const { courseslug, lessonid } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: course } = await supabase
        .from('courses')
        .select('id, title, slug')
        .eq('slug', courseslug)
        .single()

    if (!course) notFound()

    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', course.id)
        .single()

    if (!enrollment) redirect(`/courses/${courseslug}`)

    const { data: lesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonid)
        .eq('course_id', course.id)
        .single()

    if (!lesson) notFound()

    // جلب التقدم الحالي للطالب في الدرس ده
    const { data: progress } = await supabase
        .from('lesson_progress')
        .select('watched_seconds, is_completed')
        .eq('student_id', user.id)
        .eq('lesson_id', lesson.id)
        .single()

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <Link href={`/courses/${course.slug}`}>
                    <Button variant="ghost" className="gap-2 hover:bg-muted">
                        <ArrowRight className="w-4 h-4" />
                        العودة للكورس
                    </Button>
                </Link>
                <h1 className="text-xl font-bold line-clamp-1">{course.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* مشغل الفيديو التفاعلي */}
                    <VideoPlayer
                        youtubeId={lesson.youtube_id}
                        lessonId={lesson.id}
                        courseId={course.id}
                        initialProgress={progress?.watched_seconds || 0}
                    />

                    <div className="bg-card p-6 rounded-2xl border border-border">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <span className="text-primary flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">
                {lesson.position}
              </span>
                            {lesson.title}
                        </h2>
                        {progress?.is_completed && (
                            <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium mb-4 bg-emerald-500/10 p-2 rounded w-fit">
                                <CheckCircle2 className="w-4 h-4" />
                                لقد أكملت هذا الدرس
                            </div>
                        )}
                        <div className="prose dark:prose-invert max-w-none mt-4 text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {lesson.content || 'لا يوجد محتوى نصي مرفق مع هذا الدرس.'}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-card p-6 rounded-2xl border border-border sticky top-24 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-primary" />
                            أنت تشاهد الآن
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            الدرس {lesson.position} من كورس {course.title}. تأكد من تطبيق ما تعلمته عملياً.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}