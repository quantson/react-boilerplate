const path = require('path');
const webpack = require('webpack');
// merge dev and prod configs
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// npm run start -> Target == 'start'
const TARGET = process.env.npm_lifecycle_event;

const PATHS = {
  app: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'build')
};

// if commented, default is NODE_ENV
// process.env.BABEL_ENV = TARGET;

const common = {
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js'
  },
  // '' allows to import without ext
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel?cacheDirectory' },
    ]
  }
};

if (TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devServer: {
      contentBase: PATHS.build,
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',
      // build source-maps
      devtool: 'eval-source-map',

      host: process.env.HOST,
      port: process.env.PORT
    },
    module: {
      loaders: [
        { test: /\.css$/, loader: 'style-loader!css-loader!postcss-loader' },
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: 'index.html', // Move the index.html file
        inject: true
      })
    ],
    postcss() {
      return [
        require('postcss-import')({ // Import all the css files...
          glob: true,
          onImport: function (files) {
            files.forEach(this.addDependency); // ...and add dependecies from the main.css files to the other css files...
          }.bind(this) // ...so they get hot–reloaded when something changes...
        }),
        require('postcss-simple-vars')(), // ...then replace the variables...
        require('postcss-focus')(), // ...add a :focus to ever :hover...
        require('autoprefixer')({ // ...and add vendor prefixes...
          browsers: ['last 2 versions', 'IE > 8'] // ...supporting the last 2 major browser versions and IE 8 and up...
        }),
        require('postcss-reporter')({ // This plugin makes sure we get warnings in the console
          clearMessages: true
        })
      ];
    },
  });
}

if (TARGET === 'build') {
  module.exports = merge(common, {});
}
