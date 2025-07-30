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
    optimizeCss: true,
  },
  // Optimizaciones para reducir el tamaño del bundle
  poweredByHeader: false,
  compress: true,
  // Excluir dependencias pesadas del servidor
  serverComponentsExternalPackages: ['@duckdb/duckdb-wasm', 'echarts', 'pandas'],
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      util: false,
    };
    
    // Optimizar para producción
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@duckdb/duckdb-wasm': false,
      };
    }

    // Excluir archivos grandes del bundle
    config.module.rules.push({
      test: /\.(wasm|node)$/,
      type: 'asset/resource',
    });

    return config;
  },
};

export default nextConfig;
