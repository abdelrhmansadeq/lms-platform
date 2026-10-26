import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SearchX } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <SearchX className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">404 - الصفحة غير موجودة</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
                عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. تأكد من الرابط أو عد للصفحة الرئيسية.
            </p>
            <Link href="/">
                <Button size="lg">العودة للصفحة الرئيسية</Button>
            </Link>
        </div>
    )
}