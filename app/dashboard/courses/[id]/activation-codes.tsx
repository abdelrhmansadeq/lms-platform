'use client'

import { useState } from 'react'
import { generateActivationCodeAction } from './actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'

type ActivationCode = {
    id: string
    code: string
    used_by: string | null
    created_at: string
}

export function ActivationCodes({
                                    courseId,
                                    initialCodes
                                }: {
    courseId: string,
    initialCodes: ActivationCode[]
}) {
    const [isPending, setIsPending] = useState(false)
    const [codes, setCodes] = useState<ActivationCode[]>(initialCodes)

    const handleGenerate = async () => {
        setIsPending(true)
        const res = await generateActivationCodeAction(courseId)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(res.success)
            // هنعمل Refresh سريع للصفحة عشان الكود الجديد يظهر (الـ Server Action بيعمل revalidate)
            window.location.reload()
        }
        setIsPending(false)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('تم نسخ الكود')
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">أكواد التفعيل ({codes.length})</h3>
                <Button onClick={handleGenerate} disabled={isPending} size="sm">
                    {isPending ? 'جاري التوليد...' : '+ توليد كود'}
                </Button>
            </div>

            {codes.length === 0 ? (
                <p className="text-sm text-muted-foreground border p-4 rounded-md text-center">
                    لم تقم بتوليد أي أكواد بعد.
                </p>
            ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {codes.map((c) => (
                        <div key={c.id} className="flex justify-between items-center p-3 border rounded-md bg-zinc-50 dark:bg-zinc-900 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold">{c.code}</span>
                                <button onClick={() => copyToClipboard(c.code)} className="text-muted-foreground hover:text-primary transition-colors">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${c.used_by ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {c.used_by ? 'مستخدم' : 'متاح'}
              </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}