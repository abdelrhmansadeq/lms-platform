'use client'

import { useActionState, useState } from 'react'
import { createCourseAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/rich-text-editor'
import Link from 'next/link'

export default function NewCoursePage() {
    const [state, formAction, isPending] = useActionState(createCourseAction, null)
    const [description, setDescription] = useState('')

    return (
        <div className="max-w-2xl mx-auto animate-fade-up">
            <Card className="bg-white/[0.02] border-white/5 shadow-2xl rounded-3xl backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-white">إنشاء كورس جديد</CardTitle>
                    <CardDescription className="text-slate-400">أدخل تفاصيل الكورس. يمكنك إضافة الدروس بعد إنشاء الكورس.</CardDescription>
                </CardHeader>

                <CardContent>
                    <form action={formAction} className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-slate-300">عنوان الكورس</Label>
                            <Input id="title" name="title" placeholder="مثال: دورة تعلم Next.js من الصفر" required className="bg-black/20 border-white/10 text-white" />
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
                            <Input id="thumbnail_file" name="thumbnail_file" type="file" accept="image/*" className="cursor-pointer bg-black/20 border-white/10 file:bg-emerald-500/10 file:text-emerald-400 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-emerald-500/20 transition-all text-slate-400" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-slate-300">السعر (بالجنيه المصري)</Label>
                            <Input id="price" name="price" type="number" min="0" step="0.01" placeholder="0.00" dir="ltr" className="text-left bg-black/20 border-white/10 text-white" defaultValue="0" />
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