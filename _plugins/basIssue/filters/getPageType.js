/**
 * Looks up a page by key and retrieves its page type
 * @param  {Object} eleventyConfig
 * @param  {String} key             page key
 * @return {Object}                 page type
 */
module.exports = function(collections, key) {

  const found = collections.html.find( (page) => page.data.key === key )
  if (found===undefined) return ''

  const { type } = found.data
  return type ?? ''
}
