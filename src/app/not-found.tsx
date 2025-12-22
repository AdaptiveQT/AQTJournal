import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="text-8xl font-bold text-blue-500 mb-4">404</div>
                <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
                <p className="text-slate-400 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
                >
                    ← Back to Journal
                </Link>
            </div>
        </div>
    );
}
