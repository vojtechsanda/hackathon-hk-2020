const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: ['@babel/polyfill', './src/assets/js/app.js'],
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'assets/js/[name].js',
    },
    devServer: {
        contentBase: './dist',
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'templates/index.html',
            template: './src/templates/index.html',
            chunks: ['app'],
        }),
        new MiniCssExtractPlugin({
            filename: 'assets/css/[name].css',
        }),
        new CopyPlugin([
            {
                from: 'src/assets/imgs',
                to: 'assets/imgs',
            },
            {
                from: 'src/api/api.json',
                to: 'api_v0/api.json',
            },
            {
                from: 'src/index.php',
                to: 'index.php'
            }
        ]),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'postcss-loader',
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                        },
                    },
                ],
            },
        ],
    },
    mode: 'development',
};
