export default function Loading() {
    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 w-full animate-fade-in">
            {/* Skeleton للهيدر */}
            <div className="flex flex-col items-center mb-12 space-y-4">
                <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
                <div className="h-4 w-96 bg-muted rounded-lg animate-pulse" />
            </div>

            {/* Skeleton لشريط البحث */}
            <div className="max-w-xl mx-auto mb-12">
                <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
            </div>

            {/* Skeletons لكروت الكورسات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="border border-border rounded-xl overflow-hidden bg-card">
                        <div className="h-48 w-full bg-muted animate-pulse" />
                        <div className="p-6 space-y-4">
                            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-full bg-muted rounded animate-pulse" />
                            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                            <div className="h-10 w-full bg-muted rounded-md animate-pulse mt-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}