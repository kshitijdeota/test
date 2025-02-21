//@ts-check

/**
 * @fileOverview
 * @name application.js
 * @description This file serves as the entry point for Webpack, the JS library
 * responsible for building all CSS and JS assets for the theme.
 */

// Stylesheets
import '../../fonts/index.scss'
import '../../styles/application.scss'
import '../../styles/screen.scss'
import '../../styles/custom.css'

// Modules (feel free to define your own and import here)
import './canvas-panel'
import './soundcloud-api.min.js'
import { goToFigureState, setUpUIEventHandlers } from './canvas-panel'
import Accordion from './accordion'
import Search from '../../../../_plugins/search/search.js'
import scrollToHash from './scroll-to-hash'

// array of leaflet instances
const mapArr = []

/**
 * @function mobileFootnoteHandler
 * @description Triggers next / prev issue buttons on issue homepage
 **/
const nextPrevIssueButtonHandler = (event) => {
  const { href } = event.target.dataset
  if (href) {
    window.location.href = href
  }
}

/**
 * @function setupNextPrevIssueButtons
 * @description Adds click handlers to next/prev issue buttons
 **/
const setupNextPrevIssueButtons = () => {
  const buttons = document.querySelectorAll('.issue-section--button')
  buttons.forEach( b => {
    b.addEventListener('click',nextPrevIssueButtonHandler)
  })
}

/**
 * @function mobileFootnoteHandler
 * @description Triggers opening of footnote panels when footnote ref anchor is tapped on mobile
 **/
const mobileFootnoteHandler = (event) => {
  // @TODO: Run a matchMedia query here
  // @TODO: Load bulma's breakpoints from CSS vars

  // if (window.innerWidth <= 1024) {
  //   return
  // }
  event.preventDefault()
  event.stopPropagation()
  const fnId = event.target.id.replace(/fnref/,'')
  window.readMoreFootnote(fnId)
}

function setupMobileFootnoteHandler() {
  for ( const a of document.querySelectorAll('a.footnote-ref-anchor') ) {
    a.removeEventListener('click',onHashLinkClick)
    a.addEventListener( 'click', mobileFootnoteHandler )
  }
}

/**
 * @function closeKeywords
 * @description Closes the keyword drawer
 **/
const closeKeywords = () => {
  const keywordsBtn = document.getElementById('keywords-button')
  if (keywordsBtn) {
    keywordsBtn.dataset.isOpen = 'false'
  }

  const keywordsBtnText = document.getElementById('menu-btn-text')
  const keywordsCloseBtnIcon = document.getElementById('menu-btn-active')
  const keywordDrawer = document.querySelector('section.article-section--keywords')

  keywordsBtnText?.classList.remove('is-hidden')
  keywordsCloseBtnIcon?.classList.add('is-hidden')
  keywordDrawer?.classList.add('is-hidden')
  keywordDrawer?.removeAttribute('tabindex')
  keywordsBtn?.blur();
}

const openKeywords = () => {
  const keywordsBtn = document.getElementById('keywords-button')
  if (keywordsBtn) {
    keywordsBtn.dataset.isOpen = 'true'
  }

  const keywordsBtnText = document.getElementById('menu-btn-text')
  const keywordsCloseBtnIcon = document.getElementById('menu-btn-active')
  const keywordDrawer = document.querySelector('section.article-section--keywords')

  keywordsBtnText?.classList.add('is-hidden')
  keywordsCloseBtnIcon?.classList.remove('is-hidden')
  keywordDrawer?.classList.remove('is-hidden')
  keywordDrawer?.setAttribute('tabindex', '1')
  keywordDrawer?.focus()
}

