import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const env = process.env.NODE_ENV || 'development';

const getWebpackConfig = async () => {
  const { transformBabelAST } = await import("destam-dom/transform/htmlLiteral.js");

  return {
    name: 'opengig.org',
    target: 'web',
    stats: 'minimal',
    devtool: 'source-map',
    mode: env,
    entry: {
      opengig_org: [
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true',
        './frontend/index.jsx'
      ],
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath: '/',
      filename: 'index.js',
    },
    resolve: {
      extensions: ['.html', '.css', '.js', '.jsx'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './frontend/index.html',
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                '@babel/plugin-syntax-jsx',
                () => ({
                  visitor: {
                    Program(path) {
                      transformBabelAST(path.node);
                    },
                  },
                }),
              ],
            },
          },
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico|webp)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext][query]',
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
  };
}

export default await getWebpackConfig();
