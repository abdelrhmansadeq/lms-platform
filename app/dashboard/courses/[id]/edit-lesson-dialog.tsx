'use client'

import { useActionState, useEffect, useState } from 'react'
import { updateLessonAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

type LessonData = {
    id: string;
    title: string;
    content: string | null;
    youtube_id: string;
};

export function EditLessonDialog({ lesson, courseId }: { lesson: LessonData, courseId: string }) {
    const [open, setOpen] = useState(false)
    const [state, formAction, isPending] = useActionState(updateLessonAction, null)

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
            setOpen(false) // إغلاق النافذة بعد النجاح
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
                                <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                                   <Pencil className="w-4 h-4" />
                               </Button>
                           } />

            <DialogContent dir="rtl" className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>تعديل الدرس</DialogTitle>
                    <DialogDescription>
                        قم بتحديث بيانات الدرس ثم اضغط حفظ.
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-4 pt-4">
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    <input type="hidden" name="courseId" value={courseId} />

                    <div className="space-y-2">
                        <Label htmlFor="title">عنوان الدرس</Label>
                        <Input id="title" name="title" defaultValue={lesson.title} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="youtube_id">رابط اليوتيوب أو الـ ID</Label>
                        <Input id="youtube_id" name="youtube_id" defaultValue={lesson.youtube_id} dir="ltr" className="text-left" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">ملاحظات أو محتوى (اختياري)</Label>
                        <Textarea id="content" name="content" defaultValue={lesson.content || ''} className="min-h-24" />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}