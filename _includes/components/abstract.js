const { html } = require('~lib/common-tags')

/**
 * Publication abstract
 * @param      {Object}  eleventyConfig
 */
module.exports = function(eleventyConfig) {
  const markdownify = eleventyConfig.getFilter('markdownify')
  return function (params) {
    const { abstract } = params

    /*
    TODO: Remove this spec markup when the footnote read/more buttons are accepted as complete:
      <p>Truncated text...</p>
      <button onclick="readMoreFootnote(this)" id="read-more-btn-1">Read more</button>
      <div aria-expanded="false" class="article-section--footnote animate__animated animate__fadeInRight" id="footnote-menu" role="contentinfo"
        data-outputs-exclude="epub,pdf">
        <div class="content-list">
        <button id="readmore-close-button" onclick="closeFootnotes()" class="menu-button is-hidden">
          <span class="visually-hidden">Hide</span>
          <svg>
            <switch>
            <use xlink:href="#close-icon"></use>
            </switch>
          </svg>
        </button>
          ...Rest of text
        </div>
      </div>
    */
    return html`
      <section class="section quire-page__abstract theme-border-bottom">
        <div class="section-two-column">
          <div class="first-column">
            <div class="heading-section">
              <h2><a id="abstract" href="#abstract" data-tooltip="Tooltip Text"></a><span class="icon-heading-text">Abstract</span></h2>
            </div>
            <p class="paragraph">
              ${markdownify(abstract)}
            </p>
          </div>

          <div class="second-column">
          </div>
        </div>
      </section>
    `
  }
}
