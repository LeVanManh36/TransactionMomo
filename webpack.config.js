const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: "node",
  entry: {
    index: ["./server.js"],
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
    libraryTarget: 'commonjs',
  },
  mode: "development",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        // Transpiles ES6-8 into ES5
        test: /\.js$/,
        exclude: [
          /node_modules/,
          /\.template$/
        ],
        loader: "babel-loader",
      },
      {
        // Loads the javacript into html template provided.
        // Entry point is set below in HtmlWebPackPlugin in Plugins
        test: /\.html$/,
        use: [{loader: "html-loader"}]
      },
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
          /dist/,
          /data/
        ],
        enforce: 'post',
        use: {
          loader: WebpackObfuscator.loader,
          options: {
            compact: true,
            stringArray: true,
            stringArrayEncoding: 'rc4',
            stringArrayThreshold: 0.8,
            shuffleStringArray: true,
            rotateStringArray: true,
            identifierNamesGenerator: 'hexadecimal',
            numbersToExpressions: true,
            // renameProperties: true,
            splitStrings: true,
            target: 'node',
            transformObjectKeys: true,
            unicodeEscapeSequence: true
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        output: {
          comments: false,
        },
      },
      extractComments: false,
    })],
  },
  plugins: [
    // new WebpackObfuscator({
    //   rotateStringArray: true
    // }),
    new CopyWebpackPlugin({
      patterns: [
        {from: './views', to: 'views'},
        {from: './public/app', to: 'public/app'},
        {from: './public/css', to: 'public/css'},
        {from: './public/dist', to: 'public/dist'},
        {from: './public/fonts', to: 'public/fonts'},
        {from: './public/images', to: 'public/images'},
        {from: './public/libs', to: 'public/libs'},
        {from: './public/index.html', to: 'public/index.html'},
        {from: './package.json', to: 'package.json'},
        {from: './app.json.example', to: 'app.json'},
        {from: './config/roles.json.example', to: 'config/roles.json'},
        {from: './config/pi_config.json.example', to: 'config/pi_config.json'},
        {from: './.env.example', to: '.env.example'},
        // {from: './.env', to: '.env'},
        // {from: './data', to: 'data'},
        // {from: './services/grpc', to: 'services/grpc'}
      ]
    })
  ]
};
