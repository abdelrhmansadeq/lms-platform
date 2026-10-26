/* eslint-disable @next/next/no-img-element */
'use client'

import { useActionState } from 'react'
import { updateCourseAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="courseId" value={course.id} />

            <div className="space-y-2">
                <Label htmlFor="title">عنوان الكورس</Label>
                <Input id="title" name="title" defaultValue={course.title} required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">وصف الكورس</Label>
                <Textarea id="description" name="description" defaultValue={course.description || ''} className="min-h-32" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="thumbnail_file">صورة الغلاف</Label>

                {course.thumbnail_url && (
                    <div className="mb-4 w-48 h-28 rounded-md overflow-hidden border bg-zinc-100">
                        <img src={course.thumbnail_url} alt="صورة الكورس الحالية" className="w-full h-full object-cover" />
                    </div>
                )}

                <Input
                    id="thumbnail_file"
                    name="thumbnail_file"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer file:text-primary file:font-semibold"
                />
                <p className="text-xs text-muted-foreground">اختر صورة جديدة إذا كنت تريد تغيير الصورة الحالية.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="price">السعر (بالجنيه المصري)</Label>
                <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={course.price} dir="ltr" className="text-left" />
            </div>

            {state?.error && (
                <div className="text-sm font-medium text-red-500">
                    {state.error}
                </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
                <Link href={`/dashboard/courses/${course.id}`}>
                    <Button type="button" variant="outline">إلغاء</Button>
                </Link>
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
            </div>
        </form>
    )
}