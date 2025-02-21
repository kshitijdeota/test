import { unsafeCSS, html, LitElement,svg } from 'lit'
import { createRef, ref } from 'lit/directives/ref.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'

import appStyles from "/_assets/styles/application.scss?inline"

/**
 * BAS Search / Browse component
 *
 * The component takes a few attributes:
 * - `endpoint` - ElasticSearch endpoint to use
 * - `page-size` - Default size of search query pages to use
 * - `page` - Current page
 * - `search-term` - Term to search for (empty OK)
 *
 */

const hierTermFacets = ['topics','place']

const facetLabels = {
  feat_type: 'Feature Types',
  topics: 'Topics',
  mmt: 'Material & Technique',
  place: 'Place',
  period: 'Time',
  sm: 'Movements & Styles',
}

/**
 * @function _alignHitsResults - aligns hits data (from Elastic) to results (our grid items)
 * @param hits {Array} - Elastic hits
 *
 **/
const _alignHitsResults = (hits) => {
  return hits
}

/**
 * @function _alignAggsFacets - aligns aggregation data (from Elastic) to a facet (our control)
 * @param aggs {Object} - Elastic aggregation
 *
 **/
const _alignAggsFacets = (aggs) => {
  // The only alignment at present is to split hier keys into their terms
  let aligned = {...aggs}
  Object.entries(aggs).forEach(([aggKey,agg]) => {
    const buckets = agg.buckets.map( (buck) => {
      // We use a composite key so unsplit the composite and serialize useful props for facets
      const split = buck.key.split('||')
      const subheading = split[0]
      const term = split[1]

      return { ...buck, subheading, term }
    })

    aligned[aggKey].buckets = buckets
  })

  return aligned
}

/**
 * @function _searchControl - generates markup for the Search component
 * @param searchText {String} - Current searched-for text
 *
 **/
const _searchControl = (searchText) => {
  return html`<input class="input" type="text" placeholder="enter search term" />`
}

/**
 * @function _facetPanel - generates markup for the Facet / Filter panel
 * @param facets {Object} - Facets to display / control
 *
 **/
const _facetPanel = (facets,selectedFacets,facetPanelOpen,openFacetId) => {

  const facetControls = Object.entries(facets).map( ([facetKey,facet]) => {
    const facetLabel = facetLabels[facetKey]
    const buckets = hierTermFacets.includes(facetKey) ? facet.buckets.map( (buck) => { return { ...buck, key: buck.key.split('||')[1] } }) : facet.buckets

    return html`<facet-control id="${facetKey}" class="search-filter" .grouped="${ hierTermFacets.includes(facetKey) }" label="${facetLabel}" .openFacetId="${openFacetId}" .facet="${buckets}" .applied="${selectedFacets.filter( sf => sf.facetId === facetKey )}"></facet-control>`
  })

  return html`<div id="filter-menu" class="search-facet ${ facetPanelOpen ? 'is-active' : '' }">${facetControls}</div>`
}

/**
 * @class FacetControl - Facet control component
 * @param label {String} - Label for this facet
 * @param facet {Array} - Facet entries
 *
 **/
class FacetControl extends LitElement {

  static properties = {
    facet: { type: Array },
    applied: { type: Array },
    grouped: { type: Boolean },
    selected: { state: true, type: Array },
    label: { type: String },
    open: { state: true, type: Boolean },
    selectedKeys: { state: true, type: Array },
    hasChanged: { state: true, type: Boolean },
    openFacetId: { type: String },
    id: { type: String },
  }

  static styles = unsafeCSS(appStyles)

