const copyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
function resolve (dir) { 
    return path.join(__dirname, dir) 
}
module.exports = {
    devServer: {
      port: 57103 // 端口号配置
    },
    configureWebpack: {
      externals: {
        'AMap': 'AMap' // 高德地图配置
      }
    },
    chainWebpack: config => {
      config.resolve.alias
        .set('styles',resolve('src/assets/styl')) // key,value自行定义，比如.set('@@', resolve('src/components'))
    }
  }
  plugins:[
    new copyWebpackPlugin([
      {
          from:path.resolve(__dirname+'/static'),// 打包的静态资源目录地址
          to:'./static' // 打包到dist下面的static
      }
    ])
  ]