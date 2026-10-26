import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
    const supabase = await createClient()

    // جلب المستخدم الحالي
    const { data: { user } } = await supabase.auth.getUser()

    // جلب كورسات المدرس دي
    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">كورساتي</h2>
                    <p className="text-sm text-muted-foreground">إجمالي الكورسات: {courses?.length || 0}</p>
                </div>
                <Link href="/dashboard/courses/new">
                    <Button>+ إضافة كورس جديد</Button>
                </Link>
            </div>

            {/* لو مفيش كورسات */}
            {(!courses || courses.length === 0) ? (
                <Card className="border-dashed">
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
                /* لو فيه كورسات */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card key={course.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <CardTitle className="text-lg line-clamp-1" title={course.title}>
                                        {course.title}
                                    </CardTitle>
                                    {/* حالة الكورس */}
                                    <span className={`text-xs px-2 py-1 rounded-full ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {course.is_published ? 'منشور' : 'مسودة'}
                  </span>
                                </div>
                                <CardDescription className="line-clamp-2 mt-2 h-10">
                                    {course.description || 'لا يوجد وصف لهذا الكورس.'}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <div className="text-sm font-medium mt-4">
                                    السعر: {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between border-t pt-4">
                                <Link href={`/dashboard/courses/${course.id}`} className="w-full">
                                    <Button variant="outline" className="w-full">
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