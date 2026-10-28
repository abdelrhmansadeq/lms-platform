import { Button } from '@/components/ui/button'
import { adminLogoutAction } from '../admin-login/actions'
import { ShieldAlert, LogOut } from 'lucide-react'
import { requireAdmin } from '@/lib/admin/require-admin'

export default async function AdminLayout({
                                              children,
                                          }: {
    children: React.ReactNode
}) {
    // 🛡️ التحقق الصارم (بيفك تشفير الكوكي ويتأكد إنها مش منتهية ولا متزورة)
    await requireAdmin()

    return (
        <div className="min-h-screen bg-[#0B0F17] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-75 bg-red-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 relative">

                {/* شريط التحكم العلوي */}
                <div className="mb-8 border border-red-500/20 bg-red-500/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                        <div>
                            <h1 className="text-xl font-bold text-red-500">غرفة التحكم المركزية (Root)</h1>
                            <p className="text-sm text-slate-400">هذه المنطقة معزولة تماماً عن حسابات المستخدمين.</p>
                        </div>
                    </div>

                    <form action={adminLogoutAction}>
                        <Button type="submit" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white gap-2">
                            <LogOut className="w-4 h-4" /> تسجيل خروج الأدمن
                        </Button>
                    </form>
                </div>

                {children}
            </div>
        </div>
    )
}