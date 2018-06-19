const fs = require('fs');
const sortChunks = require('./sortChunks');

const chunkOnlyConfig = {
  assets: false,
  cached: false,
  children: false,
  chunks: true,
  chunkModules: false,
  chunkOrigins: false,
  errorDetails: false,
  hash: false,
  modules: false,
  reasons: false,
  source: false,
  timings: false,
  version: false
};

module.exports = class AssetsPlugin {
  constructor(opts = {}) {
    this.assetsFile = opts.assetsFile || '._assets.json';
  }
  apply(compiler) {
    compiler.hooks.emit.tapAsync('AssetsPlugin', (compilation, callback) => {
      const chunks = compilation.getStats().toJson(chunkOnlyConfig).chunks
        .filter(c => { // https://github.com/jantimon/html-webpack-plugin/blob/master/index.js#L374
          if (!c.names[0]) return false;
          if (typeof c.isInitial === 'function' && !c.isInitial()) {
            return false;
          } else if (!c.initial) {
            return false;
          }
          return true;
        });

      const sortedChunks = sortChunks(chunks, compilation)
      const jsAssets = new Set();
      const cssAssets = new Set();
      sortedChunks.forEach(c => {
        c.files.forEach(file => {
          if (file.endsWith('.js')) {
            jsAssets.add(file);
          } else if (file.endsWith('.css')) {
            cssAssets.add(file);
          }
        })
      })
      fs.writeFile(
        this.assetsFile,
        JSON.stringify({
          jsAssets: [...jsAssets],
          cssAssets: [...cssAssets]
        }),
        callback
      );
    });
  }
}
