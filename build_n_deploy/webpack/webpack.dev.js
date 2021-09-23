const path = require('path');

const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const merge = require('webpack-merge');

const baseConfig = require('./webpack.common');

const config = merge.mergeWithRules({
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
                    presets: ['react-app'],
                    plugins: ['react-refresh/babel'],
                },
            },
        ],
    },
});

module.exports = config;
