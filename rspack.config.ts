import path from 'node:path';
import { defineConfig } from '@rspack/cli';
import { rspack, type SwcLoaderOptions } from '@rspack/core';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';
import { config as loadEnv } from 'dotenv';

// Load environment variables from .env file
loadEnv();

const isDev = process.env.NODE_ENV === 'development';

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ['last 2 versions', '> 0.2%', 'not dead', 'Firefox ESR'];

// Load environment variables with VITE_ prefix
const envVars = Object.fromEntries(
  Object.entries(process.env)
    .filter(([key]) => key.startsWith('VITE_'))
    .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
);

export default defineConfig({
  entry: {
    main: './src/main.tsx',
  },
  output: {
    // Use absolute paths for assets to support client-side routing
    publicPath: '/',
  },
  resolve: {
    extensions: ['...', '.ts', '.tsx', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset',
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: { targets },
            } satisfies SwcLoaderOptions,
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['postcss-loader'],
        type: 'css',
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
    new rspack.DefinePlugin({
      'import.meta.env.MODE': JSON.stringify(
        isDev ? 'development' : 'production',
      ),
      'import.meta.env.DEV': JSON.stringify(isDev),
      'import.meta.env.PROD': JSON.stringify(!isDev),
      ...envVars,
    }),
    isDev ? new ReactRefreshRspackPlugin() : null,
  ],
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // React and React-related packages
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
          name: 'react',
          priority: 30,
          reuseExistingChunk: true,
        },
        // React Flow
        reactflow: {
          test: /[\\/]node_modules[\\/]@xyflow[\\/]/,
          name: 'reactflow',
          priority: 25,
          reuseExistingChunk: true,
        },
        // Animation libraries
        animations: {
          test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
          name: 'animations',
          priority: 20,
          reuseExistingChunk: true,
        },
        // State management
        state: {
          test: /[\\/]node_modules[\\/](zustand|@tanstack[\\/]react-query|immer)[\\/]/,
          name: 'state',
          priority: 15,
          reuseExistingChunk: true,
        },
        // Other vendors
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  },
  experiments: {
    css: true,
  },
  devServer: {
    port: 8080,
    hot: true,
    liveReload: true,

    // Enable client-side routing support (React Router)
    // Returns index.html for all routes that don't match static files
    historyApiFallback: true,

    // // ✅ Configuración del tunnel de ngrok
    // allowedHosts: ['6522-186-99-103-165.ngrok-free.app', 'localhost'],

    // client: {
    //   // Apunta el WebSocket al dominio de ngrok para HMR
    //   webSocketURL: {
    //     hostname: '6522-186-99-103-165.ngrok-free.app',
    //     pathname: '/ws',
    //     port: 443,
    //     protocol: 'wss',
    //   },
    //   overlay: {
    //     errors: true,
    //     warnings: false,
    //   },
    // },

    // headers: {
    //   // Requerido por ngrok para evitar el interstitial
    //   'ngrok-skip-browser-warning': 'true',
    //   'Access-Control-Allow-Origin': '*',
    // },

    // Proxy opcional: redirige /api al backend local
    // proxy: [
    //   {
    //     context: ["/api"],
    //     target: "http://localhost:4000",
    //     changeOrigin: true,
    //   },
    // ],
  },
});
