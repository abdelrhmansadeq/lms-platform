/* eslint-disable @next/next/no-img-element */
'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { addLessonCommentAction, deleteLessonCommentAction } from './actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { MessageSquare, Send, Trash2, UserCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type CommentWithProfile = {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: { full_name: string | null; avatar_url: string | null; } | null;
};

export function CommentsSection({
                                    lessonId,
                                    initialComments,
                                    currentUserId
                                }: {
    lessonId: string;
    initialComments: CommentWithProfile[];
    currentUserId: string;
}) {
    const [state, formAction, isPending] = useActionState(addLessonCommentAction, null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
            formRef.current?.reset()
            router.refresh()
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state, router])

    const handleDelete = async (commentId: string) => {
        setIsDeleting(commentId)
        const res = await deleteLessonCommentAction(commentId)
        if (res.error) toast.error(res.error)
        else {
            toast.success(res.success)
            router.refresh()
        }
        setIsDeleting(null)
    }

    return (
        <div className="mt-8 pt-8 border-t border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-emerald-400" /> الأسئلة والنقاشات ({initialComments.length})
            </h3>

            <form ref={formRef} action={formAction} className="mb-8 space-y-3">
                <input type="hidden" name="lessonId" value={lessonId} />
                <Textarea
                    name="content"
                    placeholder="لديك سؤال؟ اطرحه هنا وسيقوم المدرس أو زملائك بالرد..."
                    className="min-h-20 bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white placeholder:text-slate-500"
                    required
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={isPending} className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                        <Send className="w-4 h-4" />
                        {isPending ? 'جاري الإرسال...' : 'إرسال السؤال'}
                    </Button>
                </div>
            </form>

            <div className="space-y-4">
                {initialComments.length === 0 ? (
                    <p className="text-center py-6 text-slate-500 bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">
                        لا توجد أسئلة بعد. كن أول من يطرح سؤالاً!
                    </p>
                ) : (
                    initialComments.map((comment) => (
                        <div key={comment.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    {/* عرض الصورة الشخصية */}
                                    {comment.profiles?.avatar_url ? (
                                        <img src={comment.profiles.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                            {comment.profiles?.full_name?.charAt(0) || <UserCircle2 className="w-4 h-4" />}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-sm text-slate-200">{comment.profiles?.full_name || 'طالب'}</p>
                                        <p className="text-[10px] text-slate-500">{new Date(comment.created_at).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                </div>

                                {comment.user_id === currentUserId && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8"
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={isDeleting === comment.id}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mt-3">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}