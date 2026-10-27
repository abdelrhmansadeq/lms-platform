'use client'

import { useState, useRef } from 'react'
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube'
import { saveProgressAction } from './actions'

export function VideoPlayer({
                                youtubeId,
                                lessonId,
                                courseId,
                                initialProgress
                            }: {
    youtubeId: string
    lessonId: string
    courseId: string
    initialProgress: number
}) {
    const [isReady, setIsReady] = useState(false)
    const [progress, setProgress] = useState(0)
    const playerRef = useRef<YouTubePlayer | null>(null)
    const lastSavedRef = useRef(0) // عشان نحفظ كل 10 ثواني بس

    // إعدادات المشغل (إخفاء العناصر الزائدة)
    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
        },
    }

    const onReady = (event: YouTubeEvent) => {
        playerRef.current = event.target
        setIsReady(true)

        // لو الطالب رجع للدرس تاني، نكمل من حيث وقف
        if (initialProgress > 0) {
            event.target.seekTo(initialProgress, true)
        }
    }

    const onStateChange = (event: YouTubeEvent) => {
        // لو الفيديو شغال (1 = playing)
        if (event.data === 1) {
            startTracking()
        }
    }

    const startTracking = () => {
        const interval = setInterval(async () => {
            if (!playerRef.current) return

            const currentTime = playerRef.current.getCurrentTime()
            const duration = playerRef.current.getDuration()

            if (duration > 0) {
                const percentage = (currentTime / duration) * 100
                setProgress(percentage)

                // نحفظ التقدم في الداتابيز كل 10 ثواني بس
                if (Math.abs(currentTime - lastSavedRef.current) >= 10) {
                    lastSavedRef.current = currentTime
                    await saveProgressAction(lessonId, courseId, currentTime, duration)
                }
            }
        }, 1000)

        // تنظيف الـ interval لو الفيديو وقف
        return () => clearInterval(interval)
    }

    return (
        <div className="space-y-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border bg-black shadow-2xl relative">
                <YouTube
                    videoId={youtubeId}
                    opts={opts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                    className="absolute top-0 left-0 w-full h-full"
                    iframeClassName="w-full h-full"
                />
            </div>

            {/* شريط التقدم */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-sm font-medium text-muted-foreground w-12 text-left" dir="ltr">
          {Math.round(progress)}%
        </span>
            </div>
        </div>
    )
}