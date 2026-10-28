'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { addLessonNoteAction, deleteLessonNoteAction } from './actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { FileText, Plus, Trash2, PlayCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Note = {
    id: string
    content: string
    timestamp_seconds: number
    created_at: string
}

// دالة بتنسيق الوقت (مثلاً 125 ثانية تبقى 2:05)
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
}

export function NotesSection({
                                 lessonId,
                                 initialNotes,
                                 currentTime,
                                 onSeek
                             }: {
    lessonId: string;
    initialNotes: Note[];
    currentTime: number;
    onSeek: (time: number) => void;
}) {
    const [state, formAction, isPending] = useActionState(addLessonNoteAction, null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
            formRef.current?.reset()
            router.refresh()
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state, router])

    const handleDelete = async (noteId: string) => {
        setIsDeleting(noteId)
        const res = await deleteLessonNoteAction(noteId)
        if (res.error) toast.error(res.error)
        else {
            toast.success(res.success)
            router.refresh()
        }
        setIsDeleting(null)
    }

    return (
        <div className="mt-8 pt-8 border-t border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-emerald-400" /> مذكراتي ({initialNotes.length})
            </h3>

            <form ref={formRef} action={formAction} className="mb-6 space-y-3">
                <input type="hidden" name="lessonId" value={lessonId} />
                {/* بنبعت الوقت الحالي مع الملاحظة */}
                <input type="hidden" name="timestampSeconds" value={Math.floor(currentTime)} />

                <div className="relative">
                    <Textarea
                        name="content"
                        placeholder={`اكتب ملاحظة عند الدقيقة ${formatTime(currentTime)}...`}
                        className="min-h-20 bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white placeholder:text-slate-500 pr-24"
                        required
                    />
                    <div className="absolute left-2 top-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-md">
                        {formatTime(currentTime)}
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isPending} className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                        <Plus className="w-4 h-4" />
                        {isPending ? 'جاري الحفظ...' : 'حفظ الملاحظة'}
                    </Button>
                </div>
            </form>

            <div className="space-y-3">
                {initialNotes.length === 0 ? (
                    <p className="text-center py-6 text-slate-500 bg-white/2 rounded-2xl border border-white/5 border-dashed">
                        لا توجد مذكرات بعد. ابدأ بتدوين الملاحظات أثناء المشاهدة!
                    </p>
                ) : (
                    initialNotes.map((note) => (
                        <div key={note.id} className="flex gap-3 p-4 bg-white/2 border border-white/5 rounded-2xl group">
                            {/* زرار الانتقال للوقت */}
                            <button
                                onClick={() => onSeek(note.timestamp_seconds)}
                                className="flex flex-col items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0 hover:bg-emerald-500 hover:text-black text-emerald-400 transition-colors cursor-pointer"
                                title="الانتقال إلى هذه اللحظة"
                            >
                                <PlayCircle className="w-4 h-4 mb-1" />
                                <span className="text-xs font-bold" dir="ltr">{formatTime(note.timestamp_seconds)}</span>
                            </button>

                            <div className="flex-1">
                                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                <p className="text-[10px] text-slate-500 mt-2">{new Date(note.created_at).toLocaleDateString('ar-EG')}</p>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 self-start"
                                onClick={() => handleDelete(note.id)}
                                disabled={isDeleting === note.id}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}