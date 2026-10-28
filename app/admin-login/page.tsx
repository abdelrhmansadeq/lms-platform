'use client'

import { useActionState } from 'react'
import { adminLoginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'

export default function AdminLoginPage() {
    const [state, formAction, isPending] = useActionState(adminLoginAction, null)

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#0B0F17] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-75 bg-red-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-red-500/20 shadow-2xl rounded-3xl animate-fade-up">
                <CardHeader className="space-y-1 text-center">
                    <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">منطقة الإدارة العليا</CardTitle>
                    <CardDescription className="text-slate-400">
                        هذه المنطقة مخصصة لمالك المنصة فقط. يرجى إدخال بيانات الاعتماد.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form action={formAction} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-300">اسم المستخدم (Admin)</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                dir="ltr"
                                className="text-left bg-black/50 border-white/10 focus-visible:ring-red-500 text-white h-11"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">كلمة المرور</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                dir="ltr"
                                className="text-left bg-black/50 border-white/10 focus-visible:ring-red-500 text-white h-11"
                                required
                            />
                        </div>

                        {state?.error && (
                            <div className="text-sm font-medium text-red-400 text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                {state.error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all mt-2"
                            disabled={isPending}
                        >
                            {isPending ? 'جاري التحقق...' : 'دخول آمن'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}