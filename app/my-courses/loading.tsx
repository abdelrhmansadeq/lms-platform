export default function MyCoursesLoading() {
    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-5xl animate-fade-in">
            {/* Skeleton للعنوان */}
            <div className="mb-8 space-y-3">
                <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
                <div className="h-4 w-72 bg-muted rounded-lg animate-pulse" />
            </div>

            {/* Skeletons لكروت الكورسات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col border border-border rounded-xl overflow-hidden bg-card">
                        {/* صورة الكارت */}
                        <div className="h-40 w-full bg-muted animate-pulse" />

                        {/* محتوى الكارت */}
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