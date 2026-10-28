/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Plus, UserCircle2, ChevronRight, ChevronLeft, Search } from 'lucide-react'
import { UserBadges } from '@/components/user-badges'

type ForumPost = {
    id: string;
    title: string;
    content: string;
    created_at: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
        user_badges: { badges: { id: string; name: string; icon_name: string; color: string } | null }[] | null;
    } | null;
    forum_replies: { id: string }[] | null;
}

export default async function ForumPage({
                                            searchParams
                                        }: {
    searchParams: Promise<{ page?: string, q?: string }>
}) {
    const supabase = await createClient()
    const { page, q } = await searchParams

    const searchQuery = q?.trim() || ''
    const currentPage = Number(page) || 1
    const itemsPerPage = 6
    const offset = (currentPage - 1) * itemsPerPage

    // بناء الاستعلام مع البحث
    let query = supabase
        .from('forum_posts')
        .select(`
      id, title, content, created_at,
      profiles (
        full_name, 
        avatar_url,
        user_badges ( badges (id, name, icon_name, color) )
      ),
      forum_replies (id)
    `, { count: 'exact' })

    // فلترة البحث
    if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
    }

    const { data: postsData, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1)

    const posts = (postsData as unknown as ForumPost[]) || []
    const totalPages = count ? Math.ceil(count / itemsPerPage) : 0

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-5xl relative">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-150 h-75 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-up">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-emerald-400" />
                        منتدى الطلاب
                    </h1>
                    <p className="text-slate-400">اطرح أسئلتك، شارك مشاريعك، وتواصل مع زملائك.</p>
                </div>
                <Link href="/forum/new">
                    <Button className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)]">
                        <Plus className="w-4 h-4" />
                        موضوع جديد
                    </Button>
                </Link>
            </div>

            {/* شريط البحث الجديد */}
            <div className="max-w-2xl mb-8 animate-fade-up delay-100">
                <form method="GET" action="/forum" className="relative flex items-center gap-2 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            name="q"
                            defaultValue={searchQuery}
                            placeholder="ابحث عن موضوع أو سؤال..."
                            className="pr-12 h-12 text-lg rounded-xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-500 text-white"
                        />
                    </div>
                    <Button type="submit" size="lg" className="h-12 rounded-xl px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)]">
                        بحث
                    </Button>
                </form>
            </div>

            {(!posts || posts.length === 0) ? (
                <div className="text-center py-24 bg-white/2 rounded-3xl border border-white/5 shadow-sm animate-fade-in backdrop-blur-sm">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2 text-white">
                        {searchQuery ? `لا توجد نتائج لـ "${searchQuery}"` : 'لا توجد مواضيع بعد'}
                    </h3>
                    <p className="text-slate-400 mb-8">
                        {searchQuery ? 'جرب البحث بكلمات أخرى.' : 'كن أول من يبدأ النقاش في المنتدى!'}
                    </p>
                    {!searchQuery && (
                        <Link href="/forum/new">
                            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">إنشاء أول موضوع</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid gap-4">
                        {posts.map((post, index) => {
                            const userBadges = post.profiles?.user_badges?.map(ub => ub.badges).filter(b => b !== null) || []

                            return (
                                <Link href={`/forum/${post.id}`} key={post.id}>
                                    <Card
                                        className="bg-white/2 border-white/5 hover:border-emerald-500/50 hover:bg-white/4 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1 animate-fade-up group rounded-3xl"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <CardHeader className="p-6">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                                                        {post.title}
                                                    </CardTitle>
                                                    <CardDescription className="line-clamp-2 mt-2 text-slate-400">
                                                        {post.content}
                                                    </CardDescription>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                    {post.profiles?.avatar_url ? (
                                                        <img src={post.profiles.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-white/10" />
                                                    ) : (
                                                        <UserCircle2 className="w-5 h-5" />
                                                    )}
                                                    <span className="font-medium text-slate-300">
                            {post.profiles?.full_name || 'طالب'}
                          </span>

                                                    {userBadges.length > 0 && (
                                                        <div className="mr-2">
                                                            <UserBadges badges={userBadges as any} size="sm" />
                                                        </div>
                                                    )}

                                                    <span className="text-xs hidden sm:inline-block mr-2">• {new Date(post.created_at).toLocaleDateString('ar-EG')}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span>{post.forum_replies?.length || 0} رد</span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>

                    {/* أزرار الترقيم (Pagination) */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-12 animate-fade-up">
                            <Link href={`/forum?page=${currentPage - 1}${searchQuery ? `&q=${searchQuery}` : ''}`} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}>
                                <Button variant="outline" size="icon" className="bg-white/5 border-white/10 hover:bg-white/10"><ChevronRight className="w-4 h-4" /></Button>
                            </Link>

                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <Link key={i} href={`/forum?page=${i + 1}${searchQuery ? `&q=${searchQuery}` : ''}`}>
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

                            <Link href={`/forum?page=${currentPage + 1}${searchQuery ? `&q=${searchQuery}` : ''}`} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}>
                                <Button variant="outline" size="icon" className="bg-white/5 border-white/10 hover:bg-white/10"><ChevronLeft className="w-4 h-4" /></Button>
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}