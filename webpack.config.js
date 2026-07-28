'use strict';

const { join } = require('path');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV?.trim() !== 'production';

module.exports = {
  devServer: {
    hot: true,
    port: 5000,
  },

  devtool: 'source-map',

  entry: [
    isDevelopment && 'webpack-hot-middleware/client',
    './client/index.ts',
  ].filter(Boolean),

  mode: 'development',

  module: {
    rules: [
      {
        test: /.ts/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-typescript',
              '@babel/preset-react',
              '@babel/preset-env',
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-optional-chaining'
            ].filter(Boolean),
          },
        },
      },
    ],
  },

  output: {
    filename: 'bundle.js',
    path: join(__dirname, 'public/'),
    publicPath: '/',
  },

  plugins: [new webpack.HotModuleReplacementPlugin()].filter(Boolean),

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
};