const closePageContentMenu = () => {
  const menu = document.getElementById('content-menu')
  const menuBtn = document.getElementById('quire-controls-menu-button')
  const tocBtnInactiveIcon = document.getElementById('toc-btn-inactive')
  const tocBtnActiveIcon = document.getElementById('toc-btn-active')
  const mobileHeading = document.getElementById('sub-heading-mobile')
  const menuAriaStatus = menu?.getAttribute('aria-expanded')
  const firstLink = document.getElementById('progress-marker-first')

  menu?.classList.remove('is-expanded')
  tocBtnInactiveIcon?.classList.remove('is-hidden')
  tocBtnActiveIcon?.classList.add('is-hidden')
  mobileHeading?.classList.remove('is-hidden')

  menu?.setAttribute('aria-expanded', 'false')
  firstLink?.focus() // add focus to the first item on the list
  document.documentElement.style.overflow = 'scroll';
  document.body.scroll = 'yes'
}

const openPageContentMenu = () => {
  const menu = document.getElementById('content-menu')
  const menuBtn = document.getElementById('quire-controls-menu-button')
  const tocBtnInactiveIcon = document.getElementById('toc-btn-inactive')
  const tocBtnActiveIcon = document.getElementById('toc-btn-active')
  const mobileHeading = document.getElementById('sub-heading-mobile')
  const menuAriaStatus = menu.getAttribute('aria-expanded')
  const firstLink = document.getElementById('progress-marker-first')

  menu.classList.add('is-expanded')
  tocBtnInactiveIcon.classList.add('is-hidden')
  tocBtnActiveIcon.classList.remove('is-hidden')
  mobileHeading?.classList.add('is-hidden')

  menu.setAttribute('aria-expanded', 'true')
  menuBtn.blur() // this is hacky way to remove focus
  document.documentElement.style.overflow = 'hidden';
  document.body.scroll = 'no'
}

/**
 * @function closePageContentAndKeywords
 * @description Closes all in-page context menus
 **/

const closePageContentAndKeywords = () => {
  closeKeywords()
  closePageContentMenu()
}

// TODO: Add an outer click handler to catch the click on not-menu?

/**
 * toggleContentMenu
 * @description Toggles the in-essay content menu
 */
window['toggleContentMenu'] = () => {
  const menu = document.getElementById('content-menu')
  const isOpen = menu?.getAttribute('aria-expanded') === 'true'

  if (isOpen) {
    closePageContentMenu()
    return
  }


  closeKeywords()
  openPageContentMenu()
}

/**
 * toggleKeywords
 * @description Toggles the keyword drawer on essays
 **/
window['toggleKeywords'] = () => {
  const keywordsBtn = document.getElementById('keywords-button')
  const isOpen = keywordsBtn?.dataset.isOpen === 'true'

  if (isOpen) {
    closeKeywords()
    return
  }

  closePageContentMenu()
  openKeywords()
}

/**
 * toggleMenu
 * @description Toggles the quire menu -- deprecated in bas-issue-framework
 */
window['toggleMenu'] = () => {
  const menu = document.getElementById('site-menu')
  const catalogEntryImage = document.querySelector(
    '.side-by-side > .quire-entry__image-wrap > .quire-entry__image'
  )
  const menuAriaStatus = menu.getAttribute('aria-expanded')
  const articleStickyHeading = document.querySelector(
    '.sub-heading-section'
  )
  menu.classList.toggle('is-expanded', !menu.classList.contains('is-expanded'))
  if (menuAriaStatus === 'true') {
    catalogEntryImage && catalogEntryImage.classList.remove('menu_open')
    articleStickyHeading && articleStickyHeading.classList.remove('is-hidden')
    menu.setAttribute('aria-expanded', 'false')
  } else {
    catalogEntryImage && catalogEntryImage.classList.add('menu_open')
    articleStickyHeading && articleStickyHeading.classList.add('is-hidden')
    menu.setAttribute('aria-expanded', 'true')
  }
}

/**
 * toggleModeMenu
 * @description Shows/hides the dark/light mode menu (mostly tablets)
 */
window['toggleModeMenu'] = () => {
  const burger = document.getElementById('navbar-burger-tablet');
  const menu = document.getElementById('top-mode-menu');
  const menuAriaStatus = menu.getAttribute('aria-expanded')
  const articleStickyHeading = document.querySelector(
    '.sub-heading-section'
  )
  burger.classList.toggle('is-active');
  menu.classList.toggle('is-active');
  if (menuAriaStatus === 'true') {
    articleStickyHeading && articleStickyHeading.classList.remove('is-hidden')
    menu.setAttribute('aria-expanded', 'false')
  } else {
    articleStickyHeading && articleStickyHeading.classList.add('is-hidden')
    menu.setAttribute('aria-expanded', 'true')
  }
}