  constructor() {
    super()
    console.log(this.grouped)
    this.open = false
    this.selected = []
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('openFacetId')) {
      this.open = this.openFacetId === this.id
    }
  }

  _handleOpenClose() {
    const event = new CustomEvent('facet-open',{ detail: { facetId: this.open ? '' : this.id }, bubbles: true, cancelable: false, composed: true})
    this.dispatchEvent(event)
  }

  _handleTermSelect(key) {
    if (this.selected.includes(key)) {
      this.selected = [ ...this.selected.filter( s => s !== key ) ]
    } else {
      this.selected = [ ...this.selected, key ]
    }
  }

  _dispatchFacetsApply(key) {
    const applying = key ? [ { key, facetId: this.id } ] : this.selected.map( s => { return {key:s, facetId: this.id} })
    const options = {
      detail: applying,
      bubbles: true,
      composed: true,
    }

    this.selected = []
    this.dispatchEvent(new CustomEvent('facets-select',options))

    // this.open = false
  }

  render() {
    const selectedFacets = this.facet.filter( f => this.applied.some( a => a.key === f.key ) )
    const unselectedFacets = this.facet.filter( f => !this.applied.some( a => a.key === f.key ) )

    // Reduce the unselected facets to an object of arrays of facets, keyed on subheading
    let groupedFacets = {}
    unselectedFacets.forEach( (f) => {
      const subheading = f.subheading ?? '_ungrouped'

      if (subheading in groupedFacets) {
        groupedFacets[subheading].push( f )
        return
      }

      groupedFacets[subheading] = [ f ]
    })

    const formatFacetHeading = (heading) => {
      return html`<div class="dropdown-item facet-subheading"><button>${heading}:</button></div>`
    }

    const formatFacetItem = (facetItem) => {
        // NB: `applied` uses facet term Objects but `selected` is only raw key strings
        const termApplied = this.applied.some( a => a.key === facetItem.key )
        const termSelected = this.selected.some( s => s === facetItem.key )

        return html`<div class="dropdown-item ${ termSelected ? 'is-selected' : '' }">
                      <button class="${ termApplied ? 'is-selected' : '' }" @click="${ () => this._handleTermSelect(facetItem.key) }" >${facetItem.key}</button>
                      <span class="${ termApplied ? '' : 'is-hidden' }">
                        <button @click=${ () => this._dispatchFacetsApply(facetItem.key) } >${ termApplied ? 'X' : '' }</button>
                      </span>
                    </div>`
      }

    const formatSelectedCount = (count) => {
      return html`<div class="filter-selected-count"><span>${count} terms selected</span></div>`
    }

    // Selected count is *both* applied and our selected
    const selectedAndAppliedCount = selectedFacets.length + this.selected.length

    return html`<svg class="is-hidden">
                  <defs>
                    <symbol id="minus-icon" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M0 7.5H16V8.5H0V7.5Z"/>
                    </symbol>
                    <symbol id="plus-icon" viewBox="0 0 17 16">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M8.2998 8.5V16H9.2998V8.5H16.7998V7.5H9.2998V0H8.2998V7.5H0.799805V8.5H8.2998Z"/>
                    </symbol>
                  </defs>
                </svg>
                <div class="dropdown ${ this.open ? 'is-active' : '' }">
                  <div class="dropdown-trigger">
                    <button @click="${this._handleOpenClose}" class="button" aria-haspopup="true" aria-controls="facet-${this.id}">
                      <span>${this.label}${ this.applied.length > 0 && !this.open ? html`&nbsp;(${ this.applied.length })` : '' }</span>
                      <svg>
                          <switch>
                          ${ this.open ? svg`<use xlink:href="#minus-icon"></use>` :
                          svg`<use xlink:href="#plus-icon"></use>` }
                          </switch>
                      </svg>
                    </button>
                  </div>
                  <div class="dropdown-menu" id="facet-${this.id}" role="menu">
                      <div class="dropdown-content">
                        ${ selectedFacets.length > 0 ? formatFacetHeading('Selected Terms') : '' } 
                        ${ selectedFacets.map( f => formatFacetItem(f) ) }
                        ${ selectedFacets.length > 0 ? html`<div class="dropdown-divider"></div>` : '' }
                        ${ this.grouped ? 
                              Object.entries(groupedFacets).map( ([facetGroup,facets]) => {
                                const facetHeading = (facetGroup === '_ungrouped' ? 'All Terms' : facetGroup)
                                return html`${ formatFacetHeading(facetHeading) }
                                        ${facets.map( f => formatFacetItem(f) )}`
                                })
                              : unselectedFacets.map( f => formatFacetItem(f) ) 
                        }
                        ${ selectedAndAppliedCount > 0 ? formatSelectedCount(selectedAndAppliedCount) : '' }
                         <button @click=${ () => this._dispatchFacetsApply() } class="button apply-filter-button ${ this.selected.length > 0 ? '' : 'is-hidden' }">Apply Choices</button>
                      </div>
                  </div>
                </div>`
  }
}

