const truncate = require("~lib/truncate");
const { html } = require("~lib/common-tags");

/**
 * This controls the various navigation elements (nav, skip-link, menu and
 * search icons, and search results if enabled). It is visible on all pages.
 *
 * A note that while Hugo includes .Next and .Prev variables that can be used
 * to connect to the next and previous pages in the linear order of the site,
 * Quire makes available the option of hiding pages from the linear order in the
 * book in order to have custom pages in other formats (PDF, EPUB, etc.).
 * Because of this, the .Next and .Prev variables are not used here, and instead
 * eligible pages are ranged through and based on weight, the next or previous
 * one in the range is linked to.
 */
module.exports = function (eleventyConfig) {
  const eleventyNavigation = eleventyConfig.getFilter("eleventyNavigation");

  return function (params) {
    const { collections, pagination, title } = params;
    const {
      currentPage,
      currentPageIndex,
      nextPage,
      percentProgress,
      previousPage
    } = pagination;

    if (!currentPage) return;

    const home = "/";

    return html`
      <footer id="footer" class="quire-navbar">
        <nav class="navbar is-expanded" role="navigation" aria-label="footer navigation">
          <div class="navbar-menu">
            <div class="navbar-start">
              <a class="navbar-item" href="/imprint/"> Imprint</a>

              <a class="navbar-item" href="/privacy/">Privacy</a>

              <a class="navbar-item" target="_blank" href="https://www.britishartstudies.ac.uk/about/ip">Copyright</a>
            </div>
            <div class="navbar-end">
              <a href="https://britishart.yale.edu/" target="_blank">
                <svg width="226" height="9">
                  <switch>
                    <use xlink:href="#ycba-logo-icon"></use>
                  </switch>
                </svg>
              </a>
              <a href="https://www.paul-mellon-centre.ac.uk/" target="_blank">
                <svg width="114" height="25">
                  <switch>
                    <use xlink:href="#pmc-logo-icon"></use>
                  </switch>
                </svg>
              </a>
            </div>
          </div>
        </nav>
      </footer>
    `;
  };
};
