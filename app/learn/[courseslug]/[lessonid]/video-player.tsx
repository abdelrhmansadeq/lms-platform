'use client'

import { useState, useRef, useEffect } from 'react'
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
    const [progress, setProgress] = useState(0)
    const playerRef = useRef<YouTubePlayer | null>(null)
    const lastSavedRef = useRef(initialProgress)
    const latestTimeRef = useRef(initialProgress)
    const durationRef = useRef(0)

    // إعدادات المشغل
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
        durationRef.current = event.target.getDuration()

        // لو الطالب رجع للدرس تاني، نكمل من حيث وقف
        if (initialProgress > 0) {
            event.target.seekTo(initialProgress, true)
        }
    }

    const onStateChange = (event: YouTubeEvent) => {
        // 1 = playing, 2 = paused, 0 = ended
        if (event.data === 2 || event.data === 0) {
            // لو وقف أو الفيديو خلص، احفظ فوراً
            saveProgressImmediately()
        }
    }

    const saveProgressImmediately = async () => {
        if (!playerRef.current) return
        const currentTime = playerRef.current.getCurrentTime()
        if (currentTime > lastSavedRef.current) {
            lastSavedRef.current = currentTime
            await saveProgressAction(lessonId, courseId, currentTime, durationRef.current)
        }
    }

    useEffect(() => {
        const interval = setInterval(async () => {
            if (!playerRef.current) return

            const currentTime = playerRef.current.getCurrentTime()
            const duration = playerRef.current.getDuration()

            if (duration > 0) {
                latestTimeRef.current = currentTime
                durationRef.current = duration
                const percentage = (currentTime / duration) * 100
                setProgress(percentage)

                // نحفظ التقدم في الداتابيز كل 10 ثواني بس
                if (Math.abs(currentTime - lastSavedRef.current) >= 10) {
                    lastSavedRef.current = currentTime
                    await saveProgressAction(lessonId, courseId, currentTime, duration)
                }
            }
        }, 1000)

        // --- السر هنا: لما الطالب يقفل الصفحة أو يروح لصفحة تانية، بنحفظ آخر ثانية ---
        return () => {
            clearInterval(interval)
            // بنستخدم القيمة اللي في الـ ref عشان نتجنب مشاكل الـ stale closures
            if (latestTimeRef.current > lastSavedRef.current && durationRef.current > 0) {
                saveProgressAction(lessonId, courseId, latestTimeRef.current, durationRef.current)
            }
        }
    }, [lessonId, courseId])

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