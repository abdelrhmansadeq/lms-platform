'use client'

import { useState } from 'react'
import { submitQuizAction } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { CheckCircle2, ChevronLeft, Award, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

type Question = {
    id: string
    question_text: string
    options: string[]
}

export function QuizClient({
                               quizId,
                               quizTitle,
                               courseSlug,
                               questions
                           }: {
    quizId: string,
    quizTitle: string,
    courseSlug: string,
    questions: Question[]
}) {
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [isPending, setIsPending] = useState(false)
    const [result, setResult] = useState<{ score: number, totalQuestions: number, percentage: number } | null>(null)

    const handleSelectOption = (questionId: string, optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
    }

    const handleSubmit = async () => {
        // التأكد إن الطالب جاوب على كل الأسئلة
        if (Object.keys(answers).length !== questions.length) {
            toast.error('يرجى الإجابة على جميع الأسئلة قبل التسليم')
            return
        }

        setIsPending(true)

        // تجهيز الإجابات بالشكل اللي السيرفر مستنيه
        const formattedAnswers = Object.keys(answers).map(qId => ({
            questionId: qId,
            selectedOption: answers[qId]
        }))

        const res = await submitQuizAction(quizId, formattedAnswers)

        if (res.error) {
            toast.error(res.error)
            setIsPending(false)
        } else if (res.success) {
            setResult({
                score: res.score!,
                totalQuestions: res.totalQuestions!,
                percentage: res.percentage!
            })
            toast.success('تم تسليم الاختبار بنجاح')
        }
    }

    const answeredCount = Object.keys(answers).length
    const progressPercent = Math.round((answeredCount / questions.length) * 100)

    // --- شاشة النتيجة (بتظهر بعد التسليم) ---
    if (result) {
        return (
            <Card className="bg-card border-border shadow-xl animate-fade-up text-center pt-8">
                <CardContent className="space-y-6">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        {result.percentage >= 50 ? (
                            <Award className="w-12 h-12 text-primary" />
                        ) : (
                            <AlertCircle className="w-12 h-12 text-yellow-500" />
                        )}
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold mb-2">النتيجة النهائية</h2>
                        <p className="text-muted-foreground">{quizTitle}</p>
                    </div>

                    <div className="bg-muted py-6 rounded-xl border border-border">
                        <p className="text-5xl font-extrabold text-primary mb-2" dir="ltr">
                            {result.percentage}%
                        </p>
                        <p className="text-lg font-medium">
                            أجبت بشكل صحيح على <span className="text-primary font-bold">{result.score}</span> من أصل <span className="text-primary font-bold">{result.totalQuestions}</span>
                        </p>
                    </div>

                    <div className="pt-6">
                        <Link href={`/courses/${courseSlug}`}>
                            <Button size="lg" className="w-full">العودة للكورس</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // --- شاشة عرض الأسئلة ---
    return (
        <div className="space-y-6 animate-fade-up">
            {/* الهيدر وشريط التقدم */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm sticky top-20 z-10">
                <h1 className="text-2xl font-bold mb-4">{quizTitle}</h1>
                <div className="flex justify-between items-center mb-2 text-sm font-medium">
                    <span className="text-muted-foreground">لقد أجبت على {answeredCount} من {questions.length} أسئلة</span>
                    <span className="text-primary">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
            </div>

            {/* الأسئلة */}
            <div className="space-y-6">
                {questions.map((q, qIndex) => (
                    <Card key={q.id} className="bg-card border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg leading-relaxed">
                                <span className="text-primary font-bold ml-2">{qIndex + 1}.</span>
                                {q.question_text}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {q.options.map((option, optIndex) => {
                                const isSelected = answers[q.id] === optIndex
                                return (
                                    <div
                                        key={optIndex}
                                        onClick={() => handleSelectOption(q.id, optIndex)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                            isSelected
                                                ? 'border-primary bg-primary/5 shadow-inner'
                                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            isSelected ? 'border-primary' : 'border-muted-foreground'
                                        }`}>
                                            {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                                        </div>
                                        <span className={`text-base ${isSelected ? 'font-semibold text-primary' : ''}`}>
                      {option}
                    </span>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* زرار التسليم */}
            <div className="sticky bottom-20 md:bottom-6 pt-4">
                <Button
                    size="lg"
                    className="w-full shadow-lg gap-2 text-lg h-14"
                    onClick={handleSubmit}
                    disabled={isPending || answeredCount !== questions.length}
                >
                    {isPending ? 'جاري التصحيح...' : 'تسليم الاختبار'}
                    <CheckCircle2 className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}