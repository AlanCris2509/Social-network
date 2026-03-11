import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useRevalidator } from 'react-router-dom';
import {
    Network, Search, Sun, Moon, ChevronDown, Users, ShoppingBag,
    MessageSquare, Newspaper, LogIn, LogOut, Building2, Package, ShoppingCart,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { UserInfo } from '../../features/auth/types';
import { logout } from '../../features/auth/api';
import { clearTokens, getRefreshToken } from '../utils/auth';

interface TopNavbarProps {
    user: UserInfo | null;
    onLoginClick?: () => void;
}

const SOCIAL_ITEMS = [
    { sub: 'feeds',       label: 'New Feeds',    Icon: Newspaper },
    { sub: 'messaging',   label: 'Messaging',    Icon: MessageSquare },
    { sub: 'users',       label: 'Users',        Icon: Users },
    { sub: 'departments', label: 'Departments',  Icon: Building2 },
] as const;

const ECOMMERCE_ITEMS = [
    { sub: 'products', label: 'Products', Icon: Package },
    { sub: 'orders',   label: 'Orders',   Icon: ShoppingCart },
] as const;

export default function TopNavbar({ user, onLoginClick }: TopNavbarProps) {
    const { isDark, toggle } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const revalidator = useRevalidator();
    const [socialOpen, setSocialOpen] = useState(false);
    const [ecommerceOpen, setEcommerceOpen] = useState(false);
    const [search, setSearch] = useState('');

    const socialRef = useRef<HTMLDivElement>(null);
    const ecommerceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleMouseDown(e: MouseEvent) {
            if (!socialRef.current?.contains(e.target as Node)) setSocialOpen(false);
            if (!ecommerceRef.current?.contains(e.target as Node)) setEcommerceOpen(false);
        }
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, []);

    function goToApp(section: string, sub: string) {
        setSocialOpen(false);
        setEcommerceOpen(false);
        if (!user) {
            onLoginClick?.();
            return;
        }
        navigate(`/app?section=${section}&sub=${sub}`);
    }

    async function handleLogout() {
        const rt = getRefreshToken();
        if (rt) {
            try { await logout(rt); } catch { /* ignore */ }
        }
        clearTokens();
        if (location.pathname === '/home') {
            revalidator.revalidate();
        } else {
            navigate('/login');
        }
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center px-5 gap-1">
            {/* Logo + Name */}
            <Link to="/" className="flex items-center gap-2 shrink-0 mr-4">
                <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                    <Network size={14} className="text-white" />
                </div>
                <span className="font-bold text-sm tracking-wide text-gray-900 dark:text-white">Nexus</span>
            </Link>

            {/* Social Media dropdown */}
            <div className="relative" ref={socialRef}>
                <button
                    onClick={() => { setSocialOpen(v => !v); setEcommerceOpen(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        socialOpen
                            ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                    <Users size={15} />
                    Social Media
                    <ChevronDown size={13} className={`transition-transform duration-200 ${socialOpen ? 'rotate-180' : ''}`} />
                </button>
                {socialOpen && (
                    <div className="absolute top-full mt-1.5 left-0 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-1.5 z-50">
                        {SOCIAL_ITEMS.map(({ sub, label, Icon }) => (
                            <button
                                key={sub}
                                onClick={() => goToApp('social', sub)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-colors text-left"
                            >
                                <Icon size={15} className="shrink-0" />
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* E-commerce dropdown */}
            <div className="relative" ref={ecommerceRef}>
                <button
                    onClick={() => { setEcommerceOpen(v => !v); setSocialOpen(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        ecommerceOpen
                            ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                    <ShoppingBag size={15} />
                    E-commerce
                    <ChevronDown size={13} className={`transition-transform duration-200 ${ecommerceOpen ? 'rotate-180' : ''}`} />
                </button>
                {ecommerceOpen && (
                    <div className="absolute top-full mt-1.5 left-0 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-1.5 z-50">
                        {ECOMMERCE_ITEMS.map(({ sub, label, Icon }) => (
                            <button
                                key={sub}
                                onClick={() => goToApp('ecommerce', sub)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-colors text-left"
                            >
                                <Icon size={15} className="shrink-0" />
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-violet-300 dark:focus:border-violet-600 rounded-lg outline-none w-52 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors"
                />
            </div>

            {/* Theme toggle */}
            <button
                onClick={toggle}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Login / Logout */}
            {user ? (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                        Hello, <span className="font-semibold text-gray-700 dark:text-gray-200">{user.username}</span>
                    </span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        <LogOut size={15} />
                        Logout
                    </button>
                </div>
            ) : (
                <button
                    onClick={onLoginClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                >
                    <LogIn size={15} />
                    Login
                </button>
            )}
        </header>
    );
}
