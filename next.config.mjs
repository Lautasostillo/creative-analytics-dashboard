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
  
  // Add headers for DuckDB WASM support and static files
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
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
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

    // Handle large files better
    config.performance = {
      ...config.performance,
      maxAssetSize: 1000000,
      maxEntrypointSize: 1000000,
    };

    return config;
  },
  
  // Ensure public files are copied correctly
  async rewrites() {
    return [
      {
        source: '/data/:path*',
        destination: '/public/data/:path*',
      },
    ];
  },
};

export default nextConfig;
