import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart, ArrowRight } from 'lucide-react'
import { WishlistButton } from '@/components/wishlist-button'

export default async function WishlistPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // جلب كورسات المفضلة
    const { data: wishlistItems } = await supabase
        .from('wishlists')
        .select(`
      course_id,
      courses (
        id, title, slug, description, thumbnail_url, price
      )
    `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-5xl">

            <div className="flex items-center gap-3 mb-8 animate-fade-up border-b border-border pb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-500 fill-current" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">المفضلة</h1>
                    <p className="text-muted-foreground">الكورسات التي قمت بحفظها للرجوع إليها لاحقاً.</p>
                </div>
            </div>

            {(!wishlistItems || wishlistItems.length === 0) ? (
                <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border animate-fade-in">
                    <h3 className="text-xl font-semibold mb-2">قائمة المفضلة فارغة</h3>
                    <p className="text-muted-foreground mb-6">تصفح الكورسات واضغط على أيقونة القلب لحفظها هنا.</p>
                    <Link href="/">
                        <Button className="gap-2">تصفح الكورسات <ArrowRight className="w-4 h-4" /></Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item: any, index) => {
                        const course = item.courses
                        if (!course) return null

                        return (
                            <Link
                                href={`/courses/${course.slug}`}
                                key={course.id}
                                className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 animate-fade-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="relative h-48 w-full bg-muted border-b border-border overflow-hidden">
                                    {/* زرار المفضلة عشان يقدر يمسحها من هنا مباشرة */}
                                    <WishlistButton
                                        courseId={course.id}
                                        initialIsWishlisted={true}
                                        isLoggedIn={true}
                                    />

                                    {course.thumbnail_url ? (
                                        <Image src={course.thumbnail_url} alt={course.title} fill placeholder="blur" blurDataURL={blurDataURL} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">لا توجد صورة</div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-10 mb-4">{course.description}</p>
                                    <div className="flex justify-between items-center border-t border-border pt-4">
                                        <div className="text-lg font-bold text-primary">
                                            {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}
                                        </div>
                                        <div className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                            عرض التفاصيل &larr;
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}