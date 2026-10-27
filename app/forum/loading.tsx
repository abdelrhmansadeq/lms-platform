export default function ForumLoading() {
    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-5xl animate-fade-in relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="flex justify-between items-center mb-10">
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
                    <div className="h-4 w-72 bg-white/5 rounded-lg animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
            </div>

            <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 border border-white/5 rounded-3xl bg-white/[0.02]">
                        <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse mb-3" />
                        <div className="h-4 w-full bg-white/5 rounded animate-pulse mb-2" />
                        <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse mb-6" />
                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                            <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                            <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}