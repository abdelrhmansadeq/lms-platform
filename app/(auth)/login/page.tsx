'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, null)

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md shadow-lg border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
                    <CardDescription className="text-center">
                        أهلاً بك مجدداً، يرجى إدخال بياناتك للمتابعة
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form action={formAction} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input id="email" name="email" type="email" placeholder="you@example.com" dir="ltr" className="text-left" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input id="password" name="password" type="password" dir="ltr" className="text-left" required />
                        </div>

                        {state?.error && (
                            <div className="text-sm font-medium text-red-500 text-center bg-red-500/10 p-2 rounded">
                                {state.error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'جاري الدخول...' : 'تسجيل الدخول'}
                        </Button>

                    </form>
                </CardContent>

                <CardFooter className="flex justify-center border-t pt-6">
                    <p className="text-sm text-muted-foreground">
                        ليس لديك حساب؟{' '}
                        <Link href="/register" className="text-primary hover:underline">
                            إنشاء حساب جديد
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}