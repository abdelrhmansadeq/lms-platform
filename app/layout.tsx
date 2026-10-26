import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'منصة LMS التعليمية',
    description: 'منصة لرفع ومشاهدة الكورسات والدروس',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ar" dir="rtl">
        <body className={`${inter.className} bg-gray-50 dark:bg-zinc-950 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">
            {children}
        </main>
        <Toaster position="top-center" richColors />
        </body>
        </html>
    )
}