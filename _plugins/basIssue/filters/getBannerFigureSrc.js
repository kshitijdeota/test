/**
 * Looks up a page by key and retrieves the src attribute of its banner figure
 * @param  {Object} eleventyConfig
 * @param  {String} key             page key
 * @return {Object}                 figure data
 */
module.exports = function(eleventyConfig, collections, key) {
  const getFigure = eleventyConfig.getFilter('getFigure')

  const found = collections.html.find( (page) => page.data.key === key )
  if (!found) return

  const { banner_figure } = found.data 
  if (!banner_figure) return

  const figure = getFigure(banner_figure)
  if (!figure) return 

  const { src } = figure
  return src
}
