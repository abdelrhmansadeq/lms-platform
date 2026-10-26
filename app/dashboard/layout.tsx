import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // التأكد من وجود مستخدم
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // التأكد من أن المستخدم مدرس
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'instructor') {
        // لو طالب، نرجعه للصفحة الرئيسية
        redirect('/')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">لوحة تحكم المدرس</h1>
                <p className="text-muted-foreground">إدارة كورساتك ودروسك من هنا</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-lg border p-6 min-h-[50vh]">
                {children}
            </div>
        </div>
    )
}