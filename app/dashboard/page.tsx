/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Wallet } from 'lucide-react'

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

    return (
        <div className="space-y-8">

            {/* كروت الإحصائيات بالشكل الجديد (Dark & Gradients) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* كارت الكورسات */}
                <Card className="relative overflow-hidden bg-zinc-950 border-zinc-800 text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-zinc-400">إجمالي الكورسات</CardTitle>
                        <div className="p-2 bg-purple-500/10 rounded-full">
                            <BookOpen className="h-5 w-5 text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold">{totalCourses}</div>
                    </CardContent>
                </Card>

                {/* كارت الطلاب */}
                <Card className="relative overflow-hidden bg-zinc-950 border-zinc-800 text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-zinc-400">إجمالي الطلاب</CardTitle>
                        <div className="p-2 bg-teal-500/10 rounded-full">
                            <Users className="h-5 w-5 text-teal-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>

                {/* كارت الأرباح */}
                <Card className="relative overflow-hidden bg-zinc-950 border-zinc-800 text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-zinc-400">الأرباح التقديرية</CardTitle>
                        <div className="p-2 bg-orange-500/10 rounded-full">
                            <Wallet className="h-5 w-5 text-orange-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-orange-400">
                            {totalRevenue} <span className="text-lg text-zinc-400">ج.م</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* قائمة الكورسات */}
            <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800 pt-6">
                <div>
                    <h2 className="text-2xl font-bold">كورساتي</h2>
                </div>
                <Link href="/dashboard/courses/new">
                    <Button>+ إضافة كورس جديد</Button>
                </Link>
            </div>

            {(!courses || courses.length === 0) ? (
                <Card className="border-dashed bg-zinc-50 dark:bg-zinc-900/50">
                    <CardHeader className="text-center">
                        <CardTitle>لا توجد كورسات بعد</CardTitle>
                        <CardDescription>ابدأ بإنشاء أول كورس لك واضف له الدروس.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Link href="/dashboard/courses/new">
                            <Button variant="outline">إنشاء كورس</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card key={course.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all dark:bg-zinc-950 dark:border-zinc-800">
                            <div className="relative h-40 w-full bg-zinc-100 dark:bg-zinc-900 border-b dark:border-zinc-800">
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs">لا توجد صورة</div>
                                )}
                            </div>

                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <CardTitle className="text-lg line-clamp-1" title={course.title}>
                                        {course.title}
                                    </CardTitle>
                                    <span className={`text-xs px-2 py-1 rounded-full ${course.is_published ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'}`}>
                    {course.is_published ? 'منشور' : 'مسودة'}
                  </span>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <div className="text-sm font-medium">
                                    السعر: {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between border-t dark:border-zinc-800 pt-4">
                                <Link href={`/dashboard/courses/${course.id}`} className="w-full">
                                    <Button variant="outline" className="w-full dark:border-zinc-700 dark:hover:bg-zinc-800">
                                        إدارة الدروس
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}