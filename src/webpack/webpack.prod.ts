import path from 'path';

import { sentryWebpackPlugin } from '@sentry/webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
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
            sourcemaps: {
                assets: ['frontend_production'],
            },
            org: 'nav',
            project: 'familie-tilbake-frontend',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            url: 'https://sentry.gc.nav.no/',
            release: process.env.SENTRY_RELEASE,
            urlPrefix: `~/assets`,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            errorHandler: (err, invokeErr, compilation) => {
                compilation.warnings.push('Sentry CLI Plugin: ' + err.message);
            },
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

export default prodConfig;
