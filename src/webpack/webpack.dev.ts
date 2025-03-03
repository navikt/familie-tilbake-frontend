import type { Module } from 'webpack';

import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import path from 'path';
import webpack from 'webpack';
import { mergeWithRules } from 'webpack-merge';

import baseConfig from './webpack.common';

const devConfig: webpack.Configuration = mergeWithRules({
    module: {
        rules: {
            test: 'match',
            options: 'replace',
        },
    },
})(baseConfig, {
    mode: 'development',
    entry: ['webpack-hot-middleware/client'],
    output: {
        path: path.join(process.cwd(), 'frontend_development'),
        publicPath: '/assets/',
    },
    devtool: 'inline-source-map',
    plugins: [new ReactRefreshWebpackPlugin(), new webpack.HotModuleReplacementPlugin()],
    module: {
        rules: [
            {
                test: /\.(jsx|tsx|ts|js)?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    plugins: ['react-refresh/babel'],
                },
            },
        ],
    },
    optimization: {
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
            },
        },
    },
});

export default devConfig;
