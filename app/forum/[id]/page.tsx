/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, UserCircle2, MessageSquare } from 'lucide-react'
import { ReplyForm } from './reply-form'
import { UserBadges, type Badge } from '@/components/user-badges'

type ProfileWithBadges = {
    full_name: string | null;
    avatar_url: string | null;
    user_badges: { badges: Badge | null }[] | null;
}

type PostWithProfile = {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    created_at: string;
    profiles: ProfileWithBadges | null;
}

type ReplyWithProfile = {
    id: string;
    content: string;
    created_at: string;
    profiles: ProfileWithBadges | null;
}

export default async function PostDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: postData } = await supabase
        .from('forum_posts')
        .select(`
      id, title, content, image_url, created_at, 
      profiles (
        full_name, 
        avatar_url,
        user_badges ( badges (id, name, description, icon_name, color) )
      )
    `)
        .eq('id', id)
        .single()

    if (!postData) notFound()
    const post = postData as unknown as PostWithProfile

    const { data: repliesData } = await supabase
        .from('forum_replies')
        .select(`
      id, content, created_at, 
      profiles (
        full_name, 
        avatar_url,
        user_badges ( badges (id, name, description, icon_name, color) )
      )
    `)
        .eq('post_id', id)
        .order('created_at', { ascending: true })

    const replies = (repliesData as unknown as ReplyWithProfile[]) || []
    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    const postUserBadges = post.profiles?.user_badges?.map(ub => ub.badges).filter((b): b is Badge => b !== null) || []

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl relative">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="mb-6 animate-fade-up">
                <Link href="/forum">
                    <Button variant="ghost" className="gap-2 hover:bg-white/5 text-slate-300 hover:text-white">
                        <ArrowRight className="w-4 h-4" /> العودة للمنتدى
                    </Button>
                </Link>
            </div>

            <Card className="mb-8 bg-white/[0.02] border-white/5 shadow-xl animate-fade-up delay-100 overflow-hidden rounded-3xl backdrop-blur-sm">
                <CardHeader className="border-b border-white/5 pb-4 bg-white/[0.01]">
                    <CardTitle className="text-2xl md:text-3xl mb-4 text-white">{post.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                {post.profiles?.full_name?.charAt(0) || <UserCircle2 className="w-5 h-5" />}
                            </div>
                        )}
                        <span className="font-semibold text-slate-200">{post.profiles?.full_name || 'طالب'}</span>

                        {postUserBadges.length > 0 && (
                            <UserBadges badges={postUserBadges} size="sm" />
                        )}

                        <span className="mr-2">•</span>
                        <span>{new Date(post.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <p className="text-lg whitespace-pre-wrap leading-relaxed text-slate-300">{post.content}</p>

                    {post.image_url && (
                        <div className="relative w-full max-h-[500px] rounded-2xl overflow-hidden border border-white/10">
                            <Image src={post.image_url} alt="مرفق الموضوع" width={800} height={500} className="w-full h-auto object-contain bg-black/40" placeholder="blur" blurDataURL={blurDataURL} />
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-6 animate-fade-up delay-200">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <MessageSquare className="w-5 h-5 text-emerald-400" /> الردود ({replies.length})
                </h3>

                {user ? (
                    <ReplyForm postId={post.id} />
                ) : (
                    <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/10">
                        <p className="text-sm text-slate-400 mb-4">يجب تسجيل الدخول لتتمكن من الرد.</p>
                        <Link href="/login"><Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">تسجيل الدخول</Button></Link>
                    </div>
                )}

                <div className="space-y-4 mt-6">
                    {replies.length > 0 ? (
                        replies.map((reply) => {
                            const replyUserBadges = reply.profiles?.user_badges?.map(ub => ub.badges).filter((b): b is Badge => b !== null) || []

                            return (
                                <div key={reply.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        {reply.profiles?.avatar_url ? (
                                            <img src={reply.profiles.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-300 font-bold">
                                                {reply.profiles?.full_name?.charAt(0) || 'ط'}
                                            </div>
                                        )}
                                        <span className="font-semibold text-sm text-slate-200">{reply.profiles?.full_name || 'طالب'}</span>

                                        {replyUserBadges.length > 0 && (
                                            <UserBadges badges={replyUserBadges} size="sm" />
                                        )}

                                        <span className="text-xs text-slate-500 mr-auto">
                      {new Date(reply.created_at).toLocaleDateString('ar-EG')}
                    </span>
                                    </div>
                                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-center text-slate-500 py-8 bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">لا توجد ردود بعد. كن أول من يرد!</p>
                    )}
                </div>
            </div>
        </div>
    )
}