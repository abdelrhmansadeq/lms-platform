'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

type StarRatingProps = {
    initialRating?: number
    maxRating?: number
    readonly?: boolean
    onRatingChangeAction?: (rating: number) => void; // <--- الاسم الجديد
    size?: 'sm' | 'md' | 'lg'
}

export function StarRating({
                               initialRating = 0,
                               maxRating = 5,
                               readonly = false,
                               onRatingChangeAction, // <--- الاسم الجديد
                               size = 'md'
                           }: StarRatingProps) {
    const [rating, setRating] = useState(initialRating)
    const [hover, setHover] = useState(0)

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-8 h-8'
    }

    return (
        <div className="flex gap-1" dir="ltr">
            {[...Array(maxRating)].map((_, index) => {
                const starValue = index + 1
                return (
                    <button
                        key={index}
                        type="button"
                        disabled={readonly}
                        className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors focus:outline-none`}
                        onClick={() => {
                            if (!readonly) {
                                setRating(starValue)
                                onRatingChangeAction?.(starValue) // <--- الاسم الجديد
                            }
                        }}
                        onMouseEnter={() => !readonly && setHover(starValue)}
                        onMouseLeave={() => !readonly && setHover(0)}
                    >
                        <Star
                            className={`${sizeClasses[size]} ${
                                starValue <= (hover || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-transparent text-muted-foreground/30'
                            } transition-all duration-200`}
                        />
                    </button>
                )
            })}
        </div>
    )
}