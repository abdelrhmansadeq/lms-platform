/* eslint-disable @next/next/no-img-element */
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
    avatar_url: string | null;
}

export function ProfileForm({ profile }: { profile: ProfileData }) {
    const [state, formAction, isPending] = useActionState(updateProfileAction, null)

    useEffect(() => {
        if (state?.success) toast.success(state.success)
        else if (state?.error) toast.error(state.error)
    }, [state])

    return (
        <form action={formAction} className="space-y-6">

            <div className="flex flex-col items-center gap-4 mb-6">
                {profile.avatar_url ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
                        <img
                            src={profile.avatar_url}
                            alt={profile.full_name || 'Profile'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-3xl font-bold">
                        {profile.full_name?.charAt(0) || '?'}
                    </div>
                )}

                <div className="w-full max-w-xs">
                    <Label htmlFor="avatar_file" className="text-slate-300 mb-2 block text-center">تغيير الصورة الشخصية</Label>
                    <Input
                        id="avatar_file"
                        name="avatar_file"
                        type="file"
                        accept="image/*"
                        className="cursor-pointer bg-black/20 border-white/10 file:bg-emerald-500/10 file:text-emerald-400 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-emerald-500/20 transition-all text-slate-400 h-11"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-slate-300">البريد الإلكتروني</Label>
                <Input
                    value={profile.email}
                    disabled
                    dir="ltr"
                    className="text-left bg-black/40 border-white/5 text-slate-500 cursor-not-allowed h-11"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-slate-300">نوع الحساب</Label>
                <Input
                    value={profile.role === 'instructor' ? 'مدرس' : profile.role === 'admin' ? 'أدمن' : 'طالب'}
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