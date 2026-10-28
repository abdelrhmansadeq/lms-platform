'use client'

import { useActionState, useEffect } from 'react'
import { createPostAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function NewPostForm() {
    const [state, formAction, isPending] = useActionState(createPostAction, null)

    useEffect(() => {
        if (state?.error) toast.error(state.error)
    }, [state])

    return (
        <form action={formAction} className="space-y-6">

            <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">عنوان الموضوع</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="مثال: مشكلة في إعداد Next.js"
                    required
                    className="text-lg bg-black/20 border-white/10 text-white"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="content" className="text-slate-300">تفاصيل الموضوع</Label>
                <Textarea
                    id="content"
                    name="content"
                    placeholder="اكتب تفاصيل سؤالك أو الموضوع هنا..."
                    className="min-h-40 bg-black/20 border-white/10 text-white"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="image" className="text-slate-300">إرفاق صورة (اختياري)</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="cursor-pointer file:bg-emerald-500/10 file:text-emerald-400 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-emerald-500/20 transition-all bg-black/20 border-white/10 text-slate-400"
                    />
                </div>
                <p className="text-xs text-slate-500">يمكنك إرفاق صورة توضيحية للمشكلة (بحد أقصى 5 ميجا).</p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                    {isPending ? 'جاري النشر...' : 'نشر الموضوع'}
                </Button>
            </div>

        </form>
    )
}