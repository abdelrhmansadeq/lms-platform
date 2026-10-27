import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react'
import { WishlistButton } from '@/components/wishlist-button'

export default async function Home({
                                       searchParams
                                   }: {
    searchParams: Promise<{ q?: string, page?: string, category?: string }>
}) {
    const supabase = await createClient()
    const { q, page, category } = await searchParams

    const searchQuery = q?.trim() || ''
    const categorySlug = category || ''
    const currentPage = Number(page) || 1
    const itemsPerPage = 6
    const offset = (currentPage - 1) * itemsPerPage

    const { data: { user } } = await supabase.auth.getUser()
    let wishlistedCourseIds: string[] = []

    if (user) {
        const { data: wishlist } = await supabase
            .from('wishlists')
            .select('course_id')
            .eq('student_id', user.id)

        if (wishlist) {
            wishlistedCourseIds = wishlist.map(w => w.course_id)
        }
    }

    // 1. جلب التصنيفات لعرضها كأزرار
    const { data: categories } = await supabase.from('categories').select('id, name, slug')

    // 2. لو الطالب اختار تصنيف، هندور على الـ ID بتاعه
    let categoryId = null
    if (categorySlug) {
        const { data: catData } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
        if (catData) categoryId = catData.id
    }

    // 3. بناء استعلام الكورسات مع الفلترة
    let query = supabase
        .from('courses')
        .select('*', { count: 'exact' })
        .eq('is_published', true)

    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
    }

    if (categoryId) {
        query = query.eq('category_id', categoryId)
    }

    const { data: courses, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1)

    const totalPages = count ? Math.ceil(count / itemsPerPage) : 0

    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    return (
        <div className="min-h-screen relative overflow-hidden">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-20">

                <div className="text-center mb-16 max-w-3xl mx-auto animate-fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold mb-6 border border-emerald-500/20 backdrop-blur-md">
                        <Sparkles className="w-4 h-4" />
                        <span>المنصة التعليمية الأقوى</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">
                        اكتشف مسارك التعليمي <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
              وابدأ رحلتك الآن
            </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                        تصفح مجموعة من أفضل الكورسات التعليمية التي أعدها نخبة من المدرسين. تعلم من أي مكان وفي أي وقت.
                    </p>

                    <div className="max-w-2xl mx-auto relative group">
                        <form method="GET" action="/" className="relative flex items-center gap-2 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
                            <div className="relative flex-1">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <Input
                                    name="q"
                                    defaultValue={searchQuery}
                                    placeholder="ابحث عن كورس..."
                                    className="pr-12 h-12 text-lg rounded-xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-500 text-white"
                                />
                            </div>
                            {/* لو فيه تصنيف مختار، بنبعته مع البحث عشان ميتلغي */}
                            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                            <Button type="submit" size="lg" className="h-12 rounded-xl px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)]">
                                بحث
                            </Button>
                        </form>
                    </div>
                </div>

                {/* أزرار التصنيفات */}
                <div className="flex overflow-x-auto gap-3 pb-6 mb-6 scrollbar-hide animate-fade-up delay-100">
                    <Link href={`/?${searchQuery ? `q=${searchQuery}` : ''}`}>
                        <Button
                            variant="outline"
                            className={`rounded-full px-6 transition-all ${!categorySlug ? 'bg-emerald-500 text-black border-emerald-500 font-bold' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                        >
                            الكل
                        </Button>
                    </Link>
                    {categories?.map((cat) => (
                        <Link key={cat.id} href={`/?category=${cat.slug}${searchQuery ? `&q=${searchQuery}` : ''}`}>
                            <Button
                                variant="outline"
                                className={`rounded-full px-6 whitespace-nowrap transition-all ${categorySlug === cat.slug ? 'bg-emerald-500 text-black border-emerald-500 font-bold' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                            >
                                {cat.name}
                            </Button>
                        </Link>
                    ))}
                </div>

                <div className="mb-8 flex justify-between items-end pb-4 animate-fade-up delay-200">
                    <h2 className="text-2xl font-bold text-white">
                        {searchQuery ? `نتائج البحث عن: "${searchQuery}"` : 'الكورسات المتاحة'}
                    </h2>
                    <span className="text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">{count || 0} كورس</span>
                </div>

                {(!courses || courses.length === 0) ? (
                    <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/5 shadow-sm animate-fade-in">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2 text-white">لا توجد كورسات في هذا التصنيف</h3>
                        <p className="text-slate-400 mb-8">جرب تصنيف آخر أو تصفح جميع الكورسات.</p>
                        {(searchQuery || categorySlug) && (
                            <Link href="/">
                                <Button variant="outline" size="lg" className="border-white/10 hover:bg-white/5 text-white">عرض كل الكورسات</Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((course, index) => (
                                <Link
                                    href={`/courses/${course.slug}`}
                                    key={course.id}
                                    className="group relative flex flex-col rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/50 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)] animate-fade-up overflow-hidden"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="relative aspect-video w-full bg-slate-800 overflow-hidden">
                                        <WishlistButton
                                            courseId={course.id}
                                            initialIsWishlisted={wishlistedCourseIds.includes(course.id)}
                                            isLoggedIn={!!user}
                                        />
                                        <div className="absolute top-3 right-3 bg-emerald-500/20 backdrop-blur-md text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 z-10">جديد</div>
                                        {course.thumbnail_url ? (
                                            <Image src={course.thumbnail_url} alt={course.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" placeholder="blur" blurDataURL={blurDataURL} className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100" />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm">لا توجد صورة</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] to-transparent opacity-80" />
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col relative z-10">
                                        <h3 className="text-xl font-bold mb-3 line-clamp-1 text-white group-hover:text-emerald-400 transition-colors">{course.title}</h3>
                                        <p className="text-sm text-slate-400 line-clamp-2 min-h-[40px] mb-6 flex-1">{course.description?.replace(/<[^>]*>?/gm, '') || 'لا يوجد وصف لهذا الكورس.'}</p>

                                        <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                                            <div className="text-xl font-bold text-white">{course.price === 0 ? 'مجاني' : `${course.price} ج.م`}</div>
                                            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">عرض الكورس <span className="group-hover:-translate-x-1 transition-transform">←</span></div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12 animate-fade-up">
                                <Link href={`/?page=${currentPage - 1}${searchQuery ? `&q=${searchQuery}` : ''}${categorySlug ? `&category=${categorySlug}` : ''}`} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}>
                                    <Button variant="outline" size="icon" className="bg-white/5 border-white/10 hover:bg-white/10"><ChevronRight className="w-4 h-4" /></Button>
                                </Link>

                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <Link key={i} href={`/?page=${i + 1}${searchQuery ? `&q=${searchQuery}` : ''}${categorySlug ? `&category=${categorySlug}` : ''}`}>
                                            <Button
                                                variant={currentPage === i + 1 ? "default" : "outline"}
                                                size="sm"
                                                className={currentPage === i + 1 ? "bg-emerald-500 text-black font-bold" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}
                                            >
                                                {i + 1}
                                            </Button>
                                        </Link>
                                    ))}
                                </div>

                                <Link href={`/?page=${currentPage + 1}${searchQuery ? `&q=${searchQuery}` : ''}${categorySlug ? `&category=${categorySlug}` : ''}`} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}>
                                    <Button variant="outline" size="icon" className="bg-white/5 border-white/10 hover:bg-white/10"><ChevronLeft className="w-4 h-4" /></Button>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}