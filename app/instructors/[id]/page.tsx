import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCircle2, BookOpen } from 'lucide-react'

// تعريف أنواع البيانات
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

    // 1. جلب بيانات المدرس
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, role')
        .eq('id', id)
        .single()

    if (!profile || profile.role !== 'instructor') notFound()

    const instructor = profile as InstructorProfile

    // 2. جلب الكورسات المنشورة بتاعته
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

            {/* كارت بيانات المدرس */}
            <div className="bg-card border border-border rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm animate-fade-up">
                {/* الصورة الرمزية */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border-4 border-background shadow-lg">
          <span className="text-6xl font-bold font-serif">
            {instructor.full_name?.charAt(0) || <UserCircle2 className="w-20 h-20" />}
          </span>
                </div>

                <div className="flex-1 text-center md:text-right">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{instructor.full_name}</h1>
                    <p className="text-primary font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                        <BookOpen className="w-5 h-5" />
                        مدرس في منصة LMS
                    </p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {instructor.bio || 'لم يقم هذا المدرس بإضافة نبذة عنه بعد.'}
                    </p>
                </div>
            </div>

            {/* كورسات المدرس */}
            <div className="mb-8 flex justify-between items-center border-b border-border pb-4 animate-fade-up delay-100">
                <h2 className="text-2xl font-bold">كورسات المدرس</h2>
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">{instructorCourses.length} كورس</span>
            </div>

            {instructorCourses.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
                    <p className="text-muted-foreground">هذا المدرس لم يقم بنشر أي كورسات حتى الآن.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {instructorCourses.map((course, index) => (
                        <Link
                            href={`/courses/${course.slug}`}
                            key={course.id}
                            className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 animate-fade-up"
                            style={{ animationDelay: `${(index + 2) * 100}ms` }}
                        >
                            <div className="relative h-40 w-full bg-muted border-b border-border overflow-hidden">
                                {course.thumbnail_url ? (
                                    <Image src={course.thumbnail_url} alt={course.title} fill placeholder="blur" blurDataURL={blurDataURL} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs">لا توجد صورة</div>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-foreground group-hover:text-primary transition-colors duration-300">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-10 mb-4">
                                    {course.description || 'لا يوجد وصف.'}
                                </p>
                                <div className="text-lg font-bold text-primary">
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