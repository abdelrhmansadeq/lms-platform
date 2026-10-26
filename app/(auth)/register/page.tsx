'use client'

import { useActionState } from 'react'
import { registerAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(registerAction, null)

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">إنشاء حساب جديد</CardTitle>
                    <CardDescription className="text-center">
                        انضم إلينا كمدرس أو طالب وابدأ رحلتك التعليمية
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form action={formAction} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="fullName">الاسم الكامل</Label>
                            <Input id="fullName" name="fullName" type="text" placeholder="عبدالرحمن صادق" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input id="email" name="email" type="email" placeholder="you@example.com" dir="ltr" className="text-left" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input id="password" name="password" type="password" dir="ltr" className="text-left" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">نوع الحساب</Label>
                            <select
                                id="role"
                                name="role"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="student">طالب</option>
                                <option value="instructor">مدرس</option>
                            </select>
                        </div>

                        {state?.error && (
                            <div className="text-sm font-medium text-red-500 text-center">
                                {state.error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                        </Button>

                    </form>
                </CardContent>

                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        لديك حساب بالفعل؟{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            تسجيل الدخول
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}