import { createBrowserRouter, redirect } from 'react-router-dom';
import AppPage, { loader as appLoader } from './pages/AppPage';
import LandingPage, { loader as landingLoader } from './pages/LandingPage';
import RouteError from './shared/components/RouteError';
import { setTokens } from './shared/utils/auth';

export const router = createBrowserRouter([
    {
        path: '/',
        loader: () => redirect('/home'),
    },
    {
        path: '/home',
        element: <LandingPage />,
        loader: landingLoader,
        errorElement: <RouteError />,
    },
    {
        // Preserve ?error=oauth_failed and similar params coming from the backend
        path: '/login',
        loader: ({ request }) => {
            const { search } = new URL(request.url);
            return redirect(`/home${search}`);
        },
    },
    {
        path: '/app',
        element: <AppPage />,
        loader: appLoader,
        errorElement: <RouteError />,
    },
    {
        // Handles the redirect from the backend after Google OAuth2 success.
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
        loader: () => redirect('/home'),
    },
]);
