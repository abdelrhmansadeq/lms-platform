'use client'

import { useActionState, useEffect } from 'react'
import { enrollAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function EnrollForm({ courseId }: { courseId: string }) {
    const [state, formAction, isPending] = useActionState(enrollAction, null)
    const router = useRouter()

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
            router.refresh() // تحديث الصفحة عشان الدروس تفتح
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state, router])

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="courseId" value={courseId} />

            <div className="space-y-2">
                <Label htmlFor="code">كود التفعيل</Label>
                <Input id="code" name="code" placeholder="ACT-XXXXXX" dir="ltr" className="text-center font-mono uppercase" required />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'جاري التحقق...' : 'تفعيل الاشتراك'}
            </Button>
        </form>
    )
}