/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbopack: { root: __dirname }, // make it absolute in Vercel
    },
};
export default nextConfig;
