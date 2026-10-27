export default function ProfileLoading() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl relative animate-fade-in">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="bg-white/[0.02] border border-white/5 shadow-2xl rounded-3xl backdrop-blur-xl overflow-hidden">
                <div className="h-32 w-full bg-white/5 animate-pulse" />

                <div className="pt-10 pb-6 text-center border-b border-white/5 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse mb-4" />
                    <div className="h-6 w-32 bg-white/10 rounded animate-pulse mb-2" />
                    <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                </div>

                <div className="p-8 space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                            <div className="h-11 w-full bg-white/5 rounded-md animate-pulse" />
                        </div>
                    ))}
                    <div className="flex justify-end pt-4">
                        <div className="h-11 w-32 bg-white/10 rounded-md animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    )
}