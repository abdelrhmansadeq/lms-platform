'use client'

import { useActionState, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createCourseAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/rich-text-editor'
import Link from 'next/link'
import { toast } from 'sonner'

// 1. تعريف قواعد التحقق
const courseSchema = z.object({
    title: z.string().min(3, 'عنوان الكورس يجب أن يكون 3 أحرف على الأقل'),
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'السعر يجب أن يكون رقماً موجباً',
    }),
})

type CourseFormValues = z.infer<typeof courseSchema>

export default function NewCoursePage() {
    const [state, formAction, isPending] = useActionState(createCourseAction, null)
    const [description, setDescription] = useState('')
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

    // 2. إعداد React Hook Form
    const { register, handleSubmit, formState: { errors } } = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: { price: '0' }
    })

    useEffect(() => {
        if (state?.error) toast.error(state.error)
    }, [state])

    // 3. دالة الإرسال بعد التحقق
    const onSubmit = (data: CourseFormValues) => {
        const formData = new FormData()
        formData.append('title', data.title)
        formData.append('price', data.price)
        formData.append('description', description) // جاية من المحرر

        // لو فيه صورة مرفوعة بنبعتها
        if (thumbnailFile) {
            formData.append('thumbnail_file', thumbnailFile)
        }

        formAction(formData)
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-up">
            <Card className="bg-white/[0.02] border-white/5 shadow-2xl rounded-3xl backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-white">إنشاء كورس جديد</CardTitle>
                    <CardDescription className="text-slate-400">أدخل تفاصيل الكورس. يمكنك إضافة الدروس بعد إنشاء الكورس.</CardDescription>
                </CardHeader>

                <CardContent>
                    {/* بنستخدم handleSubmit عشان نمنع الإرسال لو فيه أخطاء */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-slate-300">عنوان الكورس</Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="مثال: دورة تعلم Next.js من الصفر"
                                className={`bg-black/20 border-white/10 text-white ${errors.title ? 'border-red-500' : ''}`}
                            />
                            {errors.title && <p className="text-red-400 text-xs font-medium">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">وصف الكورس</Label>
                            <RichTextEditor
                                name="description"
                                content={description}
                                onChange={setDescription}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="thumbnail_file" className="text-slate-300">صورة الغلاف (اختياري)</Label>
                            <Input
                                id="thumbnail_file"
                                name="thumbnail_file"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                className="cursor-pointer bg-black/20 border-white/10 file:bg-emerald-500/10 file:text-emerald-400 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-emerald-500/20 transition-all text-slate-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-slate-300">السعر (بالجنيه المصري)</Label>
                            <Input
                                id="price"
                                {...register('price')}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                dir="ltr"
                                className={`text-left bg-black/20 border-white/10 text-white ${errors.price ? 'border-red-500' : ''}`}
                            />
                            {errors.price && <p className="text-red-400 text-xs font-medium">{errors.price.message}</p>}
                            <p className="text-xs text-slate-500">اتركه 0 إذا كان الكورس مجانياً.</p>
                        </div>

                        {state?.error && (
                            <div className="text-sm font-medium text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                {state.error}
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                            <Link href="/dashboard">
                                <Button type="button" variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/5">إلغاء</Button>
                            </Link>
                            <Button type="submit" disabled={isPending} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8">
                                {isPending ? 'جاري الحفظ...' : 'حفظ الكورس'}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}