/**
 * @function _articleTile - generates markup for this article in the search grid
 * @param item {Object} - Article to display
 *
 *
 **/
const _articleTile = (item) => {

  const issueNumber = item._source.series_issue_number
  const issueDateYear = item._source.pub_date_year
  const articleTitleHtml = item._source.title_html
  const basType = item._source.bas_type ?? ""
  const articleImageSrc = item._source.tile_figure ?? 'https://versions.bulma.io/0.7.0/images/placeholders/1280x960.png'
  const contributors = item._source.contributors
  const attributionType = item._source.attribution_type ?? ''
  const themeColor = item._source.issue_pallette

  const url = item._source.canonical_url

  const formatContributor = (c) => { return html`<span>${ c }</span>` }

  return html`<div class="column is-half-mobile
                is-one-third-tablet is-one-fifth-desktop theme-${themeColor}">
                    <div class="card">
                        <div class="card-image">
                            <figure class="image">
                                <img src="${articleImageSrc}"
                                    decoding="async"
                                    alt="Placeholder image" >
                            </figure>
                        </div>
                        <div class="card-content">
                            <span class="card-page-heading">Issue ${issueNumber}, ${issueDateYear}</span>
                            <span class="card-page-type">${basType.toUpperCase()}</span>
                            <div class="content">
                                <a href="${url}">${unsafeHTML(articleTitleHtml)}</a>
                            </div>
                            <div class="card-contributor">
                                <span class='${ contributors ? '' : 'is-hidden' }'>${ attributionType }</span>
                                ${ contributors.map( c => formatContributor(c) ) }
                            </div>
                        </div>
                    </div>
                </div>`
}

/**
 * @function _resultsSortControl - generates markup for the Sort control
 * @param resultsCount {Number} - Count of results
 * @param changeHandler {function} - Function to call for onChange events
 *
 **/
const _resultsSortControl = (resultsCount,changeHandler) => {
  return html`<div class="search-result reults-sort-control">
                <p>${resultsCount ?? '-'} Results</p>
                <div class="search-result-select">
                  <label for="sort-control">Sort By:</label>
                  <select id="sort-control" @change=${changeHandler} >
                    <option value="latest">Latest</option>
                    <option value="earliest">Earliest</option>
                  </select>
                </div>
              <div>`
}

/**
 * @function _resultsGrid - generates markup for the results grid
 * @param results {array} - Elastic results
 *
 **/
const _resultsGrid = (results) => {
  return html`<div class="columns is-multiline is-gapless is-mobile">
            ${ results.map( r => _articleTile(r) ) }
          </div>`
}

class BASSearchBrowse extends LitElement {

  static styles = unsafeCSS(appStyles)

  static properties = {
    endpoint: { type: String },
    username: { type: String },
    password: { type: String },
    page: { type: Number },
    pageSize: { attribute: 'page-size', type: Number },
    results: { state: true, type: Array },
    resultsCount: { state: true, type: Number },
    aggregations: { state: true, type: Object },
    selectedFilters: { state: true, type: Array },
    searchTerm: { attribute: 'search-term', type: String },
    facetPanelOpen: { type: Boolean, state: true, },
    openFacetId: { type: String, state: true },
    sort: { state: true, type: String },
    theme: { type: String },
  }

  moreButtonRef = createRef()

  _handleClearFilters() {
    this.selectedFilters = []
    this.searchTerm = ""
  }

  /**
   * @function _filterStateBar - generates markup for the filter state bar
   * @param filters {array} - Filters currently selected
   * @param searchTerm {string} - Current search term
   *
   * NB: `selectionCallback` expects a message sender object so wrap a `detail` key
   **/
  _filterStateBar = (filters,searchTerm) => {
    return html`<div class="search-browse--filter-states">
              <div class="filter-states field is-grouped is-grouped-multiline" >
                ${
                    filters.map( f => {
                      const {key,facetId} = f
                      return html`<div class="control">
                                    <div class="tags has-addons">
                                      <span class="tag" data-term-id="${facetId}-${key}">${key}</span>
                                      <button @click=${ () => this._handleFacetsSelect({detail: [{key,facetId}]}) } class="tag is-delete delete"></button>
                                    </div>
                                  </div>`
                    })
                }
                ${ searchTerm ? html`<div class="control">
                                    <div class="tags has-addons">
                                      <span class="tag" data-term-id="search-term">${searchTerm}</span>
                                      <button @click=${ () => this.searchTerm = '' } class="tag is-delete delete"></button>
                                    </div>
                                  </div>` : '' }
                <div class="margin-left-auto ${ searchTerm || filters.length > 0 ? '' : 'is-hidden' }">
                  <button class="button clear-filter-button" @click=${this._handleClearFilters} >Clear all</button>
                </div>
              </div>
            </div>`
  }

