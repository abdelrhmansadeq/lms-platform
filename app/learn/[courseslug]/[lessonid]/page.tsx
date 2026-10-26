import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlayCircle } from 'lucide-react'

export default async function LessonPlayerPage({
                                                   params
                                               }: {
    // التعديل هنا: خليت الأسماء مطابقة للمجلدات [courseslug] و [lessonid]
    params: Promise<{ courseslug: string, lessonid: string }>
}) {
    // قراءة القيم من الـ params
    const { courseslug, lessonid } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. جلب الكورس باستخدام courseslug
    const { data: course } = await supabase
        .from('courses')
        .select('id, title, slug')
        .eq('slug', courseslug)
        .single()

    if (!course) notFound()

    // 2. التأكد من أن الطالب مشترك في الكورس
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', course.id)
        .single()

    if (!enrollment) {
        redirect(`/courses/${courseslug}`)
    }

    // 3. جلب بيانات الدرس باستخدام lessonid
    const { data: lesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonid)
        .eq('course_id', course.id)
        .single()

    if (!lesson) notFound()

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* شريط التنقل العلوي */}
            <div className="flex items-center justify-between mb-6">
                <Link href={`/courses/${course.slug}`}>
                    <Button variant="ghost" className="gap-2">
                        <ArrowRight className="w-4 h-4" />
                        العودة للكورس
                    </Button>
                </Link>
                <h1 className="text-xl font-bold line-clamp-1">{course.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* مشغل الفيديو والمحتوى */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="aspect-video w-full rounded-xl overflow-hidden border bg-black shadow-lg relative">
                        <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${lesson.youtube_id}?rel=0&modestbranding=1&showinfo=0`}
                            title={lesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="text-primary flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">
                {lesson.position}
              </span>
                            {lesson.title}
                        </h2>
                        <div className="prose dark:prose-invert max-w-none mt-4 text-muted-foreground whitespace-pre-wrap">
                            {lesson.content || 'لا يوجد محتوى نصي مرفق مع هذا الدرس.'}
                        </div>
                    </div>
                </div>

                {/* القائمة الجانبية */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-xl border sticky top-24">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-primary" />
                            أنت تشاهد الآن
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            الدرس {lesson.position} من كورس {course.title}. تأكد من تطبيق ما تعلمته عملياً.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}