/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
    env: {
        DATABASE_URL: process.env.DATABASE_URL,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Исключаем Node.js модули из клиентской сборки
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                stream: false,
                crypto: false,
                zlib: false,
                buffer: false,
                util: false,
            }
        }
        return config
    },
}

module.exports = nextConfig
