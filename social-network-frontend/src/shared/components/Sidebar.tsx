import { useState, useEffect } from 'react';
import { Form } from 'react-router-dom';
import { Users, ShoppingBag, MessageSquare, LogOut, Network, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import type { UserInfo } from '../../features/auth/types';
import { useTheme } from '../contexts/ThemeContext';

export type AppSection = 'social' | 'ecommerce' | 'messaging';

interface SidebarProps {
    section: AppSection;
    onSectionChange: (s: AppSection) => void;
    user: UserInfo;
}

const NAV_ITEMS: { id: AppSection; label: string; icon: React.ReactNode }[] = [
    { id: 'social', label: 'Social Network', icon: <Users size={18} /> },
    { id: 'ecommerce', label: 'E-commerce', icon: <ShoppingBag size={18} /> },
    { id: 'messaging', label: 'Online Messaging', icon: <MessageSquare size={18} /> },
];

export default function Sidebar({ section, onSectionChange, user }: SidebarProps) {
    const { isDark, toggle } = useTheme();
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
    });

    useEffect(() => {
        try { localStorage.setItem('sidebar-collapsed', String(collapsed)); } catch { /* ignore */ }
    }, [collapsed]);

    return (
        <div
            className={`flex-shrink-0 h-screen p-3 transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-60'}`}
        >
            <div className="h-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">

                {/* Brand + collapse toggle */}
                <div className={`flex border-b border-gray-100 dark:border-gray-800 flex-shrink-0 ${collapsed ? 'flex-col items-center gap-1 py-3 px-2' : 'flex-row items-center justify-between px-4 py-4'}`}>
                    <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                        <Network size={14} className="text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-gray-900 dark:text-white font-bold text-sm tracking-wide flex-1 ml-2.5">Nexus</span>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS.map(({ id, label, icon }) => (
                        <button
                            key={id}
                            onClick={() => onSectionChange(id)}
                            title={collapsed ? label : undefined}
                            className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-150 ${
                                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                            } ${
                                section === id
                                    ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                            }`}
                        >
                            <span className={section === id ? 'text-violet-600 dark:text-violet-400' : ''}>{icon}</span>
                            {!collapsed && <span className="truncate">{label}</span>}
                        </button>
                    ))}
                </nav>

                {/* User + Controls */}
                <div className="px-2 py-3 border-t border-gray-100 dark:border-gray-800 space-y-0.5 flex-shrink-0">
                    {/* User info */}
                    {collapsed ? (
                        <div
                            className="flex justify-center py-2"
                            title={`${user.username} (${user.email})`}
                        >
                            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                                <span className="text-violet-700 dark:text-violet-300 text-xs font-bold uppercase">
                                    {user.username.charAt(0)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="px-3 py-2 mb-1">
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
                            {user.role === 'ADMIN' && (
                                <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                                    Admin
                                </span>
                            )}
                        </div>
                    )}

                    {/* Theme toggle */}
                    <button
                        onClick={toggle}
                        title={collapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : undefined}
                        className={`w-full flex items-center rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${
                            collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                        }`}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        {!collapsed && (isDark ? 'Light Mode' : 'Dark Mode')}
                    </button>

                    {/* Logout */}
                    <Form method="post">
                        <button
                            type="submit"
                            title={collapsed ? 'Logout' : undefined}
                            className={`w-full flex items-center rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors ${
                                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                            }`}
                        >
                            <LogOut size={18} />
                            {!collapsed && 'Logout'}
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    );
}
