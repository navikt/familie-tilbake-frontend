import path from 'path';

import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
// eslint-disable-next-line
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
});

export default devConfig;
