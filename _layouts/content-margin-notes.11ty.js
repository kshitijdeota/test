const { JSDOM } = require('jsdom')

const { html } = require('~lib/common-tags')

/**
 * Content w/ margin notes
 *
 * @param  {Object}  params  Data parameters passed to the template
 * @return {Function}  Function that renders HTML for div wrapping para and margin notes
 *
 * Parses `content` as HTML and generates markup for the para-w-margin-notes layout
 *
 */

/**
 * @function alignPTag
 * @parameter node   {string} - text element to align
 * @parameter footnoteContents   {Array<Node>} - footnote content blocks
 * @parameter readMoreThreshold {Number} - number of words to keep in notes before creating read more
 *
 * @returns {string}
 *
 * Renders a text-contianing element into an outer div with two enclosing divs with notes in the second div
 * @TODO: sanitize / escape innerText for attribute-allowable chars
 **/
function alignPTag(node,footnoteContents,contentDOM,readMoreThreshold=9) {
  const footnoteRefs = Array.from(node.querySelectorAll('.footnote-ref-anchor'))

  // Find notes by their references and create the read-more trigger
  const marginNotes = footnoteRefs.map( (anchor) => {
    const footnoteId = anchor.href.replace(/.+#/,'')
    const id = anchor.href.replace(/.+#fn/,'')

    const noteItem = footnoteContents.find( fn => fn.id === footnoteId )

    if (!noteItem) { return '' }

    // NB: Must clone or bottom footnote nodes will mutate
    let alignedNote = noteItem.cloneNode(true)

    // Remove quire's footnote backref jump and get its para content
    alignedNote.querySelector('.footnote-backref')?.remove()
    let note = alignedNote.querySelector('p.paragraph')

    // TODO: Truncate in HTML space to preserve tags in read more preview content
    const noteText = note.textContent
    const noteHead = noteText.split(" ").slice(0,readMoreThreshold).join(" ")
    const hasReadMore = noteText.length > noteHead.length

    let footnodeID = alignedNote.querySelector('span.footnote-id')
    footnodeID?.classList.add('is-hidden')

    // Create a node for this note with our target note markup
    const noteTempl = contentDOM.window.document.createElement('div')
    noteTempl.innerHTML = hasReadMore ? `<div class="footnote-block">
      <button class="" onclick="readMoreFootnote('${ id }')" id="read-more-btn-${id}">
        <span class="footnote-number">${ id }</span>
        ${ noteHead }...
        <span class="footnote-more">more</span>
      </button>
    </div>` : `<div class="footnote-block"><span class="footnote-number">${ id }</span> ${ note.innerHTML }</div>`
    note.replaceWith(...noteTempl.children)

    return alignedNote.innerHTML
  })

  // Create hidden expanded note blocks
  const noteExpandedContents = footnoteRefs.map( (anchor) => {
    const footnoteId = anchor.href.replace(/.+#/,'')
    const id = anchor.href.replace(/.+#fn/,'')
    const noteItem = footnoteContents.find( fn => fn.id === footnoteId )

    if (!noteItem) { return '' }

    // NB: Must clone or bottom footnote nodes will mutate
    let alignedNode = noteItem.cloneNode(true)

    // Remove quire's footnote backref jump and get its para content
    alignedNode.querySelector('.footnote-backref')?.remove()

    // Hide the node's number span
    let footnodeID = alignedNode.querySelector('span.footnote-id')
    footnodeID?.classList.add('is-hidden')

    // Get the note text markup and wrap it in the slide-in markup and click handler bindings
    let note = alignedNode.querySelector('p.paragraph')

    const noteTempl = contentDOM.window.document.createElement('div')
    noteTempl.innerHTML = `<div>
      <div aria-expanded="false" class="is-hidden article-section--footnote animate__animated animate__fadeInRight" id="footnote-menu-${id}" role="contentinfo"
        data-outputs-exclude="epub,pdf">
        <div class="content-list">
          <button id="readmore-close-button-${id}" onclick="closeFootnotes('${id}')" class="menu-button is-hidden">
            <span class="visually-hidden">Hide</span>
            <svg>
              <switch>
              <use xlink:href="#close-icon"></use>
              </switch>
            </svg>
          </button>
          <span>${ id }<span>
          ${ note.outerHTML }
        </div>
    </div>
    </div>`
    note.replaceWith(...noteTempl.children)

    return alignedNode.innerHTML
  })

  // Wrap the para for the two-col layout
  return `<div class="section-two-column">
                <div class="first-column">${node.outerHTML}${noteExpandedContents.join('')}</div>
                <div class="second-column">${marginNotes.join('')}</div>
              </div>`
}

/**
 * @function alignH2Tag
 * @parameter id   {string} - id of the output h2
 * @parameter html {string} - HTML for the h2
 * @parameter text {string} - Text for the DOI tooltip
 *
 * @returns {string}
 *
 * Renders an H2 tag with tooltip
 * @TODO: sanitize / escape innerText for attribute-allowable chars
 **/
function alignH2Tag(id,html,text) {
  return `<h2><a id="${id}" href="#${id}" data-tooltip="${text}"></a><span class="icon-heading-text">${html}</span></h2>`
}

/**
 * @function alignPageMarkup
 * @parameter contentDOM {JSDOM.DOM} parsed content DOM from a BAS article
 *
 * @returns {string} Article content aligned into target markup
 *
 **/
function alignArticleMarkup(contentDOM) {
  const footnoteContents = Array.from(contentDOM.window.document.querySelectorAll('li.footnote-item'))

  /** Walk the markdown output's content DOM children
   * - Re-render p tags (ie, running text) in the two-column layout with footnote leaders in 2nd column
   * - Render h2 header tags with the DOI link markup
   **/
  const contentElements = Array.from(contentDOM.window.document.body.children).map( (el) => {
    switch (el.tagName.toLowerCase()) {
      case 'blockquote':
      case 'figure':
        return `<div class="section-two-column"><div class="first-column">${el.outerHTML}</div><div class="second-column"></div></div>`
      case 'h2':
        return alignH2Tag(el.id,el.innerHTML,el.innerText)
      case 'p':
        return alignPTag(el,footnoteContents,contentDOM)
      case 'div':
        if ( el.classList.contains('backmatter') 
              && el.firstElementChild?.id === 'footnotes' 
              && el.firstElementChild?.tagName.toLowerCase() === 'h2' ) {
          return `<div class="backmatter">
                    <h2>
                    <a id="footnotes" href="#footnotes" data-tooltip="undefined"></a>
                    <span class="icon-heading-text">${el.firstElementChild.innerHTML}</span>
                    </h2>
                  </div>`
        }
      default:
        return el.outerHTML
    }
  })

  return contentElements.join('')
}

module.exports = async function(params) {
  const {content, title} = params
  if (!content) return ''

  const parsedContent = new JSDOM(content)
  const aligned = alignArticleMarkup(parsedContent)

  return html(aligned)
}
