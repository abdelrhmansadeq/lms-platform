import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // جلب بيانات البروفايل
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">حسابي</CardTitle>
                    <CardDescription>
                        قم بتحديث بياناتك الشخصية من هنا.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm
                        profile={{
                            full_name: profile?.full_name || null,
                            email: user.email || '',
                            role: profile?.role || 'student'
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}