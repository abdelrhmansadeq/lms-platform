import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Wallet, Plus } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user?.id)
        .order('created_at', { ascending: false })

    const totalCourses = courses?.length || 0
    let totalStudents = 0
    let totalRevenue = 0

    if (courses && courses.length > 0) {
        const courseIds = courses.map(c => c.id)
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('course_id')
            .in('course_id', courseIds)

        if (enrollments) {
            totalStudents = enrollments.length
            enrollments.forEach((enrollment) => {
                const course = courses.find(c => c.id === enrollment.course_id)
                if (course) {
                    totalRevenue += Number(course.price)
                }
            })
        }
    }

    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    return (
        <div className="space-y-8 relative">

            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* كروت الإحصائيات (زجاجية بتوهج) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up">

                <Card className="bg-white/[0.02] border-white/5 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-slate-400">إجمالي الكورسات</CardTitle>
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <BookOpen className="h-5 w-5 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-white">{totalCourses}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/5 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-slate-400">إجمالي الطلاب</CardTitle>
                        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <Users className="h-5 w-5 text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-white">{totalStudents}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/5 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-slate-400">الأرباح التقديرية</CardTitle>
                        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <Wallet className="h-5 w-5 text-yellow-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-white">
                            {totalRevenue} <span className="text-lg text-slate-400">ج.م</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* قائمة الكورسات */}
            <div className="flex justify-between items-center border-t border-white/5 pt-8 animate-fade-up delay-100">
                <div>
                    <h2 className="text-2xl font-bold text-white">كورساتي</h2>
                </div>
                <Link href="/dashboard/courses/new">
                    <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)] gap-2 transition-all">
                        <Plus className="w-4 h-4" /> إضافة كورس جديد
                    </Button>
                </Link>
            </div>

            {(!courses || courses.length === 0) ? (
                <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm animate-fade-in">
                    <CardHeader className="text-center py-12">
                        <CardTitle className="text-2xl text-white">لا توجد كورسات بعد</CardTitle>
                        <CardDescription className="text-slate-400 mt-2">ابدأ بإنشاء أول كورس لك واضف له الدروس.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-12">
                        <Link href="/dashboard/courses/new">
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">إنشاء كورس</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <Link
                            href={`/dashboard/courses/${course.id}`}
                            key={course.id}
                            className="group block bg-white/[0.02] rounded-3xl overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1 animate-fade-up"
                            style={{ animationDelay: `${(index + 2) * 100}ms` }}
                        >
                            <div className="relative h-40 w-full bg-slate-800 border-b border-white/5 overflow-hidden">
                                {course.thumbnail_url ? (
                                    <Image src={course.thumbnail_url} alt={course.title} fill placeholder="blur" blurDataURL={blurDataURL} className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-slate-500 text-xs">لا توجد صورة</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] to-transparent opacity-80" />

                                {/* Badge الحالة */}
                                <div className="absolute top-3 right-3 z-10">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold backdrop-blur-md border ${course.is_published ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                    {course.is_published ? 'منشور' : 'مسودة'}
                  </span>
                                </div>
                            </div>

                            <div className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold line-clamp-1 text-white group-hover:text-emerald-400 transition-colors" title={course.title}>
                                        {course.title}
                                    </h3>
                                </div>

                                <div className="text-sm font-medium mt-4 text-slate-400">
                                    السعر: <span className="text-emerald-400 font-bold">{course.price === 0 ? 'مجاني' : `${course.price} ج.م`}</span>
                                </div>

                                <div className="mt-6 border-t border-white/5 pt-4">
                                    <div className="w-full text-center bg-white/5 border border-white/10 py-2.5 rounded-xl text-sm font-bold text-white group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-500 transition-all duration-300">
                                        إدارة الدروس
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}