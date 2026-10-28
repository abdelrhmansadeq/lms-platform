'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleBanUserAction, changeUserRoleAction } from './actions'
import { toast } from 'sonner'
import { Ban, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type AdminUser = {
    id: string;
    full_name: string | null;
    email: string;
    role: string;
    is_banned: boolean;
    avatar_url: string | null;
}

export function UserActions({ user }: { user: AdminUser }) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleBanToggle = async () => {
        setIsPending(true)
        const res = await toggleBanUserAction(user.id, user.is_banned)
        if (res.error) toast.error(res.error)
        else {
            toast.success(res.success)
            router.refresh()
        }
        setIsPending(false)
    }

    const handleRoleChange = async (newRole: string) => {
        if (newRole === user.role) return
        setIsPending(true)
        const res = await changeUserRoleAction(user.id, newRole)
        if (res.error) toast.error(res.error)
        else {
            toast.success(res.success)
            router.refresh()
        }
        setIsPending(false)
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <select
                className="bg-black/40 border border-white/10 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={isPending}
            >
                <option value="student" className="bg-[#0B0F17]">طالب</option>
                <option value="instructor" className="bg-[#0B0F17]">مدرس</option>
                <option value="admin" className="bg-[#0B0F17]">أدمن</option>
            </select>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleBanToggle}
                disabled={isPending}
                className={`h-8 w-8 ${user.is_banned ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'}`}
                title={user.is_banned ? 'إلغاء الحظر' : 'حظر المستخدم'}
            >
                {user.is_banned ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            </Button>
        </div>
    )
}