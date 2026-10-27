import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Plus, UserCircle2 } from 'lucide-react'

export default async function ForumPage() {
    const supabase = await createClient()

    const { data: posts } = await supabase
        .from('forum_posts')
        .select(`
      id, title, content, created_at,
      profiles (full_name),
      forum_replies (id)
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-5xl relative">

            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 animate-fade-up">
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

            {(!posts || posts.length === 0) ? (
                <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/5 shadow-sm animate-fade-in backdrop-blur-sm">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2 text-white">لا توجد مواضيع بعد</h3>
                    <p className="text-slate-400 mb-8">كن أول من يبدأ النقاش في المنتدى!</p>
                    <Link href="/forum/new">
                        <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">إنشاء أول موضوع</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {posts.map((post, index) => (
                        <Link href={`/forum/${post.id}`} key={post.id}>
                            <Card
                                className="bg-white/[0.02] border-white/5 hover:border-emerald-500/50 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1 animate-fade-up group rounded-3xl"
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
                                            <UserCircle2 className="w-5 h-5" />
                                            <span className="font-medium text-slate-300">
                        {(post.profiles as any)?.full_name || 'طالب'}
                      </span>
                                            <span className="text-xs hidden sm:inline-block">• {new Date(post.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>{(post.forum_replies as any)?.length || 0} رد</span>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}