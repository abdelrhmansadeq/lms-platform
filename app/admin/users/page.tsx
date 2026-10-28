/* eslint-disable @next/next/no-img-element */
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { UserCircle2, ShieldAlert } from 'lucide-react'
import { UserActions } from './user-actions'

type AdminUser = {
    id: string;
    full_name: string | null;
    email: string;
    role: string;
    is_banned: boolean;
    avatar_url: string | null;
}

export default async function AdminUsersPage() {
    const supabase = await createClient()

    // بنستخدم الدالة اللي عملناها في SQL عشان نجيب الإيميلات
    const { data: usersData } = await supabase.rpc('get_all_users_with_emails')
    const users = (usersData as unknown as AdminUser[]) || []

    return (
        <div className="space-y-6 animate-fade-up">

            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserCircle2 className="w-6 h-6 text-emerald-400" />
                        إدارة المستخدمين
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">تحكم في الحسابات، الحظر، وصلاحيات الوصول.</p>
                </div>
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-sm text-slate-300">
          إجمالي المستخدمين: {users.length}
        </span>
            </div>

            <Card className="bg-white/2 border-white/5 shadow-xl overflow-hidden rounded-3xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-white/5 text-slate-300 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 font-bold">المستخدم</th>
                                <th className="px-6 py-4 font-bold">الرتبة</th>
                                <th className="px-6 py-4 font-bold">الحالة</th>
                                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">

                                    {/* بيانات المستخدم */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                                    {user.full_name?.charAt(0) || <UserCircle2 className="w-5 h-5" />}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-200">{user.full_name || 'مستخدم جديد'}</p>
                                                <p className="text-xs text-slate-500" dir="ltr">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* الرتبة */}
                                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              user.role === 'instructor' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {user.role === 'admin' ? 'أدمن' : user.role === 'instructor' ? 'مدرس' : 'طالب'}
                      </span>
                                    </td>

                                    {/* الحالة */}
                                    <td className="px-6 py-4">
                                        {user.is_banned ? (
                                            <span className="text-red-400 text-xs font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> محظور
                        </span>
                                        ) : (
                                            <span className="text-emerald-400 text-xs font-bold">نشط</span>
                                        )}
                                    </td>

                                    {/* أزرار التحكم (Client Component) */}
                                    <td className="px-6 py-4 text-center">
                                        <UserActions user={user} />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}