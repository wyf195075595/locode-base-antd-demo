const fs = require('fs-extra');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { version } = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

module.exports = ({ onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    // 代码分割
    config.optimization.splitChunks ({
      chunks: "all", // 必须三选一： "initial" | "all"(推荐) | "async" (默认就是async)
      minSize: 200*1024, // 最小尺寸，200k
      minChunks: 1, // 最小 chunk ，默认1
      maxAsyncRequests: 5, // 最大异步请求数， 默认5
      maxInitialRequests : 3, // 最大初始化请求书，默认3
      automaticNameDelimiter: '~',// 打包分隔符
      // name: function(){}, // 打包后的名称，此选项可接收 function
      cacheGroups:{ // 这里开始设置缓存的 chunks
          common: {// 符合条件抽离成公共模块
              chunks: 'initial', // 入口处开始分析
              minSize: 200*1024,// 体积大于200kb
              minChunks: 6,// 至少引用了1次
          },
          // 抽离第三方模块为公共
          vendor: {
              priority: 1, // 权重，优先抽离公共模快
              test: /node_modules/,// 抽离出来
              chunks: 'initial', // 入口处开始分析
              minSize: 200*1024,// 体积大于200kb
              minChunks: 1,// 至少引用了1次
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                );
                return `chunk.${packageName[1]}`;
              },
          }
      }
 })

    config.output.filename(
      `js/[name].js`
    )

    config.resolve.plugin('tsconfigpaths').use(TsconfigPathsPlugin, [
      {
        configFile: './tsconfig.json',
      },
    ]);

    config.merge({
      node: {
        fs: 'empty',
      },
    });

    config
    .plugin('index')
    .use(HtmlWebpackPlugin, [
      {
        inject: false,
        minify: false,
        templateParameters: {
          version,
        },
        template: require.resolve('./public/index.ejs'),
        filename: 'index.html',
      },
    ]);
    config
      .plugin('preview')
      .use(HtmlWebpackPlugin, [
        {
          inject: false,
          templateParameters: {
          },
          template: require.resolve('./public/preview.html'),
          filename: 'preview.html',
        },
      ]);

    config.plugins.delete('hot');
    config.devServer.hot(false);

    config.module // fixes https://github.com/graphql/graphql-js/issues/1272
      .rule('mjs$')
      .test(/\.mjs$/)
      .include
        .add(/node_modules/)
        .end()
      .type('javascript/auto');
  });
};