  _fetchResults() {
    const q = this._makeQuery()

    const params = new URLSearchParams({ source: JSON.stringify(q), source_content_type: 'application/json' })
    const headers = new Headers()
    headers.append('Content-Type','application/json')
    headers.append('Authorization','Basic '+window.btoa(`${this.username}:${this.password}`))

    fetch( `${this.endpointUrl}?${params.toString()}`, {method: 'GET', headers: headers, } )
      .then( resp => {
        resp.json()
            .then( data => {
              this.resultsCount = data.hits.total.value
              this.results = _alignHitsResults(data.hits.hits)
              this.aggregations = _alignAggsFacets(data.aggregations)
            })
      })
      .catch( err => {
        console.error(err)
      })
  }

  // NB: We write filters with terms but aggregate with term_hier_keys
  get facetFilterPaths() {
    return {
      feat_type: 'bas_type',
      topics: 'subjects.topics.term',
      sm: 'subjects.sm.term',
      period: 'subjects.period.term',
      mmt: 'subjects.mmt.term',
      place: 'subjects.place.term',
    }
  }

  _makeQuery(fields=['title.english^5','subtitle.english^3','contributors','abstract.english']) {
    // Only apply a true should term if there is something to score in searchTerm
    const shouldMatch = this.searchTerm ? [{ query_string: { query: this.searchTerm, fields, analyzer: 'standard' } }] : []

    return { query:
             { bool:
               { must_not: [{ term: { type: 'issue' } }],
                 should: shouldMatch
                }
             },
             post_filter: {
              // NB: Must - should creates "must match either" behavior
              bool: {
                must: {
                  bool: {
                    should: this.selectedFilters.map( (sf) => {
                        const filterPath = this.facetFilterPaths[sf.facetId]
                        const filterNode = {}
                        filterNode.term = {}
                        filterNode.term[filterPath] = sf.key
                        return filterNode
                      })
                  }
                }
              }
             },
             aggs: {
              feat_type: { terms: { field: 'bas_type', order: { _key: 'asc' }, size: 20 } },
              topics: { terms: { field: 'subjects.topics.term_hier_key' , order: { _key: 'asc' }, size: 200 } },
              sm: { terms: { field: 'subjects.sm.term', order: { _key: 'asc' }, size: 200 } },
              period: { terms: { field: 'subjects.period.term', order: { _key: 'asc' }, size: 30 } },
              mmt: { terms: { field: 'subjects.mmt.term', order: { _key: 'asc' }, size: 200 } },
              place: { terms: { field: 'subjects.place.term_hier_key', order: { _key: 'asc' }, size: 200 } },
             },
             // TODO: Make this a function so we can encapsulate filter kinds better
             sort: [ {'series_issue_number': this.sort === 'earliest' ? 'asc' : 'desc'},
                     { 'order': this.sort === 'earliest' ? 'asc' : 'desc' }],
             size: ( this.page + 1 )*this.pageSize, // NB!!
             from: 0  }
  }

  connectedCallback() {
    super.connectedCallback()
    this.theme = document.querySelector('html').dataset.theme
    window.addEventListener('facet-open', (event) => {
      this.openFacetId = event.detail.facetId
    })
  }

