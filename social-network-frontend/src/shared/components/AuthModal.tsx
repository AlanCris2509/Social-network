import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { X, Network } from 'lucide-react';
import { login, register } from '../../features/auth/api';
import { setTokens } from '../utils/auth';

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    oauthError?: string | null;
}

type LoginForm = { username: string; password: string };
type RegisterForm = { username: string; email: string; password: string; confirmPassword: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal({ open, onClose, onSuccess, oauthError }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const errMsg = (err: unknown) =>
        axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Request failed') : 'Request failed';

    const {
        register: regLogin,
        handleSubmit: submitLogin,
        setError: setLoginError,
        formState: { errors: loginErrors, isSubmitting: isLoggingIn },
    } = useForm<LoginForm>();

    const onLogin = submitLogin(async ({ username, password }) => {
        try {
            const data = await login(username, password);
            setTokens(data.accessToken, data.refreshToken);
            onSuccess();
        } catch (err) {
            setLoginError('root', { message: errMsg(err) });
        }
    });

    const {
        register: regRegister,
        handleSubmit: submitRegister,
        watch,
        setError: setRegisterError,
        formState: { errors: registerErrors, isSubmitting: isRegistering },
    } = useForm<RegisterForm>();

    const watchedPassword = watch('password');

    const onRegister = submitRegister(async ({ username, email, password }) => {
        try {
            const data = await register(username, password, email);
            setTokens(data.accessToken, data.refreshToken);
            onSuccess();
        } catch (err) {
            setRegisterError('root', { message: errMsg(err) });
        }
    });

    if (!open) return null;

    const field = (hasError: boolean) =>
        `w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none
        dark:bg-gray-800/60 dark:text-gray-100 dark:placeholder-gray-500
        focus:ring-2 focus:ring-violet-400 focus:border-violet-400
        ${hasError
            ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10'
            : 'border-gray-200 dark:border-gray-700 bg-white hover:border-violet-300'}`;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-violet-100/50 dark:shadow-black/40 w-full max-w-md px-8 py-10 border border-gray-100 dark:border-gray-800">

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <X size={16} />
                </button>

                {/* Brand */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/40 mb-4">
                        <Network size={22} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Nexus</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        {mode === 'login' ? 'Welcome back' : 'Create your account'}
                    </p>
                </div>

                {/* Mode switcher */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-7 gap-1">
                    {(['login', 'register'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                mode === m
                                    ? 'bg-white dark:bg-gray-700 text-violet-700 dark:text-violet-300 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            {m === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    ))}
                </div>

                {/* OAuth error */}
                {oauthError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm px-4 py-3 rounded-xl mb-5">
                        Google sign-in failed. Please try again.
                    </div>
                )}

                {/* ── Sign In ── */}
                {mode === 'login' && (
                    <>
                        {loginErrors.root && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm px-4 py-3 rounded-xl mb-5">
                                {loginErrors.root.message}
                            </div>
                        )}
                        <form onSubmit={onLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                                <input
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Enter your username"
                                    {...regLogin('username', { required: 'Username is required' })}
                                    className={field(!!loginErrors.username)}
                                />
                                {loginErrors.username && <p className="text-red-500 text-xs mt-1.5">{loginErrors.username.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    {...regLogin('password', { required: 'Password is required' })}
                                    className={field(!!loginErrors.password)}
                                />
                                {loginErrors.password && <p className="text-red-500 text-xs mt-1.5">{loginErrors.password.message}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full mt-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-violet-200 dark:shadow-violet-900/30 disabled:cursor-not-allowed"
                            >
                                {isLoggingIn ? 'Signing in…' : 'Sign In'}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100 dark:border-gray-800" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white dark:bg-gray-900 px-3 text-xs text-gray-400 dark:text-gray-500 font-medium">or continue with</span>
                            </div>
                        </div>

                        <a
                            href="/oauth2/authorization/google"
                            className="flex items-center justify-center gap-3 w-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-600 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </a>

                        <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-6">
                            Demo — admin / admin123 · user1 / user123
                        </p>
                    </>
                )}

                {/* ── Sign Up ── */}
                {mode === 'register' && (
                    <>
                        {registerErrors.root && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm px-4 py-3 rounded-xl mb-5">
                                {registerErrors.root.message}
                            </div>
                        )}
                        <form onSubmit={onRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                                <input type="text" autoComplete="username" placeholder="Choose a username"
                                    {...regRegister('username', { required: 'Username is required', minLength: { value: 3, message: 'At least 3 characters' } })}
                                    className={field(!!registerErrors.username)} />
                                {registerErrors.username && <p className="text-red-500 text-xs mt-1.5">{registerErrors.username.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                                <input type="email" autoComplete="email" placeholder="you@example.com"
                                    {...regRegister('email', { required: 'Email is required', pattern: { value: EMAIL_PATTERN, message: 'Invalid email address' } })}
                                    className={field(!!registerErrors.email)} />
                                {registerErrors.email && <p className="text-red-500 text-xs mt-1.5">{registerErrors.email.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                                <input type="password" autoComplete="new-password" placeholder="At least 6 characters"
                                    {...regRegister('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                                    className={field(!!registerErrors.password)} />
                                {registerErrors.password && <p className="text-red-500 text-xs mt-1.5">{registerErrors.password.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                                <input type="password" autoComplete="new-password" placeholder="Repeat your password"
                                    {...regRegister('confirmPassword', { required: 'Please confirm your password', validate: (v) => v === watchedPassword || 'Passwords do not match' })}
                                    className={field(!!registerErrors.confirmPassword)} />
                                {registerErrors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{registerErrors.confirmPassword.message}</p>}
                            </div>
                            <button type="submit" disabled={isRegistering}
                                className="w-full mt-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-violet-200 dark:shadow-violet-900/30 disabled:cursor-not-allowed">
                                {isRegistering ? 'Creating account…' : 'Create Account'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
