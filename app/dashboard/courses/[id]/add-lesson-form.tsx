'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { addLessonAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { RichTextEditor } from '@/components/rich-text-editor'

// 1. تعريف قواعد التحقق
const lessonSchema = z.object({
    title: z.string().min(3, 'عنوان الدرس يجب أن يكون 3 أحرف على الأقل'),
    youtube_id: z.string().min(1, 'رابط اليوتيوب أو الـ ID مطلوب'),
})

type LessonFormValues = z.infer<typeof lessonSchema>

export function AddLessonForm({ courseId }: { courseId: string }) {
    const [state, formAction, isPending] = useActionState(addLessonAction, null)
    const [content, setContent] = useState('')

    // 2. إعداد React Hook Form
    const { register, handleSubmit, reset, formState: { errors } } = useForm<LessonFormValues>({
        resolver: zodResolver(lessonSchema),
    })

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
            reset() // تفريغ خانات الفورم
            setContent('') // تفريغ المحرر
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state, reset])

    // 3. دالة الإرسال بعد التحقق
    const onSubmit = (data: LessonFormValues) => {
        const formData = new FormData()
        formData.append('courseId', courseId)
        formData.append('title', data.title)
        formData.append('youtube_id', data.youtube_id)
        formData.append('content', content)

        formAction(formData)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-2">
                <Label className="text-slate-300">عنوان الدرس</Label>
                <Input
                    {...register('title')}
                    placeholder="مثال: مقدمة في Next.js"
                    className={`bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.title && <p className="text-red-400 text-xs font-medium">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-slate-300">رابط اليوتيوب أو الـ ID</Label>
                <Input
                    {...register('youtube_id')}
                    placeholder="https://youtu.be/..."
                    dir="ltr"
                    className={`text-left bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white ${errors.youtube_id ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.youtube_id && <p className="text-red-400 text-xs font-medium">{errors.youtube_id.message}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-slate-300">ملاحظات أو محتوى (اختياري)</Label>
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