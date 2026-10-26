/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from 'lucide-react'

export default async function Home({
                                       searchParams
                                   }: {
    searchParams: Promise<{ q?: string }>
}) {
    const supabase = await createClient()
    const { q } = await searchParams
    const searchQuery = q?.trim() || ''

    let query = supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)

    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
    }

    const { data: courses } = await query.order('created_at', { ascending: false })

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                {/* تدرج لوني للنص عشان يبقى شيك */}
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    اكتشف مسارك التعليمي
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    تصفح مجموعة من أفضل الكورسات التعليمية التي أعدها نخبة من المدرسين. ابدأ رحلتك الآن.
                </p>
            </div>

            <div className="max-w-xl mx-auto mb-12">
                <form method="GET" action="/" className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                            name="q"
                            defaultValue={searchQuery}
                            placeholder="ابحث عن كورس بالاسم..."
                            className="pr-10 h-12 text-lg rounded-xl bg-card"
                        />
                    </div>
                    <Button type="submit" size="lg" className="h-12 rounded-xl px-8">
                        بحث
                    </Button>
                </form>
            </div>

            <div className="mb-8 flex justify-between items-center border-b border-border pb-4">
                <h2 className="text-2xl font-bold">
                    {searchQuery ? `نتائج البحث عن: "${searchQuery}"` : 'الكورسات المتاحة'}
                </h2>
                <span className="text-sm text-muted-foreground">{courses?.length || 0} كورس</span>
            </div>

            {(!courses || courses.length === 0) ? (
                <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">لا توجد كورسات تطابق بحثك</h3>
                    <p className="text-muted-foreground mb-6">جرب البحث بكلمات أخرى أو تصفح جميع الكورسات.</p>
                    {searchQuery && (
                        <Link href="/">
                            <Button variant="outline">عرض كل الكورسات</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card key={course.id} className="flex flex-col hover:shadow-lg transition-all duration-300 overflow-hidden bg-card border-border group">
                            <div className="relative h-48 w-full bg-muted border-b border-border overflow-hidden">
                                {course.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
                                        لا توجد صورة
                                    </div>
                                )}
                            </div>

                            <CardHeader>
                                <CardTitle className="text-xl line-clamp-1" title={course.title}>
                                    {course.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 mt-2 min-h-10">
                                    {course.description || 'لا يوجد وصف لهذا الكورس.'}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <div className="text-lg font-bold text-primary mt-2">
                                    {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}
                                </div>
                            </CardContent>

                            <CardFooter className="pt-4 border-t border-border">
                                <Link href={`/courses/${course.slug}`} className="w-full">
                                    <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                                        عرض الكورس
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