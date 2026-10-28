'use client'

import { useActionState, useEffect, useState } from 'react'
import { submitReviewAction } from './actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { StarRating } from '@/components/star-rating'

export function ReviewForm({ courseId, existingReview }: { courseId: string, existingReview?: { rating: number, comment: string | null } | null }) {
    const [state, formAction, isPending] = useActionState(submitReviewAction, null)
    const [rating, setRating] = useState(existingReview?.rating || 0)

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <form action={formAction} className="space-y-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="rating" value={rating} />

            <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-slate-300">
                    {existingReview ? 'تعديل تقييمك' : 'ما هو تقييمك لهذا الكورس؟'}
                </p>
                <StarRating
                    initialRating={rating}
                    onRatingChangeAction={(val) => setRating(val)} // <--- التعديل هنا
                    size="lg"
                />
            </div>

            <Textarea
                name="comment"
                defaultValue={existingReview?.comment || ''}
                placeholder="شاركنا رأيك في الكورس (اختياري)..."
                className="min-h-24 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500"
            />

            <Button type="submit" className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-400" disabled={isPending || rating === 0}>
                {isPending ? 'جاري الحفظ...' : existingReview ? 'تحديث التقييم' : 'إرسال التقييم'}
            </Button>
        </form>
    )
}