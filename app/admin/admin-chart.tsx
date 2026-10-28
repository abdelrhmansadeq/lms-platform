'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type ChartData = {
    name: string;
    users: number;
}

export function AdminChart({ data }: { data: ChartData[] }) {
    return (
        <div className="h-75 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />

                    <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />

                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        allowDecimals={false}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0B0F17',
                            borderColor: '#ffffff10',
                            borderRadius: '12px',
                            color: '#fff',
                            direction: 'rtl'
                        }}
                        itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                        formatter={(value) => [`${value} مستخدم`, 'المسجلين الجدد']}
                    />

                    <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#60a5fa' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}