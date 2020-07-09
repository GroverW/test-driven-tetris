const path = require('path');

module.exports = {
  entry: "frontend/static/js/main.js",
  output: {
    filename: "bundle.js",
    path: `${__dirname}/frontend/static/js`
  },
  resolve: {
    alias: {
      frontend: path.resolve(__dirname, 'frontend/'),
      backend: path.resolve(__dirname, 'src/'),
      common: path.resolve(__dirname, 'common/'),
    },
    extensions: ['.js', '.css', '.html'],
  },
  watch: true
};