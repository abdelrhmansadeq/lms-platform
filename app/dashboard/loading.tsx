export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-fade-in">

            {/* Skeletons لكروت الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-6 h-32 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                        </div>
                        <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Skeleton لرأس القائمة وزرار الإضافة */}
            <div className="flex justify-between items-center border-t border-border pt-6">
                <div className="h-8 w-32 bg-muted rounded-lg animate-pulse" />
                <div className="h-10 w-36 bg-muted rounded-md animate-pulse" />
            </div>

            {/* Skeletons لكروت الكورسات في الداشبورد */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col border border-border rounded-xl overflow-hidden bg-card">
                        <div className="h-40 w-full bg-muted animate-pulse border-b border-border" />
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
                                <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                            </div>
                            <div className="h-4 w-1/3 bg-muted rounded animate-pulse mt-4" />
                            <div className="h-10 w-full bg-muted rounded-md animate-pulse mt-6" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}