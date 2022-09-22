const path = require('path')
module.exports = {
  transpileDependencies: ['vuetify'],
  publicPath: '',
  outputDir: './dist',
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src/'),
      },
    },
  },
  devServer: {
    disableHostCheck: true,
    port: 8080,
    public: '0.0.0.0:8080',
  },
}
