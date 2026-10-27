export default function ForumLoading() {
    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-5xl animate-fade-in">
            {/* Skeleton للهيدر */}
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
                    <div className="h-4 w-72 bg-muted rounded-lg animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
            </div>

            {/* Skeletons للمواضيع */}
            <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 border border-border rounded-xl bg-card">
                        <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-3" />
                        <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
                        <div className="h-4 w-5/6 bg-muted rounded animate-pulse mb-6" />
                        <div className="flex justify-between items-center border-t border-border/50 pt-4">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}