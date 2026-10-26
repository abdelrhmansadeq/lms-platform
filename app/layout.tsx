import type { Metadata } from 'next'
import { Inter, IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Toaster } from 'sonner'

// تحميل الخطوط مع تفعيل display: swap
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['arabic'],
    variable: '--font-ibm-plex-arabic',
    display: 'swap'
})

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
        <body className={`${inter.variable} ${ibmPlexArabic.variable} font-sans bg-background text-foreground min-h-screen flex flex-col antialiased`}>
        <Navbar />
        <main className="flex-1">
            {children}
        </main>
        <Toaster position="top-center" richColors />
        </body>
        </html>
    )
}