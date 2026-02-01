/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development experience
    reactStrictMode: false,

    // Allow images from external domains
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    // Performance optimizations
    experimental: {
        // Optimize package imports to reduce bundle size
        optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
    },

    // Environment variables exposed to the browser
    env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
};

module.exports = nextConfig;
