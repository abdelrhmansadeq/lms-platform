'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

type ExportData = {
    name: string;
    score: number;
    total: number;
    percentage: number;
    date: string;
}

export function ExportCsvButton({ data, quizTitle }: { data: ExportData[], quizTitle: string }) {
    const handleExport = () => {
        if (data.length === 0) {
            toast.error('لا توجد بيانات لتصديرها')
            return
        }

        // 1. تجهيز عناوين الأعمدة (Headers)
        const headers = ['اسم الطالب', 'الدرجة', 'من أصل', 'النسبة المئوية', 'التاريخ']

        // 2. تجهيز صفوف البيانات
        const rows = data.map(row => [
            row.name,
            row.score,
            row.total,
            `${row.percentage}%`,
            row.date
        ])

        // 3. دمجهم في نص CSV (مع إضافة \uFEFF عشان الإكسيل يقرأ العربي صح)
        const csvContent = '\uFEFF' + [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n')

        // 4. كريت الملف وتنزيله
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `نتائج-${quizTitle}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('تم تحميل الملف بنجاح')
    }

    return (
        <Button
            onClick={handleExport}
            variant="outline"
            className="bg-white/5 border-white/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors gap-2"
        >
            <Download className="w-4 h-4" />
            تحميل النتائج (Excel)
        </Button>
    )
}