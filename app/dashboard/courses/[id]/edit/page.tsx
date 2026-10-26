import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EditCourseForm } from './edit-course-form'

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .eq('instructor_id', user.id)
        .single()

    if (!course) notFound()

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">تعديل بيانات الكورس</CardTitle>
                    <CardDescription>
                        قم بتحديث معلومات الكورس أدناه.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EditCourseForm course={course} />
                </CardContent>
            </Card>
        </div>
    )
}