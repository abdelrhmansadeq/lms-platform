'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { createQuizAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Clock } from 'lucide-react'

type Question = {
    text: string;
    options: string[];
    correctIndex: number;
};

export function QuizForm({ courseId }: { courseId: string }) {
    const [state, formAction, isPending] = useActionState(createQuizAction, null)
    const [title, setTitle] = useState('')
    const [duration, setDuration] = useState('0') // <-- ضفنا حالة للوقت
    const [questions, setQuestions] = useState<Question[]>([
        { text: '', options: ['', '', '', ''], correctIndex: 0 }
    ])

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }])
    }

    const removeQuestion = (index: number) => {
        if (questions.length === 1) return
        const newQuestions = [...questions]
        newQuestions.splice(index, 1)
        setQuestions(newQuestions)
    }

    const updateQuestionText = (index: number, text: string) => {
        const newQuestions = [...questions]
        newQuestions[index].text = text
        setQuestions(newQuestions)
    }

    const updateOption = (qIndex: number, optIndex: number, text: string) => {
        const newQuestions = [...questions]
        newQuestions[qIndex].options[optIndex] = text
        setQuestions(newQuestions)
    }

    const setCorrectOption = (qIndex: number, optIndex: number) => {
        const newQuestions = [...questions]
        newQuestions[qIndex].correctIndex = optIndex
        setQuestions(newQuestions)
    }

    return (
        <form action={formAction} className="space-y-8">
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="questions" value={JSON.stringify(questions)} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-300">عنوان الاختبار</Label>
                    <Input
                        id="title"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثال: اختبار الفصل الأول"
                        required
                        className="bg-black/20 border-white/10 text-white"
                    />
                </div>

                {/* خانة وقت الاختبار الجديدة */}
                <div className="space-y-2">
                    <Label htmlFor="duration_minutes" className="text-slate-300 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        مدة الاختبار (بالدقائق)
                    </Label>
                    <Input
                        id="duration_minutes"
                        name="duration_minutes"
                        type="number"
                        min="0"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="اتركه 0 إذا كان بدون وقت"
                        className="bg-black/20 border-white/10 text-white"
                    />
                    <p className="text-xs text-slate-500">سيتم تسليم الاختبار أوتوماتيكياً عند انتهاء الوقت.</p>
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q, qIndex) => (
                    <Card key={qIndex} className="relative border-white/5 bg-white/[0.02]">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-lg font-bold text-white">السؤال {qIndex + 1}</Label>
                                {questions.length > 1 && (
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeQuestion(qIndex)} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <Input
                                placeholder="نص السؤال هنا..."
                                value={q.text}
                                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                                required
                                className="bg-black/20 border-white/10 text-white"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name={`correct-${qIndex}`}
                                            checked={q.correctIndex === optIndex}
                                            onChange={() => setCorrectOption(qIndex, optIndex)}
                                            className="w-4 h-4 text-emerald-500 cursor-pointer bg-black/20 border-white/10"
                                            title="حدد الإجابة الصحيحة"
                                        />
                                        <Input
                                            placeholder={`الاختيار ${optIndex + 1}`}
                                            value={opt}
                                            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                            required
                                            className={`bg-black/20 border-white/10 text-white ${q.correctIndex === optIndex ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Button type="button" variant="outline" onClick={addQuestion} className="w-full border-dashed border-2 gap-2 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                <Plus className="w-4 h-4" /> إضافة سؤال آخر
            </Button>

            {state?.error && <p className="text-red-400 text-sm font-medium">{state.error}</p>}

            <div className="flex justify-end pt-4 border-t border-white/5">
                <Button type="submit" disabled={isPending} size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                    {isPending ? 'جاري الحفظ...' : 'حفظ الاختبار'}
                </Button>
            </div>
        </form>
    )
}