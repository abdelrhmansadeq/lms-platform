import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizForm } from './quiz-form'

export default async function NewQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="max-w-3xl mx-auto">
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="text-2xl">إضافة اختبار جديد</CardTitle>
                    <CardDescription>أضف عنوان الاختبار والأسئلة الخاصة به.</CardDescription>
                </CardHeader>
                <CardContent>
                    <QuizForm courseId={id} />
                </CardContent>
            </Card>
        </div>
    )
}