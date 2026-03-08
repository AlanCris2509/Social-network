import { createBrowserRouter, redirect } from 'react-router-dom';
import LoginPage, { loader as loginLoader } from './features/auth/LoginPage';
import HomePage, { loader as homeLoader, action as homeAction } from './pages/HomePage';
import RouteError from './shared/components/RouteError';
import { setTokens } from './shared/utils/auth';

export const router = createBrowserRouter([
    {
        path: '/',
        loader: () => redirect('/login'),
        errorElement: <RouteError />,
    },
    {
        path: '/login',
        element: <LoginPage />,
        loader: loginLoader,
        errorElement: <RouteError />,
    },
    {
        path: '/home',
        element: <HomePage />,
        loader: homeLoader,
        action: homeAction,
        errorElement: <RouteError />,
    },
    {
        // Handles the redirect from the backend after Google OAuth2 success.
        // Runs entirely in the loader — tokens are stored before any component
        // renders or any axios request fires, so the interceptor never sees a
        // missing token on this navigation.
        path: '/oauth2/callback',
        loader: ({ request }) => {
            const url = new URL(request.url);
            const accessToken = url.searchParams.get('accessToken');
            const refreshToken = url.searchParams.get('refreshToken');
            if (accessToken && refreshToken) {
                setTokens(accessToken, refreshToken);
                return redirect('/home');
            }
            return redirect('/login?error=oauth_failed');
        },
    },
    {
        path: '*',
        loader: () => redirect('/login'),
    },
]);
