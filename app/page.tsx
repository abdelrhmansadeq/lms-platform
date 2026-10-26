import Link from 'next/link'
import Image from 'next/image'
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

    // صورة الـ Blur الوهمية (Base64) عشان تظهر مكان الصورة وهي بتتحمل
    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
            <div className="text-center mb-12 animate-fade-up">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-300">
                    اكتشف مسارك التعليمي
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    تصفح مجموعة من أفضل الكورسات التعليمية التي أعدها نخبة من المدرسين. ابدأ رحلتك الآن.
                </p>
            </div>

            <div className="max-w-xl mx-auto mb-12 animate-fade-up delay-100">
                <form method="GET" action="/" className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                            name="q"
                            defaultValue={searchQuery}
                            placeholder="ابحث عن كورس بالاسم..."
                            className="pr-10 h-12 text-lg rounded-xl bg-card border-border focus-visible:ring-primary"
                        />
                    </div>
                    <Button type="submit" size="lg" className="h-12 rounded-xl px-8 transition-transform active:scale-95">
                        بحث
                    </Button>
                </form>
            </div>

            <div className="mb-8 flex justify-between items-center border-b border-border pb-4 animate-fade-up delay-200">
                <h2 className="text-2xl font-bold">
                    {searchQuery ? `نتائج البحث عن: "${searchQuery}"` : 'الكورسات المتاحة'}
                </h2>
                <span className="text-sm text-muted-foreground">{courses?.length || 0} كورس</span>
            </div>

            {(!courses || courses.length === 0) ? (
                <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border shadow-sm animate-fade-in">
                    <h3 className="text-xl font-semibold mb-2">لا توجد كورسات تطابق بحثك</h3>
                    <p className="text-muted-foreground mb-6">جرب البحث بكلمات أخرى أو تصفح جميع الكورسات.</p>
                    {searchQuery && (
                        <Link href="/">
                            <Button variant="outline" className="transition-colors hover:bg-primary hover:text-white">عرض كل الكورسات</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <Link
                            href={`/courses/${course.slug}`}
                            key={course.id}
                            // هنا سر الصنعة: استخدام group وتأثيرات Hover الناعمة جداً
                            className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 animate-fade-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative h-48 w-full bg-muted border-b border-border overflow-hidden">
                                {course.thumbnail_url ? (
                                    <Image
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        placeholder="blur"
                                        blurDataURL={blurDataURL}
                                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
                                        لا توجد صورة
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2 line-clamp-1 text-foreground group-hover:text-primary transition-colors duration-300">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-4">
                                    {course.description || 'لا يوجد وصف لهذا الكورس.'}
                                </p>

                                <div className="flex justify-between items-center border-t border-border pt-4">
                                    <div className="text-lg font-bold text-primary">
                                        {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}
                                    </div>
                                    <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        عرض الكورس
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