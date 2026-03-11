import { redirect, useLoaderData, useSearchParams } from 'react-router-dom';
import { ShoppingBag, MessageSquare, Newspaper } from 'lucide-react';
import type { UserInfo } from '../features/auth/types';
import { getMe } from '../features/auth/api';
import { getRefreshToken, clearTokens } from '../shared/utils/auth';
import UsersTable from '../features/user/UsersTable';
import AdminUsersTable from '../features/user/AdminUsersTable';
import AdminsTable from '../features/user/AdminsTable';
import DepartmentsTable from '../features/department/DepartmentsTable';
import AdminDepartmentsTable from '../features/department/AdminDepartmentsTable';
import Sidebar from '../shared/components/Sidebar';
import TopNavbar from '../shared/components/TopNavbar';

export async function loader() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return redirect('/login');
    try {
        return await getMe();
    } catch {
        clearTokens();
        return redirect('/login');
    }
}

type SocialTab = 'feeds' | 'messaging' | 'users' | 'departments' | 'admins';

export default function AppPage() {
    const user = useLoaderData() as UserInfo;
    const isAdmin = user.role === 'ADMIN';
    const [searchParams] = useSearchParams();

    const section = searchParams.get('section') ?? 'social';
    const sub     = (searchParams.get('sub') ?? 'users') as SocialTab;

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
            <TopNavbar user={user} />

            <div className="flex flex-1 overflow-hidden pt-14">
                <Sidebar user={user} />

                <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                    {/* ── Social Network ── */}
                    {section === 'social' && (
                        <main className="flex-1 overflow-y-auto px-6 py-5">
                            {sub === 'users'       && (isAdmin ? <AdminUsersTable />       : <UsersTable />)}
                            {sub === 'departments' && (isAdmin ? <AdminDepartmentsTable /> : <DepartmentsTable />)}
                            {sub === 'admins'      && isAdmin && <AdminsTable />}

                            {(sub === 'feeds' || sub === 'messaging') && (
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400">
                                    <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                        {sub === 'feeds'
                                            ? <Newspaper size={32} className="text-violet-300 dark:text-violet-700" strokeWidth={1.5} />
                                            : <MessageSquare size={32} className="text-violet-300 dark:text-violet-700" strokeWidth={1.5} />
                                        }
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                                            {sub === 'feeds' ? 'New Feeds' : 'Messaging'}
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Coming soon.</p>
                                    </div>
                                </div>
                            )}
                        </main>
                    )}

                    {/* ── E-commerce ── */}
                    {section === 'ecommerce' && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-5">
                            <div className="w-20 h-20 rounded-3xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                <ShoppingBag size={40} className="text-violet-300 dark:text-violet-700" strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">E-commerce</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This section is coming soon.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
