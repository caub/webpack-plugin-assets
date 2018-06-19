const toposort = require('toposort');

module.exports = (chunks, compilation) => {
  // https://github.com/jantimon/html-webpack-plugin/blob/master/lib/chunksorter.js#L47
  const nodeMap = chunks.reduce((m, c) => m.set(c.id, c), new Map());

  const edges = compilation.chunkGroups.reduce((result, chunkGroup) => result.concat(
    Array.from(chunkGroup.parentsIterable, parentGroup => [parentGroup, chunkGroup])
  ), []);

  const sortedGroups = toposort.array(compilation.chunkGroups, edges);

  return sortedGroups
    .reduce((result, chunkGroup) => result.concat(chunkGroup.chunks), [])
    .map(c => nodeMap.get(c.id));
}
