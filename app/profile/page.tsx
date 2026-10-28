/* eslint-disable @next/next/no-img-element */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from './profile-form'
import { UserCircle2, Award } from 'lucide-react'
import { UserBadges } from '@/components/user-badges'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, bio, avatar_url')
        .eq('id', user.id)
        .single()

    // جلب شارات الطالب
    const { data: userBadgesData } = await supabase
        .from('user_badges')
        .select(`
      badges (id, name, description, icon_name, color)
    `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })

    const earnedBadges = (userBadgesData?.map((ub: any) => ub.badges) || []) as any[]

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl relative">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            <Card className="bg-white/[0.02] border-white/5 shadow-2xl animate-fade-up rounded-3xl backdrop-blur-xl overflow-hidden mb-8">
                <div className="bg-gradient-to-b from-emerald-500/10 to-transparent h-32 w-full absolute top-0 left-0 -z-10"></div>

                <CardHeader className="pt-10 pb-6 text-center border-b border-white/5 relative">
                    <div className="w-24 h-24 bg-[#0B0F17] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-emerald-400">
                {profile?.full_name?.charAt(0) || <UserCircle2 className="w-12 h-12" />}
              </span>
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">{profile?.full_name || 'مستخدم'}</CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                        {profile?.role === 'instructor' ? 'مدرس' : profile?.role === 'admin' ? 'أدمن' : 'طالب'}
                    </CardDescription>

                    {/* عرض الشارات في البروفايل */}
                    {earnedBadges.length > 0 && (
                        <div className="mt-6 flex flex-col items-center gap-2">
                            <p className="text-sm font-medium text-slate-300 flex items-center gap-1">
                                <Award className="w-4 h-4 text-emerald-400" /> إنجازاتي
                            </p>
                            <UserBadges badges={earnedBadges} size="md" />
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-8">
                    <ProfileForm
                        profile={{
                            full_name: profile?.full_name || null,
                            email: user.email || '',
                            role: profile?.role || 'student',
                            bio: profile?.bio || null,
                            avatar_url: profile?.avatar_url || null
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}