const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  target: 'web',
  
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true, // 提高构建速度
            configFile: 'tsconfig.json'
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  
  resolve: {
    extensions: ['.ts', '.js'],
    // htmlparser2 在浏览器中需要特殊处理
    fallback: {
      // htmlparser2 依赖的这些模块在浏览器中不需要
      "fs": false,
      "path": false,
      "util": false,
      "stream": false,
      "events": false,
    }
  },
  
  output: {
    path: path.resolve(__dirname, 'dist/browser'),
    filename: 'markdownify.min.js',
    library: 'Markdownify',
    libraryTarget: 'umd',
    globalObject: 'this',
    // 清理输出
    clean: false,
  },
  
  // 优化配置
  optimization: {
    minimize: true,
    // 内联所有依赖，避免外部引用
    usedExports: true,
  },
  
  // 性能优化
  performance: {
    maxEntrypointSize: 512000, // 500KB
    maxAssetSize: 512000, // 500KB
  },
  
  // 不生成 source map 以减小体积
  devtool: false,
  
  // 排除 node_modules 但不转译
  externals: {
    // 所有依赖都打包，不设外部依赖
  },
};