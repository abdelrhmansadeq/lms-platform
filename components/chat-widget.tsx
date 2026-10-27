'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, X, Send, User } from 'lucide-react'
import { sendMessageAction } from '@/app/messages/actions'
import { toast } from 'sonner'

type Message = {
    id: string
    sender_id: string
    receiver_id: string
    content: string
    created_at: string
}

export function ChatWidget({
                               currentUserId,
                               otherUserId,
                               otherUserName
                           }: {
    currentUserId: string
    otherUserId: string
    otherUserName: string
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // 1. جلب الرسائل القديمة
    useEffect(() => {
        if (!isOpen) return

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('direct_messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
                .order('created_at', { ascending: true })

            if (data) setMessages(data)
            scrollToBottom()
        }

        fetchMessages()
    }, [isOpen, currentUserId, otherUserId, supabase])

    // 2. الاستماع للرسائل الجديدة (Realtime)
    useEffect(() => {
        if (!isOpen) return

        const channel = supabase
            .channel('chat_channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'direct_messages' },
                (payload) => {
                    const newMsg = payload.new as Message
                    // نتأكد إن الرسالة بين الشخصين دول
                    if (
                        (newMsg.sender_id === currentUserId && newMsg.receiver_id === otherUserId) ||
                        (newMsg.sender_id === otherUserId && newMsg.receiver_id === currentUserId)
                    ) {
                        setMessages((prev) => {
                            // منع التكرار لو الرسالة اتحطت مرتين
                            if (prev.find(m => m.id === newMsg.id)) return prev
                            return [...prev, newMsg]
                        })
                        scrollToBottom()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [isOpen, currentUserId, otherUserId, supabase])

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        setIsSending(true)
        const formData = new FormData()
        formData.append('receiverId', otherUserId)
        formData.append('content', newMessage)

        const res = await sendMessageAction(null, formData)

        if (res.error) {
            toast.error(res.error)
        } else {
            setNewMessage('') // تفريغ الخانة فوراً
        }
        setIsSending(false)
    }

    return (
        <>
            {/* زرار فتح الشات العائم */}
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-14 w-14 rounded-full shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)] p-0 transition-transform hover:scale-110"
            >
                <MessageSquare className="w-6 h-6" />
            </Button>

            {/* نافذة الشات */}
            {isOpen && (
                <div className="fixed bottom-24 md:bottom-28 right-4 md:right-8 z-50 w-[calc(100vw-32px)] sm:w-96 bg-[#0B0F17]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-up">

                    {/* هيدر الشات */}
                    <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{otherUserName}</h3>
                                <p className="text-xs text-emerald-400 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    متصل الآن
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/10">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* الرسائل */}
                    <div className="flex-1 p-4 h-[350px] overflow-y-auto space-y-4 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-500 mt-10">
                                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p>ابدأ المحادثة الآن...</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.sender_id === currentUserId
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                            isMe
                                                ? 'bg-emerald-500 text-black rounded-br-sm'
                                                : 'bg-white/10 text-slate-200 rounded-bl-sm border border-white/5'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* فورم الإرسال */}
                    <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/20 flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="اكتب رسالتك..."
                            className="bg-white/5 border-white/10 text-white focus-visible:ring-emerald-500"
                        />
                        <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()} className="bg-emerald-500 hover:bg-emerald-400 text-black shrink-0">
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            )}
        </>
    )
}