'use client'

import { useActionState } from 'react'
import { createCourseAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function NewCoursePage() {
    const [state, formAction, isPending] = useActionState(createCourseAction, null)

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">إنشاء كورس جديد</CardTitle>
                    <CardDescription>
                        أدخل تفاصيل الكورس. يمكنك إضافة الدروس بعد إنشاء الكورس.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form action={formAction} className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="title">عنوان الكورس</Label>
                            <Input id="title" name="title" placeholder="مثال: دورة تعلم Next.js من الصفر" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">وصف الكورس</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="اكتب وصفاً مختصراً عن محتوى الكورس وأهدافه..."
                                className="min-h-32"
                            />
                        </div>

                        {/* خانة رابط الصورة الجديدة */}
                        <div className="space-y-2">
                            <Label htmlFor="thumbnail_url">رابط صورة الغلاف (اختياري)</Label>
                            <Input
                                id="thumbnail_url"
                                name="thumbnail_url"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                dir="ltr"
                                className="text-left"
                            />
                            <p className="text-xs text-muted-foreground">يمكنك رفع صورة على موقع مثل ImgBB ونسخ الرابط المباشر هنا.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">السعر (بالجنيه المصري)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                dir="ltr"
                                className="text-left"
                                defaultValue="0"
                            />
                            <p className="text-xs text-muted-foreground">اتركه 0 إذا كان الكورس مجانياً.</p>
                        </div>

                        {state?.error && (
                            <div className="text-sm font-medium text-red-500">
                                {state.error}
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-4">
                            <Link href="/dashboard">
                                <Button type="button" variant="outline">إلغاء</Button>
                            </Link>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'جاري الحفظ...' : 'حفظ الكورس'}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}