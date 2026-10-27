import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Plus, UserCircle2 } from 'lucide-react'

export default async function ForumPage() {
    const supabase = await createClient()

    // جلب المواضيع مع بيانات الكاتب وعدد الردود
    const { data: posts } = await supabase
        .from('forum_posts')
        .select(`
      id, title, content, created_at,
      profiles (full_name),
      forum_replies (id)
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-5xl">

            {/* رأس الصفحة */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-up">
                <div>
                    <h1 className="text-3xl font-bold mb-2">منتدى الطلاب</h1>
                    <p className="text-muted-foreground">اطرح أسئلتك، شارك مشاريعك، وتواصل مع زملائك.</p>
                </div>
                <Link href="/forum/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        موضوع جديد
                    </Button>
                </Link>
            </div>

            {/* قائمة المواضيع */}
            {(!posts || posts.length === 0) ? (
                <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border animate-fade-in">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">لا توجد مواضيع بعد</h3>
                    <p className="text-muted-foreground mb-6">كن أول من يبدأ النقاش في المنتدى!</p>
                    <Link href="/forum/new">
                        <Button>إنشاء أول موضوع</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {posts.map((post, index) => (
                        <Link href={`/forum/${post.id}`} key={post.id}>
                            <Card
                                className="hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-card animate-fade-up group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <CardHeader className="p-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                                                {post.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 mt-2">
                                                {post.content}
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <UserCircle2 className="w-5 h-5" />
                                            {/* الوصول لاسم الكاتب جوه العلاقة */}
                                            <span className="font-medium text-foreground">
                        {(post.profiles as any)?.full_name || 'طالب'}
                      </span>
                                            <span className="text-xs hidden sm:inline-block">• {new Date(post.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>

                                        <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
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