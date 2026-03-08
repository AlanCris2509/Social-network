import { useState } from 'react';
import { redirect, useLoaderData } from 'react-router-dom';
import type { ActionFunctionArgs } from 'react-router-dom';
import { ShoppingBag, MessageSquare } from 'lucide-react';
import type { UserInfo } from '../features/auth/types';
import { getMe, logout } from '../features/auth/api';
import { getRefreshToken, clearTokens } from '../shared/utils/auth';
import UsersTable from '../features/user/UsersTable';
import AdminUsersTable from '../features/user/AdminUsersTable';
import AdminsTable from '../features/user/AdminsTable';
import DepartmentsTable from '../features/department/DepartmentsTable';
import AdminDepartmentsTable from '../features/department/AdminDepartmentsTable';
import Sidebar, { type AppSection } from '../shared/components/Sidebar';

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

export async function action(_args: ActionFunctionArgs) {
    const refreshToken = getRefreshToken();
    if (refreshToken) await logout(refreshToken);
    clearTokens();
    return redirect('/login');
}

type SocialTab = 'users' | 'departments' | 'admins';

const SOCIAL_TAB_LABELS: Record<SocialTab, string> = {
    users: 'Users',
    departments: 'Departments',
    admins: 'Administrators',
};

export default function HomePage() {
    const user = useLoaderData() as UserInfo;
    const isAdmin = user.role === 'ADMIN';

    const [section, setSection] = useState<AppSection>('social');
    const [socialTab, setSocialTab] = useState<SocialTab>('users');

    const availableTabs: SocialTab[] = isAdmin
        ? ['users', 'departments', 'admins']
        : ['users', 'departments'];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            <Sidebar section={section} onSectionChange={setSection} user={user} />

            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                {/* ── Social Network ── */}
                {section === 'social' && (
                    <>
                        {/* Tab bar */}
                        <div className="flex-shrink-0 px-6 pt-5 pb-0 bg-gray-50 dark:bg-gray-950">
                            <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-2xl p-1 shadow-sm border border-gray-100 dark:border-gray-800 w-fit">
                                {availableTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setSocialTab(tab)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                            socialTab === tab
                                                ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        {SOCIAL_TAB_LABELS[tab]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                            {socialTab === 'users' && (isAdmin ? <AdminUsersTable /> : <UsersTable />)}
                            {socialTab === 'departments' && (isAdmin ? <AdminDepartmentsTable /> : <DepartmentsTable />)}
                            {socialTab === 'admins' && isAdmin && <AdminsTable />}
                        </main>
                    </>
                )}

                {/* ── E-commerce ── */}
                {section === 'ecommerce' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-gray-300 dark:text-gray-700">
                        <div className="w-20 h-20 rounded-3xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                            <ShoppingBag size={40} className="text-violet-300 dark:text-violet-700" strokeWidth={1.5} />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">E-commerce</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This section is coming soon.</p>
                        </div>
                    </div>
                )}

                {/* ── Online Messaging ── */}
                {section === 'messaging' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-gray-300 dark:text-gray-700">
                        <div className="w-20 h-20 rounded-3xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                            <MessageSquare size={40} className="text-violet-300 dark:text-violet-700" strokeWidth={1.5} />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Online Messaging</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This section is coming soon.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
