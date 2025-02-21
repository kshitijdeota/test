const { html } = require('~lib/common-tags')

/**
 * Adds BAS shortcodes.
 *
 * @param  {Object}  eleventyConfig  Eleventy configuration instance
 * @param  {Object}  collections     Eleventy collections instance
 */
module.exports = async function(eleventyConfig, collections) {

  // Small wrapper to pass `content` of a page back to a template render
  // NB: Must be `async function` for renderFile and so `this` exists
  eleventyConfig.addShortcode('contentRenderFile', async function(template) {
    const { content, data } = collections.all.find( item => item.page.url === this.page.url )
    if (!content || !data) return ''

    const { title } = data

    return await eleventyConfig.javascriptFunctions.renderFile(template,{content, title})
  })

  // Produces the markup for two-equal-columns markup
  eleventyConfig.addPairedShortcode('equalcolumns', function(content) {
    const markdownify = eleventyConfig.getFilter('markdownify')

    return `<div class="section-two-column"><div class="first-column"><div class="section-two-equal-column">
            ${markdownify(content)}
            </div></div></div>`
  })

  // Markup for single column within equal-columns
  eleventyConfig.addPairedShortcode('column', (content) => {
    const markdownify = eleventyConfig.getFilter('markdownify')

    return html`<div>${markdownify(content)}</div>`
  })

  // Markup for exhibition / archive slides
  eleventyConfig.addPairedShortcode('slide', (content) => {
    const markdownify = eleventyConfig.getFilter('markdownify')
    return html`<section class="exhibition-section--slide">${markdownify(content)}</section>`
  })

}