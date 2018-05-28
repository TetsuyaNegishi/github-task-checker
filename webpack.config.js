const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  target: 'node',
  entry: path.resolve(__dirname, 'src/app.js'),
  output: {
    path: path.resolve(__dirname),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.js'],
  },
  plugins: [
    new UglifyJsPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
        }],
      },
    ],
  },
};
