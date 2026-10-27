'use client'

import { useActionState } from 'react'
import { registerAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(registerAction, null)

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative overflow-hidden py-12">

            {/* 🌟 Glow Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />

            <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl animate-fade-up">
                <CardHeader className="space-y-1 text-center">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-6 h-6 text-emerald-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">إنشاء حساب جديد</CardTitle>
                    <CardDescription className="text-slate-400">
                        انضم إلينا كمدرس أو طالب وابدأ رحلتك التعليمية
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form action={formAction} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-slate-300">الاسم الكامل</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="عبدالرحمن صادق"
                                className="bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white placeholder:text-slate-500 h-11"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                dir="ltr"
                                className="text-left bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white placeholder:text-slate-500 h-11"
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
                                className="text-left bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white h-11"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-slate-300">نوع الحساب</Label>
                            <select
                                id="role"
                                name="role"
                                className="flex h-11 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="student" className="bg-[#0B0F17] text-white">طالب</option>
                                <option value="instructor" className="bg-[#0B0F17] text-white">مدرس</option>
                            </select>
                        </div>

                        {state?.error && (
                            <div className="text-sm font-medium text-red-400 text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                {state.error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)] transition-all mt-2"
                            disabled={isPending}
                        >
                            {isPending ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                        </Button>

                    </form>
                </CardContent>

                <CardFooter className="flex justify-center border-t border-white/5 pt-6 pb-6">
                    <p className="text-sm text-slate-400">
                        لديك حساب بالفعل؟{' '}
                        <Link href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                            تسجيل الدخول
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}