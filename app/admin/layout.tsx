import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
                                              children,
                                          }: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // لو مش أدمن، نطرده للصفحة الرئيسية
    if (profile?.role !== 'admin') {
        redirect('/')
    }

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-200 h-75 bg-red-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="mb-8 border-b border-white/5 pb-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-red-500">🛡️</span> لوحة الإدارة العليا
                </h1>
                <p className="text-slate-400 mt-2">مرحباً بك يا مالك المنصة. من هنا يمكنك التحكم في كل شيء.</p>
            </div>

            {children}
        </div>
    )
}