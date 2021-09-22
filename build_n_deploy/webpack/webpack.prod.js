const path = require('path');

const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');

const baseConfig = require('./webpack.common');

const config = merge.mergeWithRules({
    module: {
        rules: {
            test: 'match',
            use: 'replace',
        }
    }
})(baseConfig, {
    mode: 'production',
    entry: [path.join(process.cwd(), 'src/frontend/index.tsx')],
    output: {
        path: path.join(process.cwd(), 'frontend_production'),
        filename: '[name].[contenthash].js',
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
        new SentryCliPlugin({
            include: 'frontend_production',
            org: 'nav',
            project: 'familie-tilbake-frontend',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            url: 'https://sentry.gc.nav.no/',
            release: process.env.SENTRY_RELEASE,
            urlPrefix: `~/assets`,
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
        runtimeChunk: {
            name: 'runtime',
        },
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
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
        maxEntrypointSize: 800000,
        maxAssetSize: 800000,
    },
});

module.exports = config;
