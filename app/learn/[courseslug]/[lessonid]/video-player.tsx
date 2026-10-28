'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube'
import { saveProgressAction } from './actions'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'

export type VideoPlayerRef = {
    seekTo: (seconds: number) => void;
}

type VideoPlayerProps = {
    youtubeId: string
    lessonId: string
    courseId: string
    initialProgress: number
    nextLesson: { id: string, title: string } | null
    courseSlug: string
    onTimeUpdate?: (time: number) => void // عشان نبعت الوقت للـ Notes
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
                                                                             youtubeId,
                                                                             lessonId,
                                                                             courseId,
                                                                             initialProgress,
                                                                             nextLesson,
                                                                             courseSlug,
                                                                             onTimeUpdate
                                                                         }, ref) => {
    const [progress, setProgress] = useState(0)
    const [showNext, setShowNext] = useState(false)
    const [countdown, setCountdown] = useState(5)
    const playerRef = useRef<YouTubePlayer | null>(null)
    const lastSavedRef = useRef(initialProgress)
    const latestTimeRef = useRef(initialProgress)
    const durationRef = useRef(0)
    const router = useRouter()

    // دالة عشان الـ Notes تقدر تنقل الفيديو للحتة اللي إحنا عايزينها
    useImperativeHandle(ref, () => ({
        seekTo: (seconds: number) => {
            if (playerRef.current) {
                playerRef.current.seekTo(seconds, true)
                playerRef.current.playVideo() // نشغله لو كان واقف
            }
        }
    }))

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

        if (initialProgress > 0) {
            event.target.seekTo(initialProgress, true)
        }
    }

    const onStateChange = (event: YouTubeEvent) => {
        if (event.data === 2) {
            saveProgressImmediately()
        }
        if (event.data === 0) {
            saveProgressImmediately()
            if (nextLesson) {
                setShowNext(true)
            }
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
        let timer: NodeJS.Timeout

        if (showNext && countdown > 0) {
            timer = setTimeout(() => setCountdown(prev => prev - 1), 1000)
        } else if (showNext && countdown === 0) {
            router.push(`/learn/${courseSlug}/${nextLesson?.id}`)
        }

        return () => clearTimeout(timer)
    }, [showNext, countdown, nextLesson, courseSlug, router])

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

                // بنبعت الوقت للـ NotesSection عشان يظهر
                if (onTimeUpdate) onTimeUpdate(currentTime)

                if (Math.abs(currentTime - lastSavedRef.current) >= 10) {
                    lastSavedRef.current = currentTime
                    await saveProgressAction(lessonId, courseId, currentTime, duration)
                }
            }
        }, 1000)

        return () => {
            clearInterval(interval)
            if (latestTimeRef.current > lastSavedRef.current && durationRef.current > 0) {
                saveProgressAction(lessonId, courseId, latestTimeRef.current, durationRef.current)
            }
        }
    }, [lessonId, courseId, onTimeUpdate])

    return (
        <div className="space-y-4">
            <div className="aspect-video w-full rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
                <YouTube
                    videoId={youtubeId}
                    opts={opts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                    className="absolute top-0 left-0 w-full h-full"
                    iframeClassName="w-full h-full"
                />

                {showNext && nextLesson && (
                    <div className="absolute inset-0 bg-[#0B0F17]/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">الدرس التالي</h3>
                        <h2 className="text-2xl font-bold text-white mb-8">{nextLesson.title}</h2>

                        <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center mb-8 relative">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-emerald-500" strokeDasharray="280" strokeDashoffset={280 - (280 * (5 - countdown) / 5)} />
                            </svg>
                            <span className="text-3xl font-bold text-white">{countdown}</span>
                        </div>

                        <Button
                            onClick={() => router.push(`/learn/${courseSlug}/${nextLesson.id}`)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 px-8 gap-2"
                        >
                            <Play className="w-4 h-4" />
                            بدء الدرس الآن
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-sm font-bold text-emerald-400 w-12 text-left" dir="ltr">
          {Math.round(progress)}%
        </span>
            </div>
        </div>
    )
})

VideoPlayer.displayName = 'VideoPlayer'