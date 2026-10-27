'use client'

import { useActionState, useEffect, useState } from 'react'
import { addAttachmentAction, deleteAttachmentAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Paperclip, Trash2, FileText, Image as ImageIcon, File, Download } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'

type Attachment = {
    id: string;
    title: string | null;
    file_name: string;
    file_url: string;
    file_type: string;
}

export function AttachmentManager({
                                      lessonId,
                                      courseId,
                                      lessonTitle,
                                      initialAttachments
                                  }: {
    lessonId: string,
    courseId: string,
    lessonTitle: string,
    initialAttachments: Attachment[]
}) {
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [state, formAction, isPending] = useActionState(addAttachmentAction, null)
    const router = useRouter()

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
            const form = document.getElementById(`upload-form-${lessonId}`) as HTMLFormElement
            if (form) form.reset()
            router.refresh()
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state, router, lessonId])

    const handleDelete = async (attachmentId: string) => {
        setIsDeleting(attachmentId)
        const res = await deleteAttachmentAction(attachmentId, courseId)
        if (res.error) toast.error(res.error)
        else {
            toast.success(res.success)
            router.refresh()
        }
        setIsDeleting(null)
    }

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />
        if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
        return <File className="w-5 h-5 text-gray-500" />
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
                                <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10 relative">
                                   <Paperclip className="w-4 h-4" />
                                   {initialAttachments.length > 0 && (
                                       <span className="absolute -top-1 -right-1 bg-primary text-[9px] text-white w-4 h-4 rounded-full flex items-center justify-center">
              {initialAttachments.length}
            </span>
                                   )}
                               </Button>
                           } />

            <DialogContent dir="rtl" className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>مرفقات الدرس</DialogTitle>
                    <DialogDescription>
                        إدارة الملفات المرفقة مع درس: {lessonTitle}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    <form id={`upload-form-${lessonId}`} action={formAction} className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
                        <input type="hidden" name="lessonId" value={lessonId} />
                        <input type="hidden" name="courseId" value={courseId} />

                        {/* خانة اسم المرفق الجديدة */}
                        <div className="space-y-2">
                            <Label>اسم المرفق</Label>
                            <Input
                                type="text"
                                name="title"
                                placeholder="مثال: سلايدات المحاضرة، كود التطبيق..."
                                required
                                className="bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>اختر الملف (PDF، صورة، ZIP...)</Label>
                            <Input
                                type="file"
                                name="file"
                                required
                                className="cursor-pointer file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-primary/20 transition-all bg-background"
                            />
                        </div>

                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? 'جاري الرفع...' : 'رفع المرفق'}
                        </Button>
                    </form>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm">الملفات المرفقة ({initialAttachments.length})</h4>
                        {initialAttachments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-lg border border-dashed">لا توجد مرفقات لهذا الدرس.</p>
                        ) : (
                            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
                                {initialAttachments.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                {getFileIcon(file.file_type)}
                                                <span className="text-sm font-bold truncate" title={file.title || file.file_name}>
                          {file.title || file.file_name}
                        </span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]" dir="ltr">
                        {file.file_name}
                      </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <a href={file.file_url} target="_blank" rel="noopener noreferrer" download>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </a>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(file.id)}
                                                disabled={isDeleting === file.id}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}