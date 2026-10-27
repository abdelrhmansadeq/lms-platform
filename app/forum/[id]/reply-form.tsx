'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createReplyAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

export function ReplyForm({ postId }: { postId: string }) {
    const [state, formAction, isPending] = useActionState(createReplyAction, null)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
            formRef.current?.reset()
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="postId" value={postId} />

            <Textarea
                name="content"
                placeholder="اكتب ردك هنا..."
                className="min-h-24 bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white placeholder:text-slate-500"
                required
            />

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending} className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]">
                    <Send className="w-4 h-4" />
                    {isPending ? 'جاري الإرسال...' : 'إرسال الرد'}
                </Button>
            </div>
        </form>
    )
}