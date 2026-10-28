'use client'

import { useRef, useState } from 'react'
import { VideoPlayer, VideoPlayerRef } from './video-player'
import { NotesSection } from './notes-section'

type Note = {
    id: string
    content: string
    timestamp_seconds: number
    created_at: string
}

export function LessonContent({
                                  youtubeId,
                                  lessonId,
                                  courseId,
                                  initialProgress,
                                  nextLesson,
                                  courseSlug,
                                  initialNotes
                              }: {
    youtubeId: string
    lessonId: string
    courseId: string
    initialProgress: number
    nextLesson: { id: string, title: string } | null
    courseSlug: string
    initialNotes: Note[]
}) {
    const [currentTime, setCurrentTime] = useState(0)
    const playerRef = useRef<VideoPlayerRef>(null)

    return (
        <div className="space-y-6">
            <VideoPlayer
                ref={playerRef}
                youtubeId={youtubeId}
                lessonId={lessonId}
                courseId={courseId}
                initialProgress={initialProgress}
                nextLesson={nextLesson}
                courseSlug={courseSlug}
                onTimeUpdate={setCurrentTime}
            />

            <NotesSection
                lessonId={lessonId}
                initialNotes={initialNotes}
                currentTime={currentTime}
                onSeek={(time) => playerRef.current?.seekTo(time)}
            />
        </div>
    )
}