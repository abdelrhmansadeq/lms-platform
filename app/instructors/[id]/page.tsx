import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { UserCircle2, BookOpen } from 'lucide-react'

type InstructorProfile = {
    full_name: string | null;
    bio: string | null;
    role: string;
}

type CourseData = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
    price: number;
}

export default async function InstructorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, role')
        .eq('id', id)
        .single()

    if (!profile || profile.role !== 'instructor') notFound()

    const instructor = profile as InstructorProfile

    const { data: courses } = await supabase
        .from('courses')
        .select('id, title, slug, description, thumbnail_url, price')
        .eq('instructor_id', id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    const instructorCourses = (courses as CourseData[]) || []
    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-5xl">

            <div className="bg-white/2 border border-white/5 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm animate-fade-up">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border-4 border-background shadow-lg">
          <span className="text-6xl font-bold font-serif">
            {instructor.full_name?.charAt(0) || <UserCircle2 className="w-20 h-20" />}
          </span>
                </div>

                <div className="flex-1 text-center md:text-right">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">{instructor.full_name}</h1>
                    <p className="text-emerald-400 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                        <BookOpen className="w-5 h-5" />
                        مدرس في منصة LMS
                    </p>
                    <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {instructor.bio || 'لم يقم هذا المدرس بإضافة نبذة عنه بعد.'}
                    </p>
                </div>
            </div>

            <div className="mb-8 flex justify-between items-center border-b border-white/5 pb-4 animate-fade-up delay-100">
                <h2 className="text-2xl font-bold text-white">كورسات المدرس</h2>
                <span className="text-sm text-slate-300 bg-white/5 px-3 py-1 rounded-full">{instructorCourses.length} كورس</span>
            </div>

            {instructorCourses.length === 0 ? (
                <div className="text-center py-20 bg-white/2 rounded-xl border border-dashed border-white/10">
                    <p className="text-slate-400">هذا المدرس لم يقم بنشر أي كورسات حتى الآن.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {instructorCourses.map((course, index) => (
                        <Link
                            href={`/courses/${course.slug}`}
                            key={course.id}
                            className="group block bg-white/2 rounded-xl overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 animate-fade-up"
                            style={{ animationDelay: `${(index + 2) * 100}ms` }}
                        >
                            <div className="relative h-40 w-full bg-muted border-b border-white/5 overflow-hidden">
                                {course.thumbnail_url ? (
                                    <Image src={course.thumbnail_url} alt={course.title} fill placeholder="blur" blurDataURL={blurDataURL} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-slate-500 text-xs">لا توجد صورة</div>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-white group-hover:text-emerald-400 transition-colors duration-300">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-slate-400 line-clamp-2 min-h-10 mb-4">
                                    {course.description?.replace(/<[^>]*>?/gm, '') || 'لا يوجد وصف.'}
                                </p>
                                <div className="text-lg font-bold text-emerald-400">
                                    {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}