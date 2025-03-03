import type { Module } from 'webpack';

import { sentryWebpackPlugin } from '@sentry/webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { mergeWithRules } from 'webpack-merge';

import baseConfig from './webpack.common';

const prodConfig = mergeWithRules({
    module: {
        rules: {
            test: 'match',
            use: 'replace',
        },
    },
})(baseConfig, {
    mode: 'production',
    entry: [path.join(process.cwd(), 'src/frontend/index.tsx')],
    output: {
        path: path.join(process.cwd(), 'frontend_production'),
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[chunkhash].js',
        publicPath: '/assets/',
    },
    devtool: 'source-map',
    plugins: [
        new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
        sentryWebpackPlugin({
            org: 'nav',
            project: 'familie-tilbake-frontend',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            url: 'https://sentry.gc.nav.no/',
            release: {
                name: process.env.SENTRY_RELEASE,
                uploadLegacySourcemaps: {
                    paths: ['./frontend_production'],
                    ignore: ['./node_modules'],
                    urlPrefix: `~/assets`,
                },
            },
            errorHandler: err => {
                console.warn('Sentry CLI Plugin: ' + err.message);
            },
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analysis.html',
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                },
            }),
            new CssMinimizerPlugin(),
        ],
        runtimeChunk: 'single',
        moduleIds: 'deterministic',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 20000,
            maxSize: 244000,
            cacheGroups: {
                dateFns: {
                    test: /[\\/]node_modules[\\/]date-fns/,
                    name: 'vendor.date-fns',
                    chunks: 'all',
                    priority: 20,
                    enforce: true,
                    minSize: 0,
                    maxSize: Infinity,
                    reuseExistingChunk: true,
                },
                navikt: {
                    test: /[\\/]node_modules[\\/]@navikt[\\/](.*?)[\\/]/,
                    name(module: Module) {
                        const packageName = module.context?.match(
                            /[\\/]node_modules[\\/]@navikt[\\/](.*?)[\\/]/
                        )?.[1];
                        return `vendor.navikt.${packageName}`;
                    },
                    chunks: 'all',
                    priority: 15,
                    enforce: true,
                    reuseExistingChunk: true,
                },
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module: Module) {
                        const packageName = module.context?.match(
                            /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                        )?.[1];
                        if (!packageName) return 'vendors';

                        if (packageName.startsWith('@sentry/')) {
                            return 'vendor.sentry';
                        }
                        if (packageName === 'react' || packageName === 'react-dom') {
                            return 'vendor.react';
                        }

                        return `vendor.${packageName.replace('@', '')}`;
                    },
                    priority: 10,
                },
                common: {
                    name: 'common',
                    minChunks: 2,
                    priority: -10,
                    reuseExistingChunk: true,
                },
                styles: {
                    name: 'styles',
                    type: 'css/mini-extract',
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
    },
    performance: {
        maxEntrypointSize: 2500000,
        maxAssetSize: 2500000,
    },
});

export default prodConfig;
