// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // This addresses the "turbopack.root should be absolute" warning
    // and plays fine on Vercel as well.
    turbopack: {
        root: process.cwd(),
    },

    // Optional: disable ESLint during CI builds if you hit lint errors on Vercel
    // eslint: { ignoreDuringBuilds: true },

    // Optional: if you get image optimization issues on Vercel without a loader
    // images: { unoptimized: true },
};

export default nextConfig;
