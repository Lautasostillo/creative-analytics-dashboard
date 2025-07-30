/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hace que Next empaquete sólo lo necesario
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ["s3.amazonaws.com"],
  },
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

export default nextConfig;
