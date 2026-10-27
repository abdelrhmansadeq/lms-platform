import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from './profile-form'
import { UserCircle2 } from 'lucide-react'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, bio')
        .eq('id', user.id)
        .single()

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl relative">

            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            <Card className="bg-white/[0.02] border-white/5 shadow-2xl animate-fade-up rounded-3xl backdrop-blur-xl overflow-hidden">
                <div className="bg-gradient-to-b from-emerald-500/10 to-transparent h-32 w-full absolute top-0 left-0 -z-10"></div>

                <CardHeader className="pt-10 pb-6 text-center border-b border-white/5">
                    <div className="w-20 h-20 bg-[#0B0F17] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
            <span className="text-3xl font-bold text-emerald-400">
              {profile?.full_name?.charAt(0) || <UserCircle2 className="w-10 h-10" />}
            </span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">حسابي</CardTitle>
                    <CardDescription className="text-slate-400 mt-2">
                        قم بتحديث بياناتك الشخصية من هنا.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                    <ProfileForm
                        profile={{
                            full_name: profile?.full_name || null,
                            email: user.email || '',
                            role: profile?.role || 'student',
                            bio: profile?.bio || null
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}