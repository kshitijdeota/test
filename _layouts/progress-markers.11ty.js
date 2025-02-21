const { JSDOM } = require('jsdom')

const { html } = require('~lib/common-tags')

/**
 * Progress markers
 *
 * @param  {Object}  params  Data parameters passed to the template
 * @return {Function}  Function that renders HTML for <li> of progress marker items
 *
 * Parses `content` as HTML and generates list items for each id-having h1/h2
 *
 * TODO: Acknowledgements -- these are probably in-text?
 * TODO: Biblio -- ammend the biblio template to add ids and target it here?
 * TODO: Imprint
 *
 */

module.exports = async function(params) {
  const {content, title} = params
  if (!content) return ''

  const contentDOM = JSDOM.fragment(content)

  // Parse headers for the progress indicator
  const headers = Array.from(contentDOM.querySelectorAll('h1[id],h2[id]'))

  const progressMarkers = headers.map( (header) => {
    const id = header.id
    const href = `#${id}`

    const labelHTML = header.innerHTML

    return html`<li class="progress-marker__item--anchor"><a href="${href}"><span class="list-text" >${labelHTML}</span></a></li>`
  })

  return html`<ol class="progress-marker">
                <li class="progress-marker__item--anchor is-selected"><a id="progress-marker-first" href="#${ this.slugify(title) }"><span class="list-text" >${ this.markdownify(title) }</span></a></li>
                ${ progressMarkers }
              </ol>`

}
