'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, User, LayoutDashboard, MessagesSquare } from 'lucide-react'

export function BottomNav({ role }: { role?: string }) {
    const pathname = usePathname()

    const links = [
        { href: '/', label: 'الرئيسية', icon: Home },
        { href: '/forum', label: 'المنتدى', icon: MessagesSquare },
        { href: '/my-courses', label: 'كورساتي', icon: BookOpen },
        { href: '/profile', label: 'حسابي', icon: User },
    ]

    if (role === 'instructor') {
        links.push({ href: '/dashboard', label: 'التحكم', icon: LayoutDashboard })
    }

    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
            <nav className="bg-[#0B0F17]/90 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-2xl flex justify-around items-center h-16 px-2">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
                                isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-500/10' : ''}`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            </div>
                            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {link.label}
              </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}