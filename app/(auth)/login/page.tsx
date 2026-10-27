'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, null)

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative overflow-hidden">

            {/* 🌟 Glow Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />

            <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl animate-fade-up">
                <CardHeader className="space-y-1 text-center">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LogIn className="w-6 h-6 text-emerald-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">تسجيل الدخول</CardTitle>
                    <CardDescription className="text-slate-400">
                        أهلاً بك مجدداً، يرجى إدخال بياناتك للمتابعة
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form action={formAction} className="space-y-5">

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

                        {state?.error && (
                            <div className="text-sm font-medium text-red-400 text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                {state.error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)] transition-all"
                            disabled={isPending}
                        >
                            {isPending ? 'جاري الدخول...' : 'تسجيل الدخول'}
                        </Button>

                    </form>
                </CardContent>

                <CardFooter className="flex justify-center border-t border-white/5 pt-6 pb-6">
                    <p className="text-sm text-slate-400">
                        ليس لديك حساب؟{' '}
                        <Link href="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                            إنشاء حساب جديد
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}