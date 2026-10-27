export default function CourseManageLoading() {
    return (
        <div className="space-y-8 relative animate-fade-in">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* Skeleton للهيدر */}
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex justify-between items-center">
                <div className="space-y-3">
                    <div className="h-8 w-64 bg-white/10 rounded-lg animate-pulse" />
                    <div className="h-4 w-96 bg-white/5 rounded-lg animate-pulse" />
                </div>
                <div className="flex gap-2">
                    <div className="h-8 w-20 bg-white/10 rounded-md animate-pulse" />
                    <div className="h-8 w-20 bg-white/10 rounded-md animate-pulse" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Skeleton للدروس */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="h-6 w-32 bg-white/10 rounded animate-pulse mb-4" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 w-full bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>

                {/* Skeleton للعمود الجانبي */}
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 w-full bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    )
}