'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteLessonAction, deleteCourseAction } from './actions'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

// زرار حذف الدرس
export function DeleteLessonButton({ lessonId, courseId }: { lessonId: string, courseId: string }) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsPending(true)
        const res = await deleteLessonAction(lessonId, courseId)
        if (res.error) toast.error(res.error)
        else {
            toast.success(res.success)
            router.refresh()
        }
        setIsPending(false)
    }

    return (
        <AlertDialog>
            {/* التعديل هنا: استخدام render بدل asChild */}
            <AlertDialogTrigger render={
                                     <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                } />

            <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد من حذف الدرس؟</AlertDialogTitle>
                    <AlertDialogDescription>
                        هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الدرس نهائيًا.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel render={<Button variant="outline">إلغاء</Button>} />
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        render={<Button variant="destructive">{isPending ? 'جاري الحذف...' : 'نعم، احذف'}</Button>}
                    />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// زرار حذف الكورس بالكامل
export function DeleteCourseButton({ courseId }: { courseId: string }) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsPending(true)
        const res = await deleteCourseAction(courseId)
        if (res.error) {
            toast.error(res.error)
            setIsPending(false)
        } else {
            toast.success(res.success)
            router.push('/dashboard')
        }
    }

    return (
        <AlertDialog>
            {/* التعديل هنا: استخدام render بدل asChild */}
            <AlertDialogTrigger render={
                                     <Button variant="destructive" size="sm">
                                        حذف الكورس
                                    </Button>
                                } />

            <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد من حذف الكورس بالكامل؟</AlertDialogTitle>
                    <AlertDialogDescription>
                        سيتم حذف الكورس وجميع الدروس والاشتراكات المرتبطة به نهائيًا. لا يمكن التراجع عن هذا الإجراء.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {/* التعديل هنا في الأزرار كمان عشان تتوافق مع Base UI */}
                    <AlertDialogCancel render={<Button variant="outline">إلغاء</Button>} />
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        render={<Button variant="destructive">{isPending ? 'جاري الحذف...' : 'نعم، احذف الكورس'}</Button>}
                    />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}