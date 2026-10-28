'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { enrollFreeCourseAction } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function FreeEnrollButton({ courseId }: { courseId: string }) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleEnroll = async () => {
        setIsPending(true)
        const res = await enrollFreeCourseAction(courseId)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(res.success)
            router.refresh() // عشان الصفحة تتحدث وتظهر الدروس
        }
        setIsPending(false)
    }

    return (
        <Button
            onClick={handleEnroll}
            disabled={isPending}
            className="w-full h-12 text-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold gap-2"
        >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'الاشتراك مجاناً الآن'}
        </Button>
    )
}