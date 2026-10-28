import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE, verifyAdminToken } from './auth'

export async function requireAdmin() {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value
    if (!verifyAdminToken(token)) {
        redirect('/admin-login')
    }
}