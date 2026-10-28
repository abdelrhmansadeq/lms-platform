import { createHmac, timingSafeEqual, randomBytes } from 'crypto'

const SECRET = process.env.ADMIN_SESSION_SECRET!
const TOKEN_TTL_MS = 60 * 60 * 1000 // ساعة واحدة
export const ADMIN_COOKIE = 'admin_session'

type Payload = { role: 'admin'; exp: number; nonce: string }

export function signAdminToken(): string {
    const payload: Payload = {
        role: 'admin',
        exp: Date.now() + TOKEN_TTL_MS,
        nonce: randomBytes(16).toString('hex'),
    }
    const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const sig = createHmac('sha256', SECRET).update(b64).digest('base64url')
    return `${b64}.${sig}`
}

export function verifyAdminToken(token: string | undefined | null): boolean {
    if (!token || typeof token !== 'string') return false
    const parts = token.split('.')
    if (parts.length !== 2) return false
    const [b64, sig] = parts

    let expected: string
    try {
        expected = createHmac('sha256', SECRET).update(b64).digest('base64url')
    } catch { return false }

    const sigBuf = Buffer.from(sig, 'base64url')
    const expBuf = Buffer.from(expected, 'base64url')

    if (sigBuf.length !== expBuf.length) return false
    if (!timingSafeEqual(sigBuf, expBuf)) return false

    try {
        const payload: Payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'))
        return payload.role === 'admin' && payload.exp > Date.now()
    } catch { return false }
}

export function safeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a, 'utf8')
    const bb = Buffer.from(b, 'utf8')
    if (ab.length !== bb.length) {
        timingSafeEqual(ab, ab) // للتخلص من الـ timing attack
        return false
    }
    return timingSafeEqual(ab, bb)
}