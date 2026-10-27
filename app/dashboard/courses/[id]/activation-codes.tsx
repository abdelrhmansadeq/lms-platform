'use client'

import { useState } from 'react'
import { generateBulkActivationCodesAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Copy, Ticket } from 'lucide-react'

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
    const [count, setCount] = useState("1")

    const handleGenerate = async () => {
        const numCount = parseInt(count)
        if (isNaN(numCount) || numCount < 1) {
            toast.error('يرجى إدخال رقم صحيح')
            return
        }

        setIsPending(true)
        const res = await generateBulkActivationCodesAction(courseId, numCount)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(res.success)
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
            {/* أدوات التوليد */}
            <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="text-sm font-medium text-slate-300">عدد الأكواد المطلوب توليدها</label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        min="1"
                        max="100"
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                        className="bg-black/20 border-white/10 text-white w-24 text-center"
                    />
                    <Button onClick={handleGenerate} disabled={isPending} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                        {isPending ? 'جاري التوليد...' : 'توليد الأكواد'}
                    </Button>
                </div>
            </div>

            <div className="flex justify-between items-center pt-2">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-emerald-400" />
                    الأكواد المتاحة ({codes.length})
                </h3>
            </div>

            {codes.length === 0 ? (
                <p className="text-sm text-slate-500 border border-white/5 border-dashed p-4 rounded-xl text-center bg-white/2">
                    لم تقم بتوليد أي أكواد بعد.
                </p>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {codes.map((c) => (
                        <div key={c.id} className="flex justify-between items-center p-2.5 border border-white/5 rounded-lg bg-white/2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-200">{c.code}</span>
                                <button onClick={() => copyToClipboard(c.code)} className="text-slate-500 hover:text-emerald-400 transition-colors">
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.used_by ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {c.used_by ? 'مستخدم' : 'متاح'}
              </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}