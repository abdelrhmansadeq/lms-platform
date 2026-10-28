import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Sparkles, ChevronRight, ChevronLeft, PlayCircle, Users, Award, ShieldCheck, CircleDollarSign } from 'lucide-react'
import { WishlistButton } from '@/components/wishlist-button'

export default async function Home({
                                       searchParams
                                   }: {
    searchParams: Promise<{ q?: string, page?: string, category?: string, price?: string }>
}) {
    const supabase = await createClient()
    const { q, page, category, price } = await searchParams

    const searchQuery = q?.trim() || ''
    const categorySlug = category || ''
    const priceFilter = price || 'all' // all, free, paid
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

    // جلب التصنيفات
    const { data: categories } = await supabase.from('categories').select('id, name, slug')

    // فلترة التصنيف
    let categoryId = null
    if (categorySlug) {
        const { data: catData } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
        if (catData) categoryId = catData.id
    }

    // استعلام الكورسات
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

    // فلترة السعر
    if (priceFilter === 'free') {
        query = query.eq('price', 0)
    } else if (priceFilter === 'paid') {
        query = query.gt('price', 0)
    }

    const { data: courses, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1)

    const totalPages = count ? Math.ceil(count / itemsPerPage) : 0

    // إحصائيات سريعة للصفحة الرئيسية
    const { count: studentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
    const { count: coursesCount } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true)

    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    // دالة مساعدة لبناء الروابط مع الحفاظ على الفلاتر
    const buildUrl = (newCategory?: string, newPrice?: string, newPage?: number) => {
        const params = new URLSearchParams()
        if (searchQuery) params.set('q', searchQuery)
        if (newCategory !== undefined) {
            if (newCategory) params.set('category', newCategory)
        } else if (categorySlug) {
            params.set('category', categorySlug)
        }
        if (newPrice !== undefined) {
            if (newPrice !== 'all') params.set('price', newPrice)
        } else if (priceFilter !== 'all') {
            params.set('price', priceFilter)
        }
        if (newPage !== undefined) {
            if (newPage > 1) params.set('page', String(newPage))
        }
        const str = params.toString()
        return str ? `/?${str}#courses` : '/#courses'
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#0B0F17]">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* 1. قسم الهيرو (Hero Section) */}
            <section className="pt-24 pb-20 px-4 md:px-6 lg:px-8 relative">
                <div className="container mx-auto max-w-5xl text-center animate-fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold mb-8 border border-emerald-500/20 backdrop-blur-md">
                        <Sparkles className="w-4 h-4" />
                        <span>المنصة التعليمية رقم 1 للمبرمجين</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">
                        اكتشف مسارك التعليمي <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
              وابدأ رحلتك الآن
            </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        تصفح مجموعة من أفضل الكورسات التعليمية التي أعدها نخبة من المدرسين. تعلم من أي مكان وفي أي وقت، واختبر مستواك، وتواصل مع مجتمع تفاعلي.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="#courses">
                            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)]">
                                تصفح الكورسات الآن
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                                انضم كمدرس
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. قسم المميزات (Features) */}
            <section className="py-16 px-4 md:px-6 lg:px-8 bg-white/[0.01] border-y border-white/5">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <PlayCircle className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">فيديوهات عالية الجودة</h3>
                            <p className="text-sm text-slate-400">مشغل ذكي يتذكر مكان توقفك ويحفظ تقدمك تلقائياً.</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Award className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">اختبارات تفاعلية</h3>
                            <p className="text-sm text-slate-400">اختبر معلوماتك بعد كل درس واحصل على درجاتك فوراً.</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">مجتمع تفاعلي</h3>
                            <p className="text-sm text-slate-400">منتدى مخصص للطلاب للتواصل، تبادل الخبرات، وحل المشاكل.</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-6 h-6 text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">دعم فني مستمر</h3>
                            <p className="text-sm text-slate-400">تواصل مباشر مع المدرسين، ومذكرات شخصية لكل درس.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. قسم الإحصائيات */}
            <section className="py-16 border-b border-white/5 bg-black/20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-4xl font-extrabold text-white mb-1">{studentsCount || 0}+</p>
                            <p className="text-sm text-emerald-400 font-medium">طالب مسجل</p>
                        </div>
                        <div>
                            <p className="text-4xl font-extrabold text-white mb-1">{coursesCount || 0}+</p>
                            <p className="text-sm text-emerald-400 font-medium">كورس متاح</p>
                        </div>
                        <div>
                            <p className="text-4xl font-extrabold text-white mb-1">100%</p>
                            <p className="text-sm text-emerald-400 font-medium">دعم للموبايل</p>
                        </div>
                        <div>
                            <p className="text-4xl font-extrabold text-white mb-1">24/7</p>
                            <p className="text-sm text-emerald-400 font-medium">مجتمع نشط</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. قسم الكورسات */}
            <section id="courses" className="py-20 px-4 md:px-6 lg:px-8">
                <div className="container mx-auto">

                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">استكشف أحدث الكورسات</h2>
                        <p className="text-slate-400">اختر المسار الذي يناسبك وابدأ التعلم فوراً.</p>
                    </div>

                    {/* شريط البحث */}
                    <div className="max-w-2xl mx-auto mb-10 relative group">
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
                            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                            {priceFilter !== 'all' && <input type="hidden" name="price" value={priceFilter} />}
                            <Button type="submit" size="lg" className="h-12 rounded-xl px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)]">
                                بحث
                            </Button>
                        </form>
                    </div>

                    {/* أزرار الفلترة (السعر) */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                            <Link href={buildUrl(undefined, 'all')}>
                                <Button variant={priceFilter === 'all' ? 'default' : 'ghost'} className={`rounded-xl ${priceFilter === 'all' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'}`}>
                                    الكل
                                </Button>
                            </Link>
                            <Link href={buildUrl(undefined, 'free')}>
                                <Button variant={priceFilter === 'free' ? 'default' : 'ghost'} className={`rounded-xl ${priceFilter === 'free' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'}`}>
                                    مجاني
                                </Button>
                            </Link>
                            <Link href={buildUrl(undefined, 'paid')}>
                                <Button variant={priceFilter === 'paid' ? 'default' : 'ghost'} className={`rounded-xl ${priceFilter === 'paid' ? 'bg-blue-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                                    مدفوع
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* أزرار التصنيفات */}
                    <div className="flex overflow-x-auto gap-3 pb-6 mb-6 scrollbar-hide justify-center">
                        <Link href={buildUrl('', undefined)}>
                            <Button
                                variant="outline"
                                className={`rounded-full px-6 transition-all ${!categorySlug ? 'bg-emerald-500 text-black border-emerald-500 font-bold' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                            >
                                كل التصنيفات
                            </Button>
                        </Link>
                        {categories?.map((cat) => (
                            <Link key={cat.id} href={buildUrl(cat.slug, undefined)}>
                                <Button
                                    variant="outline"
                                    className={`rounded-full px-6 whitespace-nowrap transition-all ${categorySlug === cat.slug ? 'bg-emerald-500 text-black border-emerald-500 font-bold' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {cat.name}
                                </Button>
                            </Link>
                        ))}
                    </div>

                    <div className="mb-8 flex justify-between items-end pb-4">
                        <h3 className="text-xl font-bold text-white">
                            {searchQuery ? `نتائج البحث عن: "${searchQuery}"` : 'جميع الكورسات'}
                        </h3>
                        <span className="text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">{count || 0} كورس</span>
                    </div>

                    {/* شبكة الكورسات */}
                    {(!courses || courses.length === 0) ? (
                        <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/5 shadow-sm animate-fade-in">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-2 text-white">لا توجد كورسات تطابق بحثك</h3>
                            <p className="text-slate-400 mb-8">جرب تغيير الفلاتر أو البحث بكلمات أخرى.</p>
                            <Link href="/#courses">
                                <Button variant="outline" size="lg" className="border-white/10 hover:bg-white/5 text-white">عرض كل الكورسات</Button>
                            </Link>
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

                                            {/* بادج السعر */}
                                            <div className={`absolute top-3 right-3 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full border z-10 ${
                                                course.price === 0
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                            }`}>
                                                {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}
                                            </div>

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
                                    <Link href={buildUrl(undefined, undefined, currentPage - 1)} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}>
                                        <Button variant="outline" size="icon" className="bg-white/5 border-white/10 hover:bg-white/10"><ChevronRight className="w-4 h-4" /></Button>
                                    </Link>

                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <Link key={i} href={buildUrl(undefined, undefined, i + 1)}>
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

                                    <Link href={buildUrl(undefined, undefined, currentPage + 1)} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}>
                                        <Button variant="outline" size="icon" className="bg-white/5 border-white/10 hover:bg-white/10"><ChevronLeft className="w-4 h-4" /></Button>
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}