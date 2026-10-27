/* eslint-disable @next/next/no-img-element */
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/actions/auth'
import { BottomNav } from './bottom-nav'
import { NotificationsBell } from './notifications-bell'
import { UserCircle2 } from 'lucide-react'

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    let notifications = []

    if (user) {
        // ضفنا avatar_url هنا
        const { data } = await supabase.from('profiles').select('full_name, role, avatar_url').eq('id', user.id).single()
        profile = data

        const { data: notifs } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        notifications = notifs || []
    }

    return (
        <>
            <nav className="hidden md:block border-b border-white/5 bg-[#0B0F17]/80 backdrop-blur-xl shadow-lg sticky top-0 z-50">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">

                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-bold tracking-tight text-white">
                            منصة <span className="text-emerald-400">LMS</span>
                        </Link>

                        {user && (
                            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
                                <Link href="/my-courses" className="hover:text-emerald-400 transition-colors">كورساتي</Link>
                                <Link href="/forum" className="hover:text-emerald-400 transition-colors">المنتدى</Link>
                                <Link href="/wishlist" className="hover:text-emerald-400 transition-colors flex items-center gap-1">المفضلة</Link>
                                {profile?.role === 'instructor' && (
                                    <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">لوحة التحكم</Link>
                                )}
                                <Link href="/profile" className="hover:text-emerald-400 transition-colors">حسابي</Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <NotificationsBell initialNotifications={notifications} />

                                {/* عرض الصورة الشخصية */}
                                <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                                    <div className="text-sm text-left hidden sm:block">
                                        <p className="font-semibold text-white">{profile?.full_name || user.email}</p>
                                        <p className="text-xs text-emerald-400">{profile?.role === 'instructor' ? 'مدرس' : 'طالب'}</p>
                                    </div>
                                    <Link href="/profile">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/20 hover:border-emerald-500 transition-colors" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold hover:bg-emerald-500/20 transition-colors">
                                                {profile?.full_name?.charAt(0) || <UserCircle2 className="w-5 h-5" />}
                                            </div>
                                        )}
                                    </Link>
                                </div>

                                <form action={logoutAction}>
                                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
                                        تسجيل خروج
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/login"><Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/5">دخول</Button></Link>
                                <Link href="/register"><Button size="sm" className="bg-emerald-500 text-black font-bold hover:bg-emerald-400">حساب جديد</Button></Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <BottomNav role={profile?.role} />
        </>
    )
}