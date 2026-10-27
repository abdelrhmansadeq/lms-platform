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
                <Label className="text-slate-300">البريد الإلكتروني</Label>
                <Input
                    value={profile.email}
                    disabled
                    dir="ltr"
                    className="text-left bg-black/40 border-white/5 text-slate-500 cursor-not-allowed h-11"
                />
                <p className="text-xs text-slate-500">لا يمكن تغيير البريد الإلكتروني.</p>
            </div>

            <div className="space-y-2">
                <Label className="text-slate-300">نوع الحساب</Label>
                <Input
                    value={profile.role === 'instructor' ? 'مدرس' : 'طالب'}
                    disabled
                    className="bg-black/40 border-white/5 text-slate-500 cursor-not-allowed h-11"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="full_name" className="text-slate-300">الاسم الكامل</Label>
                <Input
                    id="full_name"
                    name="full_name"
                    defaultValue={profile.full_name || ''}
                    className="bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white h-11"
                    required
                />
            </div>

            {profile.role === 'instructor' && (
                <div className="space-y-2">
                    <Label htmlFor="bio" className="text-slate-300">نبذة عنك (Bio)</Label>
                    <Textarea
                        id="bio"
                        name="bio"
                        defaultValue={profile.bio || ''}
                        placeholder="اكتب نبذة مختصرة عن خبراتك..."
                        className="min-h-32 bg-black/20 border-white/10 focus-visible:ring-emerald-500 text-white placeholder:text-slate-500"
                    />
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-white/5">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-11 px-8 shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)]"
                >
                    {isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
            </div>

        </form>
    )
}