/* eslint-disable @next/next/no-img-element */
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/actions/auth'
import { LogOut, UserCircle2, Heart } from 'lucide-react'
import { NotificationsBell } from './notifications-bell'

export async function MobileHeader() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    let notifications = []

    if (user) {
        const { data } = await supabase.from('profiles').select('full_name, role, avatar_url').eq('id', user.id).single()
        profile = data

        const { data: notifs } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

        notifications = notifs || []
    }

    return (
        <header className="md:hidden sticky top-0 z-50 bg-[#0B0F17]/80 backdrop-blur-xl border-b border-white/5 shadow-lg">
            <div className="flex h-14 items-center justify-between px-4">
                <Link href="/" className="text-lg font-bold text-white tracking-tight">
                    منصة <span className="text-emerald-400">LMS</span>
                </Link>

                <div className="flex items-center gap-1">
                    {user ? (
                        <>
                            <Link href="/wishlist">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-white/5 h-9 w-9 rounded-full">
                                    <Heart className="w-5 h-5" />
                                </Button>
                            </Link>

                            {/* جرس الإشعارات (ضفنا currentUserId) */}
                            <NotificationsBell
                                initialNotifications={notifications}
                                currentUserId={user.id}
                            />

                            <Link href="/profile" className="flex items-center gap-2 ml-1">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                        {profile?.full_name?.charAt(0) || <UserCircle2 className="w-4 h-4" />}
                                    </div>
                                )}
                            </Link>
                            <form action={logoutAction}>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-white/5 h-8 w-8 ml-1">
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-300 hover:text-white">دخول</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="h-8 text-xs bg-emerald-500 text-black font-bold">حساب جديد</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}