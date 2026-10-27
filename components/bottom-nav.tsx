'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, User, LayoutDashboard, MessagesSquare } from 'lucide-react'

export function BottomNav({ role }: { role?: string }) {
    const pathname = usePathname()

    const links = [
        { href: '/', label: 'الرئيسية', icon: Home },
        { href: '/forum', label: 'المنتدى', icon: MessagesSquare }, // ضفنا المنتدى هنا
        { href: '/my-courses', label: 'كورساتي', icon: BookOpen },
        { href: '/profile', label: 'حسابي', icon: User },
    ]

    if (role === 'instructor') {
        links.push({ href: '/dashboard', label: 'التحكم', icon: LayoutDashboard })
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border pb-safe">
            <nav className="flex justify-around items-center h-16 px-2">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <div className={`p-1 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
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