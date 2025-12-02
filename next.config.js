/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable browser source maps in production (default is false anyway)
    productionBrowserSourceMaps: false,

    // Optional: be explicit about the app root to avoid Turbopack root confusion
    turbopack: {
        root: __dirname,
    },
};

module.exports = nextConfig;
