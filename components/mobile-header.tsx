import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/actions/auth'
import { LogOut, UserCircle2 } from 'lucide-react'
import { NotificationsBell } from './notifications-bell'

export async function MobileHeader() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    let notifications = []

    if (user) {
        const { data } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
        profile = data

        // جلب أحدث 5 إشعارات للموبايل (عشان الأداء)
        const { data: notifs } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

        notifications = notifs || []
    }

    return (
        <header className="md:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
            <div className="flex h-14 items-center justify-between px-4">
                {/* اللوجو */}
                <Link href="/" className="text-lg font-bold text-primary">
                    منصة LMS
                </Link>

                {/* أزرار المستخدم */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            {/* جرس الإشعارات */}
                            <NotificationsBell initialNotifications={notifications} />

                            <Link href="/profile" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                    {profile?.full_name?.charAt(0) || <UserCircle2 className="w-5 h-5" />}
                                </div>
                            </Link>
                            <form action={logoutAction}>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 h-8 w-8">
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="h-8 text-xs">دخول</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="h-8 text-xs">حساب جديد</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}