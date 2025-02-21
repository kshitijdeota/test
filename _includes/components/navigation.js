const truncate = require('~lib/truncate')
const { html } = require('~lib/common-tags')

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
module.exports = function(eleventyConfig) {
const eleventyNavigation = eleventyConfig.getFilter('eleventyNavigation')
const pageTitle = eleventyConfig.getFilter('pageTitle')
const { imageDir } = eleventyConfig.globalData.config.figures

return function (params) {
const { collections, pagination, title } = params
const {
currentPage,
currentPageIndex,
nextPage,
percentProgress,
previousPage
} = pagination

if (!currentPage) return

return html`
  <header class="quire-navbar">
    <a href="#main" class="quire-navbar-skip-link" tabindex="1">
      Skip to Main Content
    </a>

    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class="logo" href="/">British Art Studies</a>

        <a
        id="navbar-burger"
          role="button"
          class="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="top-menu"
          onclick="toggleTopMenu()"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>

      </div>
      <div id="top-menu" class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item" href="/gallery/"> Gallery </a>
          <a class="navbar-item" href="/all-issues/"> All Issues </a>
          <a href="/search/" class="navbar-item"> Browse
           <svg data-outputs-exclude="epub,pdf">
              <switch>
                <use xlink:href="#search-icon"></use>
              </switch>
            </svg>
          </a>
          <a class="navbar-item"> About </a>
        </div>
         <div id="top-mode-menu" class="navbar-end" aria-expanded = "false">

        <label class="switch-container">
          <span class="is-hidden-tablet">Viewing Mode</span>
          <span>
          <span class="text-muted">Light</span>
          <span class="switch"
            ><input
              id="toggle-mode-btn"
              aria-label = "Switch dark and light mode"
              type="checkbox"
              onclick="toggleMode()"
             />
            <span class="slider"></span
          ></span>

          <span>Dark</span> <span class="is-hidden-mobile">Mode</span>
          </span>
        </label>
        </div>
        <a
        id="navbar-burger-tablet"
          role="button"
          class="navbar-burger navbar-burger-tablet"
          aria-label="menu"
          aria-expanded="false"
          data-target="mode-menu"
          onclick="toggleModeMenu()"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
    </nav>
  </header>
`;
}
}