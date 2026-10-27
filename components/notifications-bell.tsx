'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { markAsReadAction, markAllAsReadAction } from '@/app/notifications/actions'
import { useRouter } from 'next/navigation'

type Notification = {
    id: string
    title: string
    message: string
    link: string
    is_read: boolean
    created_at: string
}

export function NotificationsBell({ initialNotifications }: { initialNotifications: Notification[] }) {
    const [notifications, setNotifications] = useState(initialNotifications)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const unreadCount = notifications.filter(n => !n.is_read).length

    const handleNotificationClick = async (id: string, link: string, isRead: boolean) => {
        setIsOpen(false)
        if (!isRead) {
            // نعلمه كمقروء فوراً في الواجهة
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            // نبعته للسيرفر
            await markAsReadAction(id)
        }
        router.push(link)
    }

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        await markAllAsReadAction()
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger render={
                                 <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
                                    )}
                                </Button>
                            } />

            <PopoverContent className="w-80 p-0" align="end" dir="rtl">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h4 className="font-semibold">الإشعارات</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto p-0 text-xs text-primary hover:bg-transparent">
                            <Check className="w-3 h-3 ml-1" />
                            تحديد الكل كمقروء
                        </Button>
                    )}
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            لا توجد إشعارات حتى الآن.
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.id, notification.link, notification.is_read)}
                                className={`p-4 border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50 ${!notification.is_read ? 'bg-primary/5' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className={`text-sm font-semibold ${!notification.is_read ? 'text-primary' : ''}`}>
                                        {notification.title}
                                    </p>
                                    {!notification.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1" />}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    {new Date(notification.created_at).toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}