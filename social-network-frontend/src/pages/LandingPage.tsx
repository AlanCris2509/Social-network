import { useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import {
    Users, ShoppingBag, MessageSquare, Shield, Zap, Globe, Network, ArrowRight, Star,
} from 'lucide-react';
import TopNavbar from '../shared/components/TopNavbar';
import AuthModal from '../shared/components/AuthModal';
import type { UserInfo } from '../features/auth/types';
import { getMe } from '../features/auth/api';
import { getAccessToken } from '../shared/utils/auth';

export async function loader({ request }: { request: Request }): Promise<{ user: UserInfo | null; oauthError: string | null }> {
    const url = new URL(request.url);
    const oauthError = url.searchParams.get('error');
    const token = getAccessToken();
    if (!token) return { user: null, oauthError };
    try {
        const user = await getMe();
        return { user, oauthError };
    } catch {
        return { user: null, oauthError };
    }
}

const FEATURES = [
    {
        Icon: Users,
        title: 'Social Network',
        description: 'Connect with friends, join communities, and share your moments with the world.',
        bg: 'bg-violet-500',
        light: 'bg-violet-50 dark:bg-violet-900/20',
        text: 'text-violet-600 dark:text-violet-400',
    },
    {
        Icon: ShoppingBag,
        title: 'E-commerce',
        description: 'Discover and shop products recommended by your network. Buy and sell with trust.',
        bg: 'bg-blue-500',
        light: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
    },
    {
        Icon: MessageSquare,
        title: 'Real-time Messaging',
        description: 'Chat with individuals and groups instantly. Stay connected wherever you are.',
        bg: 'bg-emerald-500',
        light: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        Icon: Shield,
        title: 'Privacy & Security',
        description: 'Your data is protected with enterprise-grade security and full privacy controls.',
        bg: 'bg-amber-500',
        light: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
    },
    {
        Icon: Zap,
        title: 'Real-time Updates',
        description: 'Instant notifications and live feeds keep you up to date with your network.',
        bg: 'bg-rose-500',
        light: 'bg-rose-50 dark:bg-rose-900/20',
        text: 'text-rose-600 dark:text-rose-400',
    },
    {
        Icon: Globe,
        title: 'Global Reach',
        description: 'Connect with people and businesses from around the world on one platform.',
        bg: 'bg-cyan-500',
        light: 'bg-cyan-50 dark:bg-cyan-900/20',
        text: 'text-cyan-600 dark:text-cyan-400',
    },
] as const;

const STATS = [
    { value: '10K+', label: 'Active Users' },
    { value: '500+', label: 'Communities' },
    { value: '1M+', label: 'Posts Shared' },
    { value: '99.9%', label: 'Uptime' },
];

export default function LandingPage() {
    const { user, oauthError } = useLoaderData() as { user: UserInfo | null; oauthError: string | null };
    const revalidator = useRevalidator();
    const [authOpen, setAuthOpen] = useState(!!oauthError);

    function openAuth() { setAuthOpen(true); }
    function closeAuth() { setAuthOpen(false); }
    function handleAuthSuccess() { setAuthOpen(false); revalidator.revalidate(); }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
            <TopNavbar user={user} onLoginClick={openAuth} />
            <AuthModal open={authOpen} onClose={closeAuth} onSuccess={handleAuthSuccess} oauthError={oauthError} />

            {/* ── Hero ── */}
            <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-100/60 dark:bg-violet-900/10 rounded-full blur-3xl pointer-events-none -z-0" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8 border border-violet-200 dark:border-violet-800">
                        <Star size={13} />
                        The future of social commerce
                    </div>

                    <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        Connect, Share &{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-500">
                            Shop Together
                        </span>
                    </h1>

                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Nexus brings your social network and shopping experience together in one unified platform.
                        Connect with people, discover products, and build communities around the things you love.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a
                            href="/app?section=social&sub=users"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
                        >
                            Get Started
                            <ArrowRight size={16} />
                        </a>
                        <a
                            href="#features"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="py-12 px-6 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                    {STATS.map(({ value, label }) => (
                        <div key={label}>
                            <p className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">{value}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">Everything You Need</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                            A unified platform for all your social and commerce needs — designed to grow with you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map(({ Icon, title, description, light, text }) => (
                            <div
                                key={title}
                                className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${light}`}>
                                    <Icon size={22} className={text} />
                                </div>
                                <h3 className="text-base font-semibold mb-2">{title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-20 px-6 bg-gradient-to-br from-violet-600 to-purple-700">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to join Nexus?</h2>
                    <p className="text-violet-200 mb-8">
                        Create your account today and start connecting with people who share your interests.
                    </p>
                    <button
                        onClick={openAuth}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white text-violet-700 rounded-xl font-semibold hover:bg-violet-50 transition-colors shadow-lg"
                    >
                        Create Free Account
                        <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-8 px-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
                            <Network size={12} className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Nexus</span>
                    </div>
                    <p className="text-xs text-gray-400">© 2026 Nexus. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-gray-400">
                        <a href="#" className="hover:text-violet-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-violet-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-violet-600 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
