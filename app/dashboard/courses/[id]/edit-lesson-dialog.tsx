'use client'

import { useActionState, useEffect, useState } from 'react'
import { updateLessonAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { RichTextEditor } from '@/components/rich-text-editor'

type LessonData = {
    id: string;
    title: string;
    content: string | null;
    youtube_id: string;
};

export function EditLessonDialog({ lesson, courseId }: { lesson: LessonData, courseId: string }) {
    const [open, setOpen] = useState(false)
    const [state, formAction, isPending] = useActionState(updateLessonAction, null)
    const [content, setContent] = useState(lesson.content || '')

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
            setOpen(false)
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
                                <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                   <Pencil className="w-4 h-4" />
                               </Button>
                           } />

            <DialogContent dir="rtl" className="sm:max-w-[600px] bg-[#0B0F17] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">تعديل الدرس</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        قم بتحديث بيانات الدرس ثم اضغط حفظ.
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-4 pt-4">
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    <input type="hidden" name="courseId" value={courseId} />

                    <div className="space-y-2">
                        <Label className="text-slate-300">عنوان الدرس</Label>
                        <Input id="title" name="title" defaultValue={lesson.title} required className="bg-black/20 border-white/10 text-white" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300">رابط اليوتيوب أو الـ ID</Label>
                        <Input id="youtube_id" name="youtube_id" defaultValue={lesson.youtube_id} dir="ltr" className="text-left bg-black/20 border-white/10 text-white" required />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300">ملاحظات أو محتوى (اختياري)</Label>
                        <RichTextEditor content={content} onChangeAction={setContent} /> {/* <--- التعديل هنا */}
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent border-white/10 text-white hover:bg-white/5">إلغاء</Button>
                        <Button type="submit" disabled={isPending} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                            {isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}