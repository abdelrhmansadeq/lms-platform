'use client'

import { useState } from 'react'
import { submitQuizAction } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { CheckCircle2, Award, AlertCircle, RotateCcw, Flag, Check } from 'lucide-react'
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
    const [flagged, setFlagged] = useState<Set<string>>(new Set())
    const [isPending, setIsPending] = useState(false)
    const [result, setResult] = useState<{ score: number, totalQuestions: number, percentage: number } | null>(null)

    const handleSelectOption = (questionId: string, optionIndex: number) => {
        setAnswers(prev => {
            const newAnswers = { ...prev }
            if (newAnswers[questionId] === optionIndex) {
                delete newAnswers[questionId]
            } else {
                newAnswers[questionId] = optionIndex
            }
            return newAnswers
        })
    }

    const toggleFlag = (questionId: string) => {
        setFlagged(prev => {
            const newFlagged = new Set(prev)
            if (newFlagged.has(questionId)) newFlagged.delete(questionId)
            else newFlagged.add(questionId)
            return newFlagged
        })
    }

    const scrollToQuestion = (questionId: string) => {
        const element = document.getElementById(`question-${questionId}`)
        if (element) {
            const yOffset = -120;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' })
        }
    }

    const handleSubmit = async () => {
        if (Object.keys(answers).length !== questions.length) {
            toast.error('يرجى الإجابة على جميع الأسئلة قبل التسليم')
            return
        }

        setIsPending(true)
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
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleRetake = () => {
        setAnswers({})
        setFlagged(new Set())
        setResult(null)
    }

    const answeredCount = Object.keys(answers).length
    const progressPercent = Math.round((answeredCount / questions.length) * 100)

    if (result) {
        return (
            <Card className="bg-white/[0.02] border-white/10 shadow-2xl animate-fade-up text-center pt-8 max-w-xl mx-auto backdrop-blur-xl">
                <CardContent className="space-y-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 ${result.percentage >= 50 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        {result.percentage >= 50 ? <Award className="w-12 h-12 text-emerald-400" /> : <AlertCircle className="w-12 h-12 text-red-400" />}
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold mb-2 text-white">النتيجة النهائية</h2>
                        <p className="text-slate-400">{quizTitle}</p>
                    </div>

                    <div className="bg-white/5 py-6 rounded-2xl border border-white/10">
                        <p className={`text-6xl font-extrabold mb-2 tracking-tighter ${result.percentage >= 50 ? 'text-emerald-400' : 'text-red-400'}`} dir="ltr">
                            {result.percentage}%
                        </p>
                        <p className="text-lg font-medium text-slate-300">
                            أجبت بشكل صحيح على <span className="font-bold text-white">{result.score}</span> من أصل <span className="font-bold text-white">{result.totalQuestions}</span>
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button onClick={handleRetake} variant="outline" className="w-full h-12 text-lg gap-2 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
                            <RotateCcw className="w-5 h-5" /> إعادة الاختبار
                        </Button>
                        <Link href={`/courses/${courseSlug}`}>
                            <Button size="lg" className="w-full h-12 text-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold">العودة للكورس</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6 animate-fade-up max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg sticky top-20 z-20">
                <h1 className="text-2xl font-bold mb-4 text-white">{quizTitle}</h1>

                <div className="flex flex-wrap gap-2 mb-4">
                    {questions.map((q, idx) => {
                        const isAnswered = answers[q.id] !== undefined
                        const isFlagged = flagged.has(q.id)
                        return (
                            <button
                                key={q.id}
                                onClick={() => scrollToQuestion(q.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${isAnswered ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-emerald-500/50'}
                  ${isFlagged ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#0B0F17]' : ''}
                `}
                            >
                                {idx + 1}
                            </button>
                        )
                    })}
                </div>

                <div className="flex justify-between items-center mb-2 text-sm font-medium">
                    <span className="text-slate-400">لقد أجبت على {answeredCount} من {questions.length} أسئلة</span>
                    <span className="text-emerald-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q, qIndex) => {
                    const isFlagged = flagged.has(q.id)
                    return (
                        <Card key={q.id} id={`question-${q.id}`} className={`bg-white/[0.02] border-white/5 shadow-sm transition-colors ${isFlagged ? 'border-yellow-400/30' : ''}`}>
                            <CardHeader className="flex flex-row items-start justify-between">
                                <CardTitle className="text-lg leading-relaxed flex items-start gap-3 text-right">
                                    <span className="text-emerald-400 font-bold shrink-0 mt-1">{qIndex + 1}.</span>
                                    <span className="text-white">{q.question_text}</span>
                                </CardTitle>
                                <button
                                    onClick={() => toggleFlag(q.id)}
                                    className={`p-2 rounded-full transition-colors shrink-0 ${isFlagged ? 'bg-yellow-400/10 text-yellow-400' : 'text-slate-500 hover:bg-white/5'}`}
                                    title="تعليم السؤال للرجوع إليه لاحقاً"
                                >
                                    <Flag className={`w-5 h-5 ${isFlagged ? 'fill-current' : ''}`} />
                                </button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {q.options.map((option, optIndex) => {
                                    const isSelected = answers[q.id] === optIndex
                                    return (
                                        <div
                                            key={optIndex}
                                            onClick={() => handleSelectOption(q.id, optIndex)}
                                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                                                isSelected
                                                    ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]'
                                                    : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-500 bg-transparent'
                                            }`}>
                                                {isSelected && <Check className="w-4 h-4 text-black" />}
                                            </div>
                                            <span className={`text-base transition-colors ${isSelected ? 'font-bold text-white' : 'text-slate-300'}`}>
                        {option}
                      </span>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="sticky bottom-20 md:bottom-6 pt-4">
                <Button
                    size="lg"
                    className="w-full shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)] gap-2 text-lg h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
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