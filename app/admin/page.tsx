import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, BookOpen, Wallet } from 'lucide-react'

type CourseData = { id: string; price: number; }
type EnrollmentData = { course_id: string; }

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // 1. عدد الطلاب
    const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

    // 2. عدد المدرسين
    const { count: instructorsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'instructor')

    // 3. إجمالي الكورسات
    const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

    // 4. حساب إجمالي الأرباح (هنلف على كل الاشتراكات ونجمع أسعار الكورسات)
    const { data: courses } = await supabase.from('courses').select('id, price')
    const { data: enrollments } = await supabase.from('enrollments').select('course_id')

    let totalPlatformRevenue = 0
    if (courses && enrollments) {
        const typedCourses = courses as CourseData[]
        const typedEnrollments = enrollments as EnrollmentData[]

        typedEnrollments.forEach((enrollment) => {
            const course = typedCourses.find(c => c.id === enrollment.course_id)
            if (course) {
                totalPlatformRevenue += Number(course.price)
            }
        })
    }

    return (
        <div className="space-y-8 animate-fade-up">

            {/* كروت الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* كارت الطلاب */}
                <Card className="bg-white/2 border-white/5 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-slate-400">إجمالي الطلاب</CardTitle>
                        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <Users className="h-5 w-5 text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-white">{studentsCount || 0}</div>
                    </CardContent>
                </Card>

                {/* كارت المدرسين */}
                <Card className="bg-white/2 border-white/5 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-slate-400">إجمالي المدرسين</CardTitle>
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <GraduationCap className="h-5 w-5 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-white">{instructorsCount || 0}</div>
                    </CardContent>
                </Card>

                {/* كارت الكورسات */}
                <Card className="bg-white/2 border-white/5 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-slate-400">إجمالي الكورسات</CardTitle>
                        <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                            <BookOpen className="h-5 w-5 text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-white">{coursesCount || 0}</div>
                    </CardContent>
                </Card>

                {/* كارت الأرباح */}
                <Card className="bg-white/2 border-white/5 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-slate-400">أرباح المنصة (تقديرية)</CardTitle>
                        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <Wallet className="h-5 w-5 text-yellow-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-white">
                            {totalPlatformRevenue} <span className="text-lg text-slate-400">ج.م</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* رسالة ترحيبية أو أدوات إضافية */}
            <Card className="bg-white/2 border-white/5 shadow-sm rounded-3xl p-8 text-center mt-8">
                <h2 className="text-2xl font-bold text-white mb-2">أهلاً بك في مركز التحكم</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    من هنا يمكنك مراقبة نمو المنصة. في التحديثات القادمة، يمكنك إضافة أدوات لإدارة المستخدمين وحظر الحسابات المخالفة.
                </p>
            </Card>

        </div>
    )
}