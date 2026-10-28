import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()

    // 🛡️ الحماية القصوى للوحة الإدارة (فحص وجود الكوكي فقط)
    if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin-login')) {
        const token = request.cookies.get('admin_session')?.value

        // لو الكوكي مش موجودة أصلاً، نطرده
        if (!token) {
            url.pathname = '/admin-login'
            return NextResponse.redirect(url)
        }
    }

    // تحديث سيشن المنصة العادي (للطلاب والمدرسين)
    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}