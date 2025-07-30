/** @type {import('next').NextConfig} */
const nextConfig = {
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
    serverComponentsExternalPackages: ['@duckdb/duckdb-wasm', 'echarts', 'pandas', 'duckdb'],
  },
  poweredByHeader: false,
  compress: true,
  
  // Add headers for DuckDB WASM support
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/data/:path*',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
    ];
  },
  
  webpack: (config, { isServer }) => {
    // Enable WebAssembly support
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    
    // Only add fallbacks for server-side
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        os: false,
        buffer: false,
        process: false,
      };
    }

    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
  },
};

export default nextConfig;