/**
 * toggleMode
 * @description Toggles dark/light mode
 */
window['toggleMode'] = () => {
  let modeControls = document.getElementById('toggle-mode-btn')
  if (modeControls.checked === true) {
    document.querySelector("html").setAttribute("data-theme", 'dark');
    document.querySelector("bas-search-browse").setAttribute("theme","dark")
  } else {
    document.querySelector("html").setAttribute("data-theme", 'light');
    document.querySelector("bas-search-browse").setAttribute("theme","light")
  }
}

/**
 * toggleSearch
 * @description Toggles the visibility and ARIA controls of the search input
 */
window['toggleSearch'] = () => {
  let searchControls = document.getElementById('js-search')
  let searchInput = document.getElementById('js-search-input')
  let searchAriaStatus = searchControls.getAttribute('aria-expanded')
  searchControls.classList.toggle(
    'is-active',
    !searchControls.classList.contains('is-active')
  )
  if (searchAriaStatus === 'true') {
    searchControls.setAttribute('aria-expanded', 'false')
  } else {
    searchInput.focus()
    searchControls.setAttribute('aria-expanded', 'true')
  }
}

/**
 * toggleTopMenu
 * @description Show/hide the site nav menu
 */
window['toggleTopMenu'] = () => {
  const burger = document.getElementById('navbar-burger');
  const menu = document.getElementById('top-menu');
  const articleStickyHeading = document.querySelector(
    '.sub-heading-section'
  );
  burger.classList.toggle('is-active');
  menu.classList.toggle('is-active');
  if (menu.classList.contains("is-active")) {
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
    articleStickyHeading && articleStickyHeading.classList.add('is-hidden')
  } else {
    document.documentElement.style.overflow = 'scroll';
    document.body.scroll = "yes";
    articleStickyHeading && articleStickyHeading.classList.remove('is-hidden')
  }

}

/**
 * toggleCaptionDetails
 * @description Show/hide the caption on banner figures
 */
window['toggleCaptionDetails'] = (e) => {
  const captionBtn = document.getElementById('caption-button');
  const captionDetails = document.getElementById('caption-details');
  if(e.classList.contains('close-button')){
   captionDetails.classList.add('is-closed');
   captionBtn.classList.remove('hide');
  } else {
    e.classList.add('hide');
    captionDetails.classList.remove('is-closed');

  }
}

/**
 * readMoreFootnote
 * @description Show a footnote by its ID number
 */
window['readMoreFootnote'] = (noteId) => {
  // Close any other open footnotes
  document.querySelectorAll("[id^='footnote-menu-'][aria-expanded='true']").forEach( fn => {
    const noteId = fn.id.replace(/footnote-menu-/,'')
    window.closeFootnotes(noteId)
  })
  const closeMoreContent = document.getElementById(`readmore-close-button-${noteId}`)
  const readMoreContent = document.getElementById(`footnote-menu-${noteId}`)

  readMoreContent?.classList.remove('animate__fadeOutRight')
  readMoreContent?.classList.add('animate__fadeInRight')
  readMoreContent?.classList.add('is-expanded')
  readMoreContent?.classList.add('is-block')
  readMoreContent?.setAttribute('aria-expanded', 'true')
  closeMoreContent?.classList.remove('is-hidden')
}

/**
 * closeFootnotes
 * @description Hide a footnote by its ID number
 */
window['closeFootnotes'] = (noteId) => {
  const closeMoreContent = document.getElementById(`readmore-close-button-${noteId}`)
  const readMoreContent = document.getElementById(`footnote-menu-${noteId}`)

  readMoreContent?.classList.remove('animate__fadeInRight')
  readMoreContent?.classList.add('animate__fadeOutRight')
  toggleClassWithDelay(readMoreContent, "is-expanded", 1000)
  toggleClassWithDelay(readMoreContent, "is-block", 1000)
  readMoreContent?.setAttribute('aria-expanded', 'false')
  closeMoreContent?.classList.add('is-hidden')
}

