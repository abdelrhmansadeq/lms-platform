export default function CourseDetailsLoading() {
    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-5xl animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* العمود الأيسر (الصورة والمحتوى) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* صورة الكورس */}
                    <div className="w-full h-64 md:h-80 rounded-2xl bg-muted animate-pulse" />

                    {/* العنوان والوصف */}
                    <div className="space-y-3">
                        <div className="h-10 w-3/4 bg-muted rounded-lg animate-pulse" />
                        <div className="h-6 w-1/3 bg-muted rounded-lg animate-pulse mb-4" />
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                    </div>

                    {/* كارت المحتوى */}
                    <div className="border border-border rounded-xl p-6 bg-card space-y-4 mt-8">
                        <div className="h-6 w-1/4 bg-muted rounded animate-pulse mb-4" />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 w-full bg-muted/50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* العمود الأيمن (صندوق الاشتراك) */}
                <div className="lg:col-span-1">
                    <div className="border border-border rounded-xl p-6 bg-card h-64 animate-pulse sticky top-24" />
                </div>
            </div>
        </div>
    )
}