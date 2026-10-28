'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { markAsReadAction, markAllAsReadAction } from '@/app/notifications/actions'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Notification = {
    id: string
    title: string
    message: string
    link: string
    is_read: boolean
    created_at: string
}

export function NotificationsBell({
                                      initialNotifications,
                                      currentUserId
                                  }: {
    initialNotifications: Notification[]
    currentUserId: string
}) {
    const [notifications, setNotifications] = useState(initialNotifications)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const unreadCount = notifications.filter(n => !n.is_read).length

    // 🌟 الاستماع للإشعارات الجديدة لحظة بلحظة (Realtime)
    useEffect(() => {
        const channel = supabase
            .channel('realtime_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUserId}`
                },
                (payload) => {
                    const newNotif = payload.new as Notification

                    // نضيف الإشعار الجديد في أول القائمة
                    setNotifications((prev) => [newNotif, ...prev])

                    // نظهر إشعار (Toast) سريع للمستخدم
                    toast.success(newNotif.title, {
                        description: newNotif.message,
                        action: {
                            label: 'عرض',
                            onClick: () => router.push(newNotif.link)
                        }
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentUserId, supabase, router])

    const handleNotificationClick = async (id: string, link: string, isRead: boolean) => {
        setIsOpen(false)
        if (!isRead) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
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
                                 <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-white/10 text-slate-300 hover:text-white">
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
              {unreadCount}
            </span>
                                    )}
                                </Button>
                            } />

            <PopoverContent className="w-80 p-0 bg-[#0B0F17] border-white/10 shadow-2xl" align="end" dir="rtl">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h4 className="font-semibold text-white">الإشعارات</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto p-0 text-xs text-emerald-400 hover:bg-transparent hover:text-emerald-300">
                            <Check className="w-3 h-3 ml-1" />
                            تحديد الكل كمقروء
                        </Button>
                    )}
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">
                            لا توجد إشعارات حتى الآن.
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.id, notification.link, notification.is_read)}
                                className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${!notification.is_read ? 'bg-emerald-500/5' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className={`text-sm font-semibold ${!notification.is_read ? 'text-emerald-400' : 'text-slate-200'}`}>
                                        {notification.title}
                                    </p>
                                    {!notification.is_read && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />}
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2">
                                    {notification.message}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-2">
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