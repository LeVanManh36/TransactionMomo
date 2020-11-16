const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = {
  target: "node",
  entry: {
    'custom.css': [
      path.resolve(__dirname, 'css/custom.css'),
      path.resolve(__dirname, 'css/theme.css')
    ],
    'main.css': [
      path.resolve(__dirname, 'node_modules/bootstrap-progressbar/css/bootstrap-progressbar-3.3.4.css'),
      path.resolve(__dirname, 'node_modules/perfect-scrollbar/css/perfect-scrollbar.css'),
      path.resolve(__dirname, 'node_modules/select2/dist/css/select2.css'),
      path.resolve(__dirname, 'node_modules/hamburgers/dist/hamburgers.css'),
      // path.resolve(__dirname, 'node_modules/flag-icon-css/css/flag-icon.css')
    ],
    'angular.css': [
      path.resolve(__dirname, 'node_modules/ng-sortable/dist/ng-sortable.css'),
      path.resolve(__dirname, 'node_modules/ng-sortable/dist/ng-sortable.style.css'),
      path.resolve(__dirname, 'node_modules/ng-table/bundles/ng-table.min.css')
    ],
    'vendors': [
      // path.resolve(__dirname, 'node_modules/jquery/dist/jquery.min.js'),
      // path.resolve(__dirname, 'node_modules/moment/min/moment.min.js'),
      // path.resolve(__dirname, 'node_modules/underscore/underscore-min.js'),
      path.resolve(__dirname, 'node_modules/bootstrap-progressbar/bootstrap-progressbar.js'),
      path.resolve(__dirname, 'node_modules/perfect-scrollbar/dist/perfect-scrollbar.js'),
      path.resolve(__dirname, 'node_modules/select2/dist/js/select2.min.js'),
      path.resolve(__dirname, 'libs/sender/cast_sender.js')
    ],
    "angularjs": [
      path.resolve(__dirname, 'node_modules/angular/angular.min.js'),
      path.resolve(__dirname, 'node_modules/@uirouter/angularjs/release/angular-ui-router.min.js'),
      path.resolve(__dirname, 'node_modules/angular-ui-bootstrap/ui-bootstrap-tpls.min.js'),
      path.resolve(__dirname, 'node_modules/angular-css/angular-css.min.js'),
      path.resolve(__dirname, 'node_modules/angular-timeago/dist/angular-timeago.min.js'),
      path.resolve(__dirname, 'node_modules/angular-translate/dist/angular-translate.min.js'),
      path.resolve(__dirname, 'node_modules/angular-translate/dist/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js'),
      path.resolve(__dirname, 'node_modules/ng-mask/dist/ngMask.min.js'),
    ],
    'angular.utils': [
      path.resolve(__dirname, 'node_modules/ng-sortable/dist/ng-sortable.min.js'),
      path.resolve(__dirname, 'node_modules/ng-table/bundles/ng-table.min.js'),
      path.resolve(__dirname, 'node_modules/ngstorage/ngStorage.min.js')
    ]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
      {
        test: /\.js$/,
        use: [
          "babel-loader"
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserJSPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new OptimizeCSSAssetsPlugin({})
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]'
    }),
    new CopyWebpackPlugin({
      patterns: [
        // {from: 'node_modules/angular', to: 'angular'},
        {from: 'node_modules/angular-input-masks', to: 'angular-input-masks'},
        {from: 'node_modules/async', to: 'async'},
        {from: 'node_modules/bootstrap', to: 'bootstrap'},
        {from: 'node_modules/flag-icon-css', to: 'flag-icon-css'},
        {from: 'node_modules/jquery', to: 'jquery'},
        {from: 'node_modules/moment', to: 'moment'},
        {from: 'node_modules/xlsx/dist', to: 'xlsx'},
        {from: 'node_modules/ng-sortable', to: 'ng-sortable'},
        {from: 'node_modules/ng-table', to: 'ng-table'},
        {from: 'node_modules/ngstorage', to: 'ngstorage'},
        {from: 'node_modules/underscore', to: 'underscore'},
        {from: 'node_modules/@fortawesome/fontawesome-free/css/all.min.css', to: 'fonts/fontawesome-5/css/all.min.css'},
        {from: 'node_modules/@fortawesome/fontawesome-free/webfonts', to: 'fonts/fontawesome-5/webfonts'},
        {from: 'node_modules/font-awesome/css', to: 'fonts/fontawesome-4/css'},
        {from: 'node_modules/font-awesome/fonts', to: 'fonts/fontawesome-4/fonts'},
        {from: 'node_modules/material-design-iconic-font/dist/css', to: 'fonts/mdi-font/css'},
        {from: 'node_modules/material-design-iconic-font/dist/fonts', to: 'fonts/mdi-font/fonts'}
      ]
    })
  ]
};
