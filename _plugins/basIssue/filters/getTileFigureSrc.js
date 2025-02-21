/**
 * Looks up a page by key and retrieves the data of its tile figure source path
 * @param  {Object} eleventyConfig
 * @param  {String} key             page key
 * @return {Object}                 figure data
 */
module.exports = function(eleventyConfig, collections, key) {
  const getFigure = eleventyConfig.getFilter('getFigure')

  const found = collections.html.find( (page) => page.data.key === key )
  if (!found) return

  const { tile_figure } = found.data 
  if (!tile_figure) return

  const figure = getFigure(tile_figure)
  if (!figure) return 

  const { src } = figure
  return src
}
