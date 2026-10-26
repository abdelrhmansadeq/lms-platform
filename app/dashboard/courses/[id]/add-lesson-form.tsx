'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addLessonAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function AddLessonForm({ courseId }: { courseId: string }) {
    const [state, formAction, isPending] = useActionState(addLessonAction, null)
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
            <input type="hidden" name="courseId" value={courseId} />

            <div className="space-y-2">
                <Label htmlFor="title">عنوان الدرس</Label>
                <Input id="title" name="title" placeholder="مثال: مقدمة في Next.js" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="youtube_id">رابط اليوتيوب أو الـ ID</Label>
                <Input id="youtube_id" name="youtube_id" placeholder="https://youtu.be/..." dir="ltr" className="text-left" required />
                <p className="text-[10px] text-muted-foreground">يقبل الرابط الكامل أو الـ ID فقط.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">ملاحظات أو محتوى (اختياري)</Label>
                <Textarea id="content" name="content" placeholder="نص الدرس أو روابط مساعدة..." />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'جاري الإضافة...' : 'إضافة الدرس'}
            </Button>
        </form>
    )
}