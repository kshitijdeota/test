const { JSDOM } = require('jsdom')
const path = require('path')
const { html } = require('~lib/common-tags')

/**
 * Base layout as a JavaScript method
 *
 * @param      {Object}  data    Final data from the Eleventy data cascade
 * @return     {Function}  Template render function
 */
module.exports = async function(data) {
  const { classes, collections, content, layout, pageData, publication } = data
  const { inputPath, outputPath, url } = pageData || {}
  const id = this.slugify(url) || path.parse(inputPath).name
  const pageId = `page-${id}`
  const figures = pageData.page.figures

  return html`
    <!doctype html>
    <html lang="${publication.language}" data-theme="light">
      ${this.head(data)}
      <body>
        ${this.icons(data)}
        ${this.iconscc(data)}
        <div class="quire no-js" id="container">
          <div class="quire__primary">
            ${this.navigation(data)}
            <main class="${classes}" data-output-path="${outputPath}" data-page-id="${pageId}" >
              ${content}
            </main>
            ${this.footer(data)}
          </div>

        </div>
        ${await this.modal(figures)}
        ${this.scripts()}
      </body>
    </html>
  `
}
