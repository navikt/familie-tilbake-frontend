import path from 'path';

import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
// eslint-disable-next-line
import webpack from 'webpack';

const commonConfig: webpack.Configuration = {
    entry: ['./src/frontend/index.tsx'],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.less'],
        fallback: { crypto: false },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(process.cwd(), '/src/frontend/index.html'),
            inject: 'body',
            alwaysWriteToDisk: true,
        }),
        new CaseSensitivePathsPlugin(),
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
                options: {
                    presets: ['react-app'],
                },
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.(less|css)$/,
                use: [
                    { loader: 'style-loader' },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: 'icss',
                        },
                    },
                    { loader: 'less-loader' },
                ],
            },
        ],
    },
};

export default commonConfig;
