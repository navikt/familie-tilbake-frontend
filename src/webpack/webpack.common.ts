import type { Configuration, WebpackPluginInstance } from 'webpack';

import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

const commonConfig: Configuration = {
    entry: ['./src/frontend/index.tsx'],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        fallback: { crypto: false },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(process.cwd(), '/src/frontend/index.html'),
            inject: 'body',
            alwaysWriteToDisk: true,
            favicon: path.join(process.cwd(), '/src/frontend/favicon.ico'),
        }),
        new CaseSensitivePathsPlugin() as WebpackPluginInstance,
        new ESLintPlugin({
            extensions: [`ts`, `tsx`],
            exclude: [`/node_modules/`],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
                use: [`file-loader`],
            },
            {
                test: /\.(js|jsx|ts|tsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.(css)$/,
                use: [
                    { loader: 'style-loader' },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: 'icss',
                        },
                    },
                ],
            },
        ],
    },
};

export default commonConfig;
