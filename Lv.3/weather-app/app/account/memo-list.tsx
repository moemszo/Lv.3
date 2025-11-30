'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

type Memo = Database['public']['Tables']['memos']['Row']

export default function MemoList({ user }: { user: User | null }) {
    const supabase = createClient()
    const [memos, setMemos] = useState<Memo[]>([])
    const [newMemo, setNewMemo] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchMemos = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data, error } = await supabase
            .from('memos')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching memos:', error)
        } else {
            setMemos(data || [])
        }
        setLoading(false)
    }, [user, supabase])

    useEffect(() => {
        fetchMemos()
    }, [user, fetchMemos])

    const addMemo = async () => {
        if (!newMemo.trim() || !user) return

        const { error } = await supabase
            .from('memos')
            .insert({ content: newMemo, user_id: user.id })

        if (error) {
            alert('Error adding memo')
            console.error(error)
        } else {
            setNewMemo('')
            fetchMemos()
        }
    }

    const deleteMemo = async (id: number) => {
        const { error } = await supabase.from('memos').delete().eq('id', id)
        if (error) {
            alert('Error deleting memo')
        } else {
            fetchMemos()
        }
    }

    return (
        <div className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6 text-white">My Memos</h2>

            <div className="flex gap-4 mb-8">
                <input
                    type="text"
                    value={newMemo}
                    onChange={(e) => setNewMemo(e.target.value)}
                    placeholder="Write a new memo..."
                    className="input-glass flex-1 rounded-xl px-4 py-3 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && addMemo()}
                />
                <button
                    onClick={addMemo}
                    disabled={!newMemo.trim()}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-green-500/30"
                >
                    Add
                </button>
            </div>

            {loading ? (
                <p className="text-blue-200 animate-pulse">Loading memos...</p>
            ) : memos.length === 0 ? (
                <p className="text-white/50 italic">No memos yet. Add one above!</p>
            ) : (
                <ul className="space-y-4">
                    {memos.map((memo) => (
                        <li key={memo.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                            <span className="text-white">{memo.content}</span>
                            <button
                                onClick={() => deleteMemo(memo.id)}
                                className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
