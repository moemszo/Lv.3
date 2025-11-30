import { createClient } from '@/utils/supabase/server'
import AccountForm from './account-form'
import MemoList from './memo-list'
import { redirect } from 'next/navigation'

export default async function Account() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <form action="/auth/signout" method="post">
                        <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold py-2 px-4 rounded-xl transition-colors backdrop-blur-sm">
                            Sign Out
                        </button>
                    </form>
                </div>

                <AccountForm user={user} />
                <MemoList user={user} />
            </div>
        </div>
    )
}
