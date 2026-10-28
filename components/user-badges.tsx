import { Rocket, Trophy, MessageSquare, Heart, Award } from 'lucide-react'

type Badge = {
    id: string;
    name: string;
    description: string;
    icon_name: string;
    color: string;
}

export function UserBadges({ badges, size = 'md' }: { badges: Badge[], size?: 'sm' | 'md' }) {
    if (!badges || badges.length === 0) return null

    const getIcon = (iconName: string) => {
        const props = size === 'sm' ? { className: "w-3 h-3" } : { className: "w-5 h-5" }
        switch (iconName) {
            case 'Rocket': return <Rocket {...props} />
            case 'Trophy': return <Trophy {...props} />
            case 'MessageSquare': return <MessageSquare {...props} />
            case 'Heart': return <Heart {...props} />
            default: return <Award {...props} />
        }
    }

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'yellow': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            case 'emerald': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            case 'red': return 'bg-red-500/10 text-red-400 border-red-500/20'
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
                <div
                    key={badge.id}
                    title={badge.name}
                    className={`flex items-center justify-center rounded-full border ${getColorClasses(badge.color)} ${size === 'sm' ? 'w-6 h-6' : 'w-10 h-10'}`}
                >
                    {getIcon(badge.icon_name)}
                </div>
            ))}
        </div>
    )
}