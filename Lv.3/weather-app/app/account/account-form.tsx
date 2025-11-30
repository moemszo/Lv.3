'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'

export default function AccountForm({ user }: { user: User | null }) {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [fullname, setFullname] = useState<string | null>(null)
    const [username, setUsername] = useState<string | null>(null)

    const getProfile = useCallback(async () => {
        try {
            setLoading(true)
            if (!user) return

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`full_name, username, avatar_url`)
                .eq('id', user.id)
                .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setFullname(data.full_name)
                setUsername(data.username)
            }
        } catch (error) {
            console.log('Error loading user data!')
        } finally {
            setLoading(false)
        }
    }, [user, supabase])

    useEffect(() => {
        getProfile()
    }, [user, getProfile])

    async function updateProfile({
        username,
        fullname,
    }: {
        username: string | null
        fullname: string | null
    }) {
        try {
            setLoading(true)
            if (!user) return

            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                full_name: fullname,
                username,
                updated_at: new Date().toISOString(),
            })
            if (error) throw error
            alert('Profile updated!')
        } catch (error) {
            alert('Error updating the data!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass p-8 rounded-3xl mb-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Profile</h2>
            <div className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">Email</label>
                    <input
                        id="email"
                        type="text"
                        value={user?.email}
                        disabled
                        className="input-glass w-full rounded-xl px-4 py-3 text-white/50 cursor-not-allowed"
                    />
                </div>
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-blue-200 mb-2">Full Name</label>
                    <input
                        id="fullName"
                        type="text"
                        value={fullname || ''}
                        onChange={(e) => setFullname(e.target.value)}
                        className="input-glass w-full rounded-xl px-4 py-3 text-white"
                        placeholder="Your full name"
                    />
                </div>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-blue-200 mb-2">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username || ''}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-glass w-full rounded-xl px-4 py-3 text-white"
                        placeholder="Your username"
                    />
                </div>

                <div>
                    <button
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30"
                        onClick={() => updateProfile({ fullname, username })}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </div>
            </div>
        </div>
    )
}
