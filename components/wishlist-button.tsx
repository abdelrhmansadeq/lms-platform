'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleWishlistAction } from '@/app/wishlist/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function WishlistButton({
                                   courseId,
                                   initialIsWishlisted,
                                   isLoggedIn
                               }: {
    courseId: string
    initialIsWishlisted: boolean
    isLoggedIn: boolean
}) {
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault() // عشان ميفتحش صفحة الكورس
        e.stopPropagation()

        if (!isLoggedIn) {
            toast.error('يجب تسجيل الدخول أولاً لإضافة الكورس للمفضلة')
            router.push('/login')
            return
        }

        // تحديث متفائل (بيغير لون القلب فورًا عشان اليوزر ميستناش)
        setIsWishlisted(!isWishlisted)
        setIsPending(true)

        const res = await toggleWishlistAction(courseId, isWishlisted)

        if (res.error) {
            setIsWishlisted(isWishlisted) // رجع الحالة القديمة لو حصل خطأ
            toast.error(res.error)
        } else {
            toast.success(res.success)
        }

        setIsPending(false)
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`absolute top-3 left-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
                isWishlisted
                    ? 'bg-red-500/90 text-white hover:bg-red-600'
                    : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
            }`}
            title={isWishlisted ? 'إزالة من المفضلة' : 'أضف للمفضلة'}
        >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
    )
}