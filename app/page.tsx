import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Home() {
    const supabase = await createClient()

    // جلب الكورسات المنشورة فقط
    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto px-4 py-12">
            {/* الهيدر الترحيبي */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold mb-4 text-primary">اكتشف مسارك التعليمي</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    تصفح مجموعة من أفضل الكورسات التعليمية التي أعدها نخبة من المدرسين. ابدأ رحلتك الآن.
                </p>
            </div>

            {/* قائمة الكورسات */}
            <div className="mb-8 flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold">الكورسات المتاحة</h2>
                <span className="text-sm text-muted-foreground">{courses?.length || 0} كورس</span>
            </div>

            {(!courses || courses.length === 0) ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-lg border border-dashed">
                    <h3 className="text-xl font-semibold mb-2">لا توجد كورسات متاحة حالياً</h3>
                    <p className="text-muted-foreground">عدنا قريباً، المدرسون يعملون على إعداد محتوى رائع لك.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="text-xl line-clamp-1" title={course.title}>
                                    {course.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 mt-2 min-h-[40px]">
                                    {course.description || 'لا يوجد وصف لهذا الكورس.'}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <div className="text-lg font-bold text-primary mt-2">
                                    {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}
                                </div>
                            </CardContent>

                            <CardFooter className="pt-4 border-t">
                                {/* بنروح لصفحة تفاصيل الكورس باستخدام الـ slug */}
                                <Link href={`/courses/${course.slug}`} className="w-full">
                                    <Button className="w-full">عرض الكورس</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}