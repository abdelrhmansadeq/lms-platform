import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()

    // 🛡️ الحماية القصوى للوحة الإدارة (مسار /admin)
    if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin-login')) {
        const adminSession = request.cookies.get('admin_session')?.value

        // لو مفيش كوكي إدارة صالح، نطرده لصفحة اللوجين السرية
        if (!adminSession || adminSession !== 'authenticated') {
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