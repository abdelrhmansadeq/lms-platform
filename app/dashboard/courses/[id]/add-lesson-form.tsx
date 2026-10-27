'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { addLessonAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { RichTextEditor } from '@/components/rich-text-editor'

export function AddLessonForm({ courseId }: { courseId: string }) {
    const [state, formAction, isPending] = useActionState(addLessonAction, null)
    const formRef = useRef<HTMLFormElement>(null)
    const [content, setContent] = useState('')

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
            formRef.current?.reset()
            setContent('') // تفريغ المحرر بعد الإضافة
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="courseId" value={courseId} />

            <div className="space-y-2">
                <Label className="text-slate-300">عنوان الدرس</Label>
                <Input id="title" name="title" placeholder="مثال: مقدمة في Next.js" required className="bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white" />
            </div>

            <div className="space-y-2">
                <Label className="text-slate-300">رابط اليوتيوب أو الـ ID</Label>
                <Input id="youtube_id" name="youtube_id" placeholder="https://youtu.be/..." dir="ltr" className="text-left bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white" required />
            </div>

            <div className="space-y-2">
                <Label className="text-slate-300">ملاحظات أو محتوى (اختياري)</Label>
                {/* استبدلنا الـ Textarea بالمحرر */}
                <RichTextEditor
                    content={content}
                    onChange={(html) => setContent(html)}
                />
            </div>

            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold" disabled={isPending}>
                {isPending ? 'جاري الإضافة...' : 'إضافة الدرس'}
            </Button>
        </form>
    )
}