'use client'

import { useActionState, useEffect } from 'react'
import { updateProfileAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type ProfileData = {
    full_name: string | null;
    email: string;
    role: string;
    bio: string | null;
}

export function ProfileForm({ profile }: { profile: ProfileData }) {
    const [state, formAction, isPending] = useActionState(updateProfileAction, null)

    useEffect(() => {
        if (state?.success) toast.success(state.success)
        else if (state?.error) toast.error(state.error)
    }, [state])

    return (
        <form action={formAction} className="space-y-6">

            <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input value={profile.email} disabled dir="ltr" className="text-left bg-zinc-100 dark:bg-zinc-900 cursor-not-allowed" />
            </div>

            <div className="space-y-2">
                <Label>نوع الحساب</Label>
                <Input value={profile.role === 'instructor' ? 'مدرس' : 'طالب'} disabled className="bg-zinc-100 dark:bg-zinc-900 cursor-not-allowed" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="full_name">الاسم الكامل</Label>
                <Input id="full_name" name="full_name" defaultValue={profile.full_name || ''} required />
            </div>

            {/* خانة النبذة (تظهر للمدرس بس) */}
            {profile.role === 'instructor' && (
                <div className="space-y-2">
                    <Label htmlFor="bio">نبذة عنك (Bio)</Label>
                    <Textarea
                        id="bio"
                        name="bio"
                        defaultValue={profile.bio || ''}
                        placeholder="اكتب نبذة مختصرة عن خبراتك ومؤهلاتك التعليمية..."
                        className="min-h-32"
                    />
                    <p className="text-xs text-muted-foreground">هذه النبذة ستظهر للطلاب في صفحتك الشخصية.</p>
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
            </div>

        </form>
    )
}