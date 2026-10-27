import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/actions/auth'
import { BottomNav } from './bottom-nav'
import { NotificationsBell } from './notifications-bell'

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    let notifications = []

    if (user) {
        // جلب البروفايل
        const { data } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
        profile = data

        // جلب أحدث 10 إشعارات
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
            <nav className="hidden md:block border-b bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">

                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-xl font-bold text-primary">
                            منصة LMS
                        </Link>

                        {user && (
                            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                                <Link href="/my-courses" className="hover:text-primary transition-colors">
                                    كورساتي
                                </Link>

                                <Link href="/forum" className="hover:text-primary transition-colors">
                                    المنتدى
                                </Link>

                                {profile?.role === 'instructor' && (
                                    <Link href="/dashboard" className="hover:text-primary transition-colors">
                                        لوحة التحكم
                                    </Link>
                                )}

                                <Link href="/profile" className="hover:text-primary transition-colors">
                                    حسابي
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {/* جرس الإشعارات */}
                                <NotificationsBell initialNotifications={notifications} />

                                <div className="text-sm text-left hidden sm:block border-r border-border pr-4">
                                    <p className="font-semibold">{profile?.full_name || user.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {profile?.role === 'instructor' ? 'مدرس' : 'طالب'}
                                    </p>
                                </div>
                                <form action={logoutAction}>
                                    <Button variant="outline" size="sm">
                                        تسجيل خروج
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">دخول</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">حساب جديد</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <BottomNav role={profile?.role} />
        </>
    )
}