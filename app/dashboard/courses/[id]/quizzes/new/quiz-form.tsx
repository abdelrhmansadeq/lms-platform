'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { createQuizAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

type Question = {
    text: string;
    options: string[];
    correctIndex: number;
};

export function QuizForm({ courseId }: { courseId: string }) {
    const [state, formAction, isPending] = useActionState(createQuizAction, null)
    const [title, setTitle] = useState('')
    const [questions, setQuestions] = useState<Question[]>([
        { text: '', options: ['', '', '', ''], correctIndex: 0 }
    ])

    // إضافة سؤال جديد
    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }])
    }

    // مسح سؤال
    const removeQuestion = (index: number) => {
        if (questions.length === 1) return
        const newQuestions = [...questions]
        newQuestions.splice(index, 1)
        setQuestions(newQuestions)
    }

    // تحديث نص السؤال
    const updateQuestionText = (index: number, text: string) => {
        const newQuestions = [...questions]
        newQuestions[index].text = text
        setQuestions(newQuestions)
    }

    // تحديث الاختيارات
    const updateOption = (qIndex: number, optIndex: number, text: string) => {
        const newQuestions = [...questions]
        newQuestions[qIndex].options[optIndex] = text
        setQuestions(newQuestions)
    }

    // تحديد الإجابة الصحيحة
    const setCorrectOption = (qIndex: number, optIndex: number) => {
        const newQuestions = [...questions]
        newQuestions[qIndex].correctIndex = optIndex
        setQuestions(newQuestions)
    }

    return (
        <form action={formAction} className="space-y-8">
            <input type="hidden" name="courseId" value={courseId} />
            {/* بنحول الأسئلة لـ JSON ونبعتها في خانة مخفية */}
            <input type="hidden" name="questions" value={JSON.stringify(questions)} />

            <div className="space-y-2">
                <Label htmlFor="title">عنوان الاختبار</Label>
                <Input
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: اختبار الفصل الأول"
                    required
                />
            </div>

            <div className="space-y-6">
                {questions.map((q, qIndex) => (
                    <Card key={qIndex} className="relative border-primary/20 bg-muted/10">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-lg font-bold">السؤال {qIndex + 1}</Label>
                                {questions.length > 1 && (
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeQuestion(qIndex)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <Input
                                placeholder="نص السؤال هنا..."
                                value={q.text}
                                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name={`correct-${qIndex}`}
                                            checked={q.correctIndex === optIndex}
                                            onChange={() => setCorrectOption(qIndex, optIndex)}
                                            className="w-4 h-4 text-primary cursor-pointer"
                                            title="حدد الإجابة الصحيحة"
                                        />
                                        <Input
                                            placeholder={`الاختيار ${optIndex + 1}`}
                                            value={opt}
                                            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                            required
                                            className={q.correctIndex === optIndex ? 'border-primary' : ''}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Button type="button" variant="outline" onClick={addQuestion} className="w-full border-dashed border-2 gap-2">
                <Plus className="w-4 h-4" /> إضافة سؤال آخر
            </Button>

            {state?.error && <p className="text-red-500 text-sm font-medium">{state.error}</p>}

            <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" disabled={isPending} size="lg">
                    {isPending ? 'جاري الحفظ...' : 'حفظ الاختبار'}
                </Button>
            </div>
        </form>
    )
}