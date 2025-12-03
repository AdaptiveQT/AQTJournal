// next.config.cjs
const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbopack: {
            // quiet the warning; optional to keep
            root: path.resolve(__dirname),
        },
    },
    productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
