import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlayCircle, CheckCircle2, Paperclip, Download, FileText, Image as ImageIcon, File } from 'lucide-react'
import { VideoPlayer } from './video-player'
import { CommentsSection } from './comments-section'

// تعريف الأنواع
type AttachmentData = {
    id: string;
    lesson_id: string;
    title: string | null;
    file_name: string;
    file_url: string;
    file_type: string;
}

type CommentWithProfile = {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    // ضفنا avatar_url هنا
    profiles: { full_name: string | null; avatar_url: string | null; } | null;
}

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

    // جلب الدرس التالي
    const { data: nextLesson } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('course_id', course.id)
        .gt('position', lesson.position)
        .order('position', { ascending: true })
        .limit(1)
        .single()

    const { data: progress } = await supabase
        .from('lesson_progress')
        .select('watched_seconds, is_completed')
        .eq('student_id', user.id)
        .eq('lesson_id', lesson.id)
        .single()

    const { data: attachmentsData } = await supabase
        .from('lesson_attachments')
        .select('*')
        .eq('lesson_id', lesson.id)
        .order('created_at', { ascending: true })

    const attachments = (attachmentsData as unknown as AttachmentData[]) || []

    // جلب التعليقات مع أسماء وأصور أصحابها
    const { data: commentsData } = await supabase
        .from('lesson_comments')
        .select(`
      id, content, created_at, user_id,
      profiles (full_name, avatar_url)
    `)
        .eq('lesson_id', lesson.id)
        .order('created_at', { ascending: false })

    const comments = (commentsData as unknown as CommentWithProfile[]) || []

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />
        if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
        return <File className="w-5 h-5 text-emerald-500" />
    }

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-5xl relative">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-200 h-75 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="flex items-center justify-between mb-6 animate-fade-up">
                <Link href={`/courses/${course.slug}`}>
                    <Button variant="ghost" className="gap-2 hover:bg-white/5 text-slate-300 hover:text-white">
                        <ArrowRight className="w-4 h-4" />
                        العودة للكورس
                    </Button>
                </Link>
                <h1 className="text-xl font-bold line-clamp-1 text-white">{course.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6 animate-fade-up delay-100">

                    <VideoPlayer
                        youtubeId={lesson.youtube_id}
                        lessonId={lesson.id}
                        courseId={course.id}
                        initialProgress={progress?.watched_seconds || 0}
                        nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
                        courseSlug={course.slug}
                    />

                    <div className="bg-white/2 p-6 md:p-8 rounded-3xl border border-white/5">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-white">
              <span className="text-emerald-400 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm">
                {lesson.position}
              </span>
                            {lesson.title}
                        </h2>

                        {progress?.is_completed && (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-4 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl w-fit">
                                <CheckCircle2 className="w-4 h-4" />
                                لقد أكملت هذا الدرس
                            </div>
                        )}

                        <div className="prose dark:prose-invert max-w-none mt-4 text-slate-400 whitespace-pre-wrap leading-relaxed">
                            {lesson.content || 'لا يوجد محتوى نصي مرفق مع هذا الدرس.'}
                        </div>

                        {/* المرفقات */}
                        {attachments.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-white/5">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                                    <Paperclip className="w-5 h-5 text-emerald-400" />
                                    مرفقات الدرس
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {attachments.map((file) => (
                                        <a
                                            key={file.id}
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {getFileIcon(file.file_type)}
                                                <div className="flex flex-col truncate">
                          <span className="text-sm font-bold truncate text-slate-200" title={file.title || file.file_name}>
                            {file.title || file.file_name}
                          </span>
                                                    <span className="text-[10px] text-slate-500 truncate max-w-37.5" dir="ltr">
                            {file.file_name}
                          </span>
                                                </div>
                                            </div>
                                            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <CommentsSection
                            lessonId={lesson.id}
                            initialComments={comments}
                            currentUserId={user.id}
                        />
                    </div>
                </div>

                <div className="lg:col-span-1 animate-fade-up delay-200">
                    <div className="bg-white/2 p-6 rounded-3xl border border-white/5 sticky top-24 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
                            <PlayCircle className="w-5 h-5 text-emerald-400" />
                            أنت تشاهد الآن
                        </h3>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                            الدرس {lesson.position} من كورس {course.title}. تأكد من تطبيق ما تعلمته عملياً.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}