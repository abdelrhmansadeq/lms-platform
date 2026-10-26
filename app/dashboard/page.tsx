import Link from 'next/link'
import Image from 'next/image'
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

    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    return (
        <div className="space-y-8">

            {/* كروت الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up">

                {/* كارت الكورسات (تم تغييره للأخضر الزمردي) */}
                <Card className="relative overflow-hidden bg-card border-border text-foreground">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الكورسات</CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <BookOpen className="h-5 w-5 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold">{totalCourses}</div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-card border-border text-foreground">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الطلاب</CardTitle>
                        <div className="p-2 bg-teal-500/10 rounded-full">
                            <Users className="h-5 w-5 text-teal-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-card border-border text-foreground">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">الأرباح التقديرية</CardTitle>
                        <div className="p-2 bg-orange-500/10 rounded-full">
                            <Wallet className="h-5 w-5 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-orange-500">
                            {totalRevenue} <span className="text-lg text-muted-foreground">ج.م</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* قائمة الكورسات */}
            <div className="flex justify-between items-center border-t border-border pt-6 animate-fade-up delay-100">
                <div>
                    <h2 className="text-2xl font-bold">كورساتي</h2>
                </div>
                <Link href="/dashboard/courses/new">
                    <Button className="transition-transform active:scale-95">+ إضافة كورس جديد</Button>
                </Link>
            </div>

            {(!courses || courses.length === 0) ? (
                <Card className="border-dashed bg-muted/20 animate-fade-in">
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
                    {courses.map((course, index) => (
                        <Link
                            href={`/dashboard/courses/${course.id}`}
                            key={course.id}
                            className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-fade-up"
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
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors" title={course.title}>
                                        {course.title}
                                    </h3>
                                    <span className={`text-xs px-2 py-1 rounded-full ${course.is_published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {course.is_published ? 'منشور' : 'مسودة'}
                  </span>
                                </div>

                                <div className="text-sm font-medium mt-4">
                                    السعر: {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}
                                </div>

                                <div className="mt-6 border-t border-border pt-4">
                                    <div className="w-full text-center bg-secondary text-secondary-foreground py-2 rounded-md text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
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