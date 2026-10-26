import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * طبق الـ middleware على كل المسارات ما عدا:
         * - _next/static (ملفات ستاتيك)
         * - _next/image (صور)
         * - favicon.ico (أيقونة الموقع)
         * - ملفات الصور
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}