function toggleClassWithDelay(element, className, delay) {
  setTimeout(() => {
    element.classList.toggle(className);
  }, delay);
}

/**
 * readMoreDetails
 * @description Show/hide read more dots and expanded summary on all-issues accordion
 */
window['readMoreDetails'] = (el) => {

  var dots = el.parentElement.querySelector(".dots");
  var moreText = el.parentElement.querySelector(".more-text");
  var btnText = el.parentElement.querySelector(".read-more-details");

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Read more";
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "Read less";
    moreText.style.display = "inline";
  }
}


// back to top button
let backToTop = document.getElementById("back-to-top");
let progress
// When the user scrolls down 20px from the top of the document, show the button
window.addEventListener('scroll', function() {
  // Get the current scroll position
  const scrollY = window.scrollY; // Vertical scroll position

  if (scrollY > 20) {
    backToTop.classList.remove('is-hidden');
  } else {
    backToTop.classList.add('is-hidden');
  }

  //check the page height and if footer is visible, if so then adjust the left sticky nav height
  const pageHeight = window.innerHeight || document.documentElement.clientHeight;
  const footerTopY = document.getElementById('footer').getBoundingClientRect().top.toFixed();
  const leftNav = document.getElementById("content-menu");
  if ((pageHeight - footerTopY) > 0){
    leftNav?.classList.add('offset-footer')
  } else {
    leftNav?.classList.remove('offset-footer')
  }
});

window['topFunction'] = () => {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}


var acc = document.getElementsByClassName("accordion-button");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}

/**
 * @function handleBASSearch
 * 
 * Handles .oninput event for search component
 **/ 
window['handleBASSearch'] = () => {
  const searchInput = document.getElementById('js-search-input')
  if (!searchInput) return

  const term = searchInput?.value

  let searchComponent = document.querySelector('bas-search-browse')
  searchComponent?.setAttribute('search-term',term)
}

/**
 * Paul Frazee's easy templating function
 * https://twitter.com/pfrazee/status/1223249561063477250?s=20
 */
function createHtml(tag, attributes, ...children) {
  const element = document.createElement(tag)
  for (let attribute in attributes) {
    if (attribute === 'className') element.className = attributes[attribute]
    else element.setAttribute(attribute, attributes[attribute])
  }
  for (let child of children) element.append(child)
  return element
}

/**
 * search
 * @description makes a search query using Lunr
 */
window['search'] = () => {
  let searchInput = document.getElementById('js-search-input')
  let searchQuery = searchInput['value']
  let searchInstance = window['QUIRE_SEARCH']
  let resultsContainer = document.getElementById('js-search-results-list')
  let resultsTemplate = document.getElementById('js-search-results-template')
  if (searchQuery.length >= 3) {
    let searchResults = searchInstance.search(searchQuery)
    displayResults(searchResults)
  }

  function clearResults() {
    resultsContainer.innerText = ''
  }

  function displayResults(results) {
    clearResults()
    results.forEach(result => {
      let clone = document.importNode(resultsTemplate.content, true)
      let item = clone.querySelector('.js-search-results-item')
      let title = clone.querySelector('.js-search-results-item-title')
      let type = clone.querySelector('.js-search-results-item-type')
      let length = clone.querySelector('.js-search-results-item-length')
      item.href = result.url
      title.textContent = result.title
      type.textContent = result.type
      length.textContent = result.length
      resultsContainer.appendChild(clone)
    })
  }
}

function onHashLinkClick(event) {
  // only override default link behavior if it points to the same page
  const anchor = event.target.closest('a')
  const hash = anchor.hash
  if (anchor.pathname.includes(window.location.pathname)) {
    // prevent default scrolling behavior
    event.preventDefault()
    // ensure the hash is manually set after preventing default
    window.location.hash = hash

  }
  //scrollToHash(hash)

  scrollToHash(hash, 8000, 'slide')
}

