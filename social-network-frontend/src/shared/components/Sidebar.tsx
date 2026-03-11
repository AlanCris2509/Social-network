import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Users, MessageSquare, Newspaper, Building2, Shield,
    Package, ShoppingCart, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { UserInfo } from '../../features/auth/types';

interface SidebarProps {
    user: UserInfo;
}

const SOCIAL_NAV = [
    { id: 'feeds',        label: 'New Feeds',      Icon: Newspaper,     adminOnly: false },
    { id: 'messaging',   label: 'Messaging',      Icon: MessageSquare, adminOnly: false },
    { id: 'users',       label: 'Users',           Icon: Users,         adminOnly: false },
    { id: 'departments', label: 'Departments',    Icon: Building2,     adminOnly: false },
    { id: 'admins',      label: 'Administrators', Icon: Shield,        adminOnly: true  },
] as const;

const ECOMMERCE_NAV = [
    { id: 'products', label: 'Products', Icon: Package },
    { id: 'orders',   label: 'Orders',   Icon: ShoppingCart },
] as const;

const SECTION_LABELS: Record<string, string> = {
    social:    'Social Network',
    ecommerce: 'E-commerce',
};

export default function Sidebar({ user }: SidebarProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const section   = searchParams.get('section') ?? 'social';
    const activeSub = searchParams.get('sub')     ?? 'users';
    const isAdmin   = user.role === 'ADMIN';

    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
    });

    useEffect(() => {
        try { localStorage.setItem('sidebar-collapsed', String(collapsed)); } catch { /* ignore */ }
    }, [collapsed]);

    function navTo(sub: string) {
        navigate(`/app?section=${section}&sub=${sub}`);
    }

    const navItems = section === 'social'
        ? SOCIAL_NAV.filter(item => !item.adminOnly || isAdmin)
        : [...ECOMMERCE_NAV];

    return (
        <div className={`flex-shrink-0 h-full p-3 transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-60'}`}>
            <div className="h-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">

                {/* Header: section label + collapse toggle */}
                <div className={`flex items-center border-b border-gray-100 dark:border-gray-800 flex-shrink-0 ${
                    collapsed ? 'flex-col justify-center gap-1 py-3 px-2' : 'flex-row justify-between px-4 py-3'
                }`}>
                    {!collapsed && (
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">
                            {SECTION_LABELS[section] ?? 'Navigation'}
                        </span>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className="p-1 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                    {navItems.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            onClick={() => navTo(id)}
                            title={collapsed ? label : undefined}
                            className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-150 ${
                                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                            } ${
                                activeSub === id
                                    ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                            }`}
                        >
                            <Icon
                                size={18}
                                className={`shrink-0 ${activeSub === id ? 'text-violet-600 dark:text-violet-400' : ''}`}
                            />
                            {!collapsed && <span className="truncate">{label}</span>}
                        </button>
                    ))}
                </nav>

                {/* User info */}
                <div className="px-2 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                    {collapsed ? (
                        <div
                            className="flex justify-center py-1"
                            title={`${user.username} — ${user.email}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                                <span className="text-violet-700 dark:text-violet-300 text-xs font-bold uppercase">
                                    {user.username.charAt(0)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="px-3 py-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                                    <span className="text-violet-700 dark:text-violet-300 text-xs font-bold uppercase">
                                        {user.username.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-gray-900 dark:text-gray-100 text-sm font-medium truncate">{user.username}</p>
                                    <p className="text-gray-400 dark:text-gray-500 text-xs truncate">{user.email}</p>
                                </div>
                            </div>
                            {isAdmin && (
                                <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                                    Admin
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
