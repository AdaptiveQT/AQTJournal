// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Static export for Firebase Hosting
    output: 'export',

    // Disable image optimization for static export
    images: { unoptimized: true },

    // This addresses the "turbopack.root should be absolute" warning
    // and plays fine on Vercel as well.
    turbopack: {
        root: process.cwd(),
    },

    // Optional: disable ESLint during CI builds if you hit lint errors on Vercel
    // eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