function setupCustomScrollToHash() {
  const invalidHashLinkSelectors = [
    '[href="#"]',
    '[href="#0"]',
    '.accordion-section__heading-link',
    '.q-figure__modal-link'
  ]
  const validHashLinkSelector =
    'a[href*="#"]' +
    invalidHashLinkSelectors
      .map((selector) => `:not(${selector})`)
      .join('')
  // Select all links with hashes, ignoring links that don't point anywhere
  const validHashLinks = document.querySelectorAll(validHashLinkSelector)
  validHashLinks.forEach((link) => {
    link.addEventListener('click', onHashLinkClick)
  })
}

/**
 * globalSetup
 * @description Initial setup on first page load.
 */
function globalSetup() {
  let container = document.getElementById('container')
  container.classList.remove('no-js')
  var classNames = []
  if (navigator.userAgent.match(/(iPad|iPhone|iPod)/i))
    classNames.push('device-ios')

  if (navigator.userAgent.match(/android/i)) classNames.push('device-android')

  if (classNames.length) classNames.push('on-device')

  loadSearchData()
  setupCustomScrollToHash()
}

/**
 * loadSearchData
 * @description Load full-text index data from the specified URL
 * and pass it to the search module.
 */
function loadSearchData() {
  // Grab search data
  const dataURL = document.getElementById('js-search')?.dataset?.searchIndex
  if (!dataURL) {
    console.warn('Search data url is undefined')
    return
  }
  fetch(dataURL).then(async (response) => {
    const { ok, statusText, url } = response
    if (!ok) {
      console.warn(`Search data ${statusText.toLowerCase()} at ${url}`)
      return
    }
    const data = await response.json()
    window['QUIRE_SEARCH'] = new Search(data)
  })
}

/**
 * Applies MLA format to date
 *
 * @param  {Date}   date   javascript date object
 * @return {String}        MLA formatted date
 */
function mlaDate(date) {
  const options = {
    month: 'long'
  }
  const monthNum = date.getMonth()
  let month
  if ([4, 5, 6].includes(monthNum)) {
    let dateString = date.toLocaleDateString('en-US', options)
    month = dateString.replace(/[^A-Za-z]+/, '')
  } else {
    month = (month === 8) ? 'Sept' : date.toLocaleDateString('en-US', options).slice(0, 3)
    month += '.'
  }
  const day = date.getDate()
  const year = date.getFullYear()
  return [day, month, year].join(' ')
}

/**
 * @description
 * Set the date for the cite this partial
 * https://github.com/gettypubs/quire/issues/153
 * Quire books include a "Cite this Page" feature with page-level citations formatted in both Chicago and MLA style.
 * For MLA, the citations need to include a date the page was accessed by the reader.
 *
 */
function setDate() {
  const dateSpans = document.querySelectorAll('.cite-current-date')
  const formattedDate = mlaDate(new Date())
  dateSpans.forEach(((dateSpan) => {
    dateSpan.innerHTML = formattedDate
  }))
}

/**
* Translates the X-position of an element inside a container so that its contents
* are contained
* Expects the contained element to already be translated so that it's centered above
* another element
*
* @param {object} element to position
* @param {object} container element
* @param {number} container margin
*/
function setPositionInContainer(el, container) {
  const margin = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap'))
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  const leftDiff = containerRect.left - elRect.left
  const rightDiff = elRect.right - containerRect.right
  const halfElWidth = elRect.width/2
  // x
  if (rightDiff > 0) {
    el.style.transform = `translateX(-${halfElWidth+rightDiff+margin}px)`
  } else if (leftDiff > 0) {
    el.style.transform = `translateX(-${halfElWidth-leftDiff-margin}px)`
  }
  // @todo y
}

/**
 * @description
 * find expandable class and look for aria-expanded
 * https://github.com/gettypubs/quire/issues/152
 * Cite button where users can select, tied to two config settings:
 * citationPopupStyle - text for text only | icon for text and icon
 * citationPopupLinkText which is whatever text you it to say
 */
