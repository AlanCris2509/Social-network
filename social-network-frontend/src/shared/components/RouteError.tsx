import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

export default function RouteError() {
    const error = useRouteError();

    let title = 'Unexpected Error';
    let message = 'Something went wrong. Please try again.';

    if (isRouteErrorResponse(error)) {
        title = `${error.status} ${error.statusText}`;
        message = typeof error.data === 'string' ? error.data : error.statusText;
    } else if (error instanceof Error) {
        message = error.message;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-md text-center max-w-md w-full p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-2">{title}</h1>
                <p className="text-gray-500 text-sm mb-6">{message}</p>
                <Link
                    to="/login"
                    className="inline-block bg-blue-600 text-white text-sm px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
