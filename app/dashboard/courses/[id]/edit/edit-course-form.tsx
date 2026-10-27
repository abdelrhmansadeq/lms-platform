'use client'

import { useActionState, useState } from 'react'
import { updateCourseAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/rich-text-editor'
import Link from 'next/link'

type CourseData = {
    id: string;
    title: string;
    description: string | null;
    price: number;
    thumbnail_url: string | null;
};

export function EditCourseForm({ course }: { course: CourseData }) {
    const [state, formAction, isPending] = useActionState(updateCourseAction, null)
    const [description, setDescription] = useState(course.description || '')

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="courseId" value={course.id} />

            <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">عنوان الكورس</Label>
                <Input id="title" name="title" defaultValue={course.title} required className="bg-black/20 border-white/10 text-white" />
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
                <Label htmlFor="thumbnail_file" className="text-slate-300">صورة الغلاف</Label>
                <Input id="thumbnail_file" name="thumbnail_file" type="file" accept="image/*" className="cursor-pointer bg-black/20 border-white/10 file:bg-emerald-500/10 file:text-emerald-400 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-emerald-500/20 transition-all text-slate-400" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="price" className="text-slate-300">السعر (بالجنيه المصري)</Label>
                <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={course.price} dir="ltr" className="text-left bg-black/20 border-white/10 text-white" />
            </div>

            {state?.error && (
                <div className="text-sm font-medium text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    {state.error}
                </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                <Link href={`/dashboard/courses/${course.id}`}>
                    <Button type="button" variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/5">إلغاء</Button>
                </Link>
                <Button type="submit" disabled={isPending} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8">
                    {isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
            </div>
        </form>
    )
}