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
  // Configuración más permisiva para Railway
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    esmExternals: 'loose',
    optimizeCss: true,
    forceSwcTransforms: true,
  },
  poweredByHeader: false,
  compress: true,
  // Excluir dependencias problemáticas
  serverComponentsExternalPackages: ['@duckdb/duckdb-wasm', 'echarts', 'pandas', 'duckdb'],
  webpack: (config, { isServer, dev }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    
    // Fallbacks más agresivos
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
    
    // Solo aplicar optimizaciones en producción
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@duckdb/duckdb-wasm': false,
      };
    }

    // Ignorar archivos problemáticos
    config.module.rules.push({
      test: /\.(wasm|node)$/,
      type: 'asset/resource',
    });

    // Reducir warnings y errores
    config.stats = {
      ...config.stats,
      warnings: false,
    };

    return config;
  },
};

export default nextConfig;
