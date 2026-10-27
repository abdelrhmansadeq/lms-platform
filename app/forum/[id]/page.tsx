import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, UserCircle2, MessageSquare } from 'lucide-react'
import { ReplyForm } from './reply-form'

// تعريف الأنواع
type PostWithProfile = {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    created_at: string;
    profiles: { full_name: string | null } | null;
}

type ReplyWithProfile = {
    id: string;
    content: string;
    created_at: string;
    profiles: { full_name: string | null } | null;
}

export default async function PostDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // جلب الموضوع
    const { data: postData } = await supabase
        .from('forum_posts')
        .select(`
      id, title, content, image_url, created_at,
      profiles (full_name)
    `)
        .eq('id', id)
        .single()

    if (!postData) notFound()

    const post = postData as unknown as PostWithProfile

    // جلب الردود
    const { data: repliesData } = await supabase
        .from('forum_replies')
        .select(`
      id, content, created_at,
      profiles (full_name)
    `)
        .eq('post_id', id)
        .order('created_at', { ascending: true })

    const replies = (repliesData as unknown as ReplyWithProfile[]) || []
    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">

            <div className="mb-6 animate-fade-up">
                <Link href="/forum">
                    <Button variant="ghost" className="gap-2 hover:bg-muted">
                        <ArrowRight className="w-4 h-4" />
                        العودة للمنتدى
                    </Button>
                </Link>
            </div>

            {/* كارت الموضوع الأساسي */}
            <Card className="mb-8 bg-card border-border shadow-sm animate-fade-up delay-100 overflow-hidden">
                <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-2xl md:text-3xl mb-4">{post.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserCircle2 className="w-6 h-6 text-primary" />
                        <span className="font-semibold text-foreground">{post.profiles?.full_name || 'طالب'}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <p className="text-lg whitespace-pre-wrap leading-relaxed">{post.content}</p>

                    {post.image_url && (
                        <div className="relative w-full max-h-[500px] rounded-xl overflow-hidden border border-border">
                            {/* بنستخدم Image مع خاصية object-contain عشان الصورة تبان كاملة */}
                            <Image
                                src={post.image_url}
                                alt="مرفق الموضوع"
                                width={800}
                                height={500}
                                className="w-full h-auto object-contain bg-muted"
                                placeholder="blur"
                                blurDataURL={blurDataURL}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* قسم الردود */}
            <div className="space-y-6 animate-fade-up delay-200">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    الردود ({replies.length})
                </h3>

                {/* فورم إضافة رد */}
                {user ? (
                    <ReplyForm postId={post.id} />
                ) : (
                    <div className="bg-muted/50 p-4 rounded-xl text-center border border-border">
                        <p className="text-sm text-muted-foreground mb-3">يجب تسجيل الدخول لتتمكن من الرد.</p>
                        <Link href="/login"><Button size="sm">تسجيل الدخول</Button></Link>
                    </div>
                )}

                {/* قائمة الردود */}
                <div className="space-y-4 mt-6">
                    {replies.length > 0 ? (
                        replies.map((reply) => (
                            <div key={reply.id} className="p-4 bg-card border border-border rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <UserCircle2 className="w-6 h-6 text-muted-foreground" />
                                    <span className="font-semibold text-sm">{reply.profiles?.full_name || 'طالب'}</span>
                                    <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(reply.created_at).toLocaleDateString('ar-EG')}
                  </span>
                                </div>
                                <p className="text-foreground whitespace-pre-wrap">{reply.content}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-6">لا توجد ردود بعد. كن أول من يرد!</p>
                    )}
                </div>
            </div>
        </div>
    )
}