'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { togglePublishAction } from './actions'
import { toast } from 'sonner'

export function PublishButton({ courseId, isPublished }: { courseId: string, isPublished: boolean }) {
    const [isPending, setIsPending] = useState(false)

    const handleToggle = async () => {
        setIsPending(true)
        const res = await togglePublishAction(courseId, isPublished)
        if (res.error) toast.error(res.error)
        else toast.success(res.success)
        setIsPending(false)
    }

    return (
        <Button
            onClick={handleToggle}
            disabled={isPending}
            variant={isPublished ? "destructive" : "default"}
        >
            {isPending ? 'جاري التحديث...' : isPublished ? 'إلغاء النشر (تحويل لمسودة)' : 'نشر الكورس للطلاب'}
        </Button>
    )
}