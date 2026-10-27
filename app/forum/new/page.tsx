import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NewPostForm } from './new-post-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewPostPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <Card className="animate-fade-up">
                <CardHeader>
                    <CardTitle className="text-2xl">إنشاء موضوع جديد</CardTitle>
                    <CardDescription>اطرح سؤالك أو شاركنا شيئاً مفيداً.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NewPostForm />
                </CardContent>
            </Card>
        </div>
    )
}