  firstUpdated() {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach( entry => {
          if (entry.intersectionRatio > 0) {
            if ((this.page+1)*this.pageSize >= this.resultsCount ) return
            this.page += 1
          }
        })
      },
      {threshold: 0.1, rootMargin: '5px'}
    )

    if (!this.moreButtonRef.value) {
      console.warn("Unable to find button at startup, users will fallback to click button")
      return
    }

    io.observe(this.moreButtonRef.value)
  }

  willUpdate(changedProperties) {
    if ( changedProperties.has('selectedFilters') ||
         changedProperties.has('page') ||
         changedProperties.has('searchTerm') ||
         changedProperties.has('sort')
        ) {
        this._fetchResults()
    }
  }

  constructor() {
    super()

    this.page = this.getAttribute('page') ?? 0
    this.pageSize = this.getAttribute('pageSize') ?? 0
    this.searchTerm = this.getAttribute('search-term')
    this.endpoint = this.getAttribute('endpoint')
    this.endpointUrl = `${this.endpoint}/_search`
    this.username = this.getAttribute('username')
    this.password = this.getAttribute('password')
    this.results = []
    this.sort = 'earliest'
    this.resultsCount = undefined
    this.aggregations = {}
    this.selectedFilters = []
    this.theme = 'light'
    this.facetPanelOpen = false
    this.openFacetId = ''
  }

  _handleFacetsSelect(e) {
    const facets = e.detail

    // `facets` is intended to toggle its facet so create:
    // - selectedFilters that aren't in facets
    // - facets that aren't in selectedFilters
    const filtered = this.selectedFilters.filter( sf => !facets.some( f => f.key === sf.key && f.facetId === sf.facetId ) )
    const toAdd = facets.filter( f => !this.selectedFilters.some( sf => sf.key === f.key && sf.facetId === f.facetId ) )

    this.selectedFilters = [ ...filtered, ...toAdd ]
    this.openFacetId = ''
  }

  _handleFacetSelect(facet) {
    const { key, facetId } = facet

    // NB: `selectedFilters` must be replaced here in order to ensure the array event fires
    if (this.selectedFilters.some( sf => sf.key === key && sf.facetId === facetId )) {
      const filtered = this.selectedFilters.filter(sf => sf.key !== key && sf.facetId !== facetId )

      this.selectedFilters = [ ...filtered ]
    } else {
      this.selectedFilters = [ ...this.selectedFilters, {key,facetId} ]
    }
  }

  _handleSortSelect(e) {
    this.sort = e.target.value
  }

  _toggleFilterMenu(e) {
    this.facetPanelOpen = !this.facetPanelOpen
  }

  _handleNextResults(e) {
    if ( (this.page+1) * this.pageSize >= this.resultsCount ) return
    this.page += 1
  }

  /**
   * @function render
   *
   * `lit` Lifecycle method -- renders the view after an update has been called
   **/
  render() {
    const nextPages = this.resultsCount && ( this.page + 1 )*this.pageSize <= this.resultsCount

    return html`
    <svg class="is-hidden">
      <defs>
        <symbol id="minus-icon" viewBox="0 0 16 16">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M0 7.5H16V8.5H0V7.5Z"/>
        </symbol>
        <symbol id="plus-icon" viewBox="0 0 17 16">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8.2998 8.5V16H9.2998V8.5H16.7998V7.5H9.2998V0H8.2998V7.5H0.799805V8.5H8.2998Z"/>
        </symbol>
      </defs>
    </svg>
    <div @facets-select=${this._handleFacetsSelect} class='search-browse theme-${this.theme}'>
      <h2>
        <span class="filter-heading is-hidden-mobile">FILTER By</span>
          <button class="filter-button ${this.facetPanelOpen ? 'is-active' : ''} is-hidden-tablet" id="filter-button" @click="${ this._toggleFilterMenu }">FILTER By
            <svg>
              <switch>
              ${ this.facetPanelOpen ? svg`<use xlink:href="#minus-icon"></use>` :
              svg`<use xlink:href="#plus-icon"></use>`}
              </switch>
          </svg>
        </button>
      </h2>
      ${ _facetPanel(this.aggregations,this.selectedFilters,this.facetPanelOpen,this.openFacetId) }
      ${ this._filterStateBar(this.selectedFilters,this.searchTerm,this._handleFacetSelect) }
      ${ _resultsSortControl(this.resultsCount,this._handleSortSelect) }
      ${ _resultsGrid(this.results) }
      <div class="${ nextPages ? '' : 'is-hidden' }"><button ${ref(this.moreButtonRef)} class="button" @click=${this._handleNextResults} >More</button></div>
    </div>`
  }
}

customElements.define('facet-control', FacetControl)
customElements.define('bas-search-browse', BASSearchBrowse)