function toggleCite() {
  let expandables = document.querySelectorAll('.expandable [aria-expanded]')
  for (let i = 0; i < expandables.length; i++) {
    expandables[i].addEventListener('click', event => {
      // Allow these links to bubble up
      event.stopPropagation()
      let expanded = event.target.getAttribute('aria-expanded')
      if (expanded === 'false') {
        event.target.setAttribute('aria-expanded', 'true')
      } else {
        event.target.setAttribute('aria-expanded', 'false')
      }
      let content = event.target.parentNode.querySelector(
        '.quire-citation__content'
      )
      if (content) {
        content.getAttribute('hidden')
        if (typeof content.getAttribute('hidden') === 'string') {
          content.removeAttribute('hidden')
        } else {
          content.setAttribute('hidden', 'hidden')
        }
        setPositionInContainer(content, document.documentElement)
      }
    })
  }
  document.addEventListener('click', event => {
    let content = event.target.parentNode
    if (!content) return
    if (
      content.classList.contains('quire-citation') ||
      content.classList.contains('quire-citation__content')
    ) {
      // do nothing
    } else {
      // find all Buttons/Cites
      let citeButtons = document.querySelectorAll('.quire-citation__button')
      let citesContents = document.querySelectorAll('.quire-citation__content')
      // hide all buttons
      if (!citesContents) return
      for (let i = 0; i < citesContents.length; i++) {
        if (!citeButtons[i]) return
        citeButtons[i].setAttribute('aria-expanded', 'false')
        citesContents[i].setAttribute('hidden', 'hidden')
      }
    }
  })
}

/**
 * pageSetup
 * @description This function is called after each smoothState reload.
 * Set up page UI elements here.
 */
function pageSetup() {
  setDate()
  toggleCite()
}

function parseQueryParams() {
  const url = new URL(window.location)
  const uniqueKeys = [...new Set(url.searchParams.keys())]
  return Object.fromEntries(
    uniqueKeys.map((key) => [
      key,
      url.searchParams.getAll(key).map(decodeURIComponent)
    ])
  )
}

/**
 * @function _setupProgressObserver()
 *
 * Initializes callbacks for BAS article progress tracker
 *
 **/
function _setupProgressObserver() {
  // When the user sees this progress entry, set its marker 'is-selected'
  let markers = document.querySelector('.progress-marker')
  if (!markers) return

  /**
   * updateBars
   *
   * Updates the progress bar to the current progress state
   **/

  const updateBars = () => {
    document.querySelectorAll('h1[id],h2 > a[id]').forEach( h => {
      const { id } = h
      const mark = markers.querySelector(`li.progress-marker__item--anchor > a[href="#${id}"]`)

      if (!mark) return

      if ( h.getBoundingClientRect().y < window.innerHeight ) {
        mark?.parentElement.classList.add('is-selected')
      } else {
        mark?.parentElement.classList.remove('is-selected')
      }
    })
  }

  updateBars()

  window.addEventListener('scroll', function() {
    const scrollPercent = Math.floor( window.scrollY / document.scrollingElement.scrollHeight * 100 )
    updateBars()
  });
}

// Start
// -----------------------------------------------------------------------------
//
// Run immediately
globalSetup()

// Run when DOM content has loaded
window.addEventListener('load', () => {
  setupMobileFootnoteHandler()
  setupNextPrevIssueButtons()
  _setupProgressObserver()
  pageSetup()
  scrollToHash(window.location.hash, 75, 'swing')
  const params = parseQueryParams()
  /**
   * Accordion Setup
   */
  Accordion.setup()
  /**
   * Canvas Panel Setup
   */
  setUpUIEventHandlers()
  if (window.location.hash) {
    goToFigureState({
      figureId: window.location.hash.replace(/^#/, ''),
      annotationIds: params['annotation-id'],
      region: params['region'] ? params['region'][0] : null,
      sequence: {
        index: params['sequence-index'] ? params['sequence-index'][0] : null,
      },
    })
  }
})