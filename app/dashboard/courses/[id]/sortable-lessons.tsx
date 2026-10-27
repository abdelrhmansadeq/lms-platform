'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updateLessonOrderAction } from './actions'
import { GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { AttachmentManager } from './attachment-manager'
import { EditLessonDialog } from './edit-lesson-dialog'
import { DeleteLessonButton } from './delete-buttons'

// التعديل هنا: ضفنا content عشان يطابق النوع بتاع edit-lesson-dialog
type Lesson = {
    id: string;
    title: string;
    content: string | null;
    youtube_id: string;
    position: number;
};

type Attachment = {
    id: string;
    lesson_id: string;
    title: string | null;
    file_name: string;
    file_url: string;
    file_type: string;
};

function SortableLessonItem({
                                lesson,
                                courseId,
                                attachments
                            }: {
    lesson: Lesson,
    courseId: string,
    attachments: Attachment[]
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center justify-between p-4 border border-white/5 rounded-2xl bg-white/2 hover:bg-white/5 transition-colors ${isDragging ? 'border-emerald-500/50 shadow-2xl bg-white/10' : ''}`}
        >
            <div className="flex items-center gap-4">
                {/* أيقونة السحب */}
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-2 text-slate-500 hover:text-white transition-colors">
                    <GripVertical className="w-5 h-5" />
                </div>

                <div className="w-10 h-10 rounded-full bg-[#0B0F17] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 transition-colors">
                    <span className="text-sm font-bold text-slate-400 group-hover:text-emerald-400">{lesson.position}</span>
                </div>

                <div>
                    <p className="font-bold text-slate-200 line-clamp-1">{lesson.title}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1" dir="ltr">ID: {lesson.youtube_id}</p>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                <AttachmentManager
                    lessonId={lesson.id}
                    courseId={courseId}
                    lessonTitle={lesson.title}
                    initialAttachments={attachments}
                />
                {/* التعديل هنا: بنبعت الـ lesson كامل بالـ content بتاعه */}
                <EditLessonDialog lesson={lesson} courseId={courseId} />
                <DeleteLessonButton lessonId={lesson.id} courseId={courseId} />
            </div>
        </div>
    )
}

export function SortableLessonsList({
                                        initialLessons,
                                        courseId,
                                        allAttachments
                                    }: {
    initialLessons: Lesson[],
    courseId: string,
    allAttachments: Attachment[]
}) {
    const [lessons, setLessons] = useState(initialLessons)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        setLessons(initialLessons)
    }, [initialLessons])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = lessons.findIndex(l => l.id === active.id)
            const newIndex = lessons.findIndex(l => l.id === over.id)

            const newLessons = arrayMove(lessons, oldIndex, newIndex).map((lesson, index) => ({
                ...lesson,
                position: index + 1
            }))

            setLessons(newLessons)
            setIsUpdating(true)

            const updates = newLessons.map(l => ({ id: l.id, position: l.position }))
            const res = await updateLessonOrderAction(courseId, updates)

            if (res.error) {
                toast.error('حدث خطأ أثناء حفظ الترتيب')
                setLessons(initialLessons)
            } else {
                toast.success('تم تحديث ترتيب الدروس')
            }
            setIsUpdating(false)
        }
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div className={`space-y-2 ${isUpdating ? 'pointer-events-none opacity-70' : ''}`}>
                    {lessons.map((lesson) => {
                        const lessonAttachments = allAttachments.filter(a => a.lesson_id === lesson.id)
                        return (
                            <SortableLessonItem
                                key={lesson.id}
                                lesson={lesson}
                                courseId={courseId}
                                attachments={lessonAttachments}
                            />
                        )
                    })}
                </div>
            </SortableContext>
        </DndContext>
    )
}