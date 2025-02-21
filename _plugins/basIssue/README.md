# basIssue plugin

A plugin for using quire to produce issues of the British Art Studies journal. It updates quire's figure handling to be a bit nicer, adds elasticsearch as an index target, and improves logging and error handling.

## Organization

- `index.js` -- bootstrapping, events (11ty.before / .after)
- `filters/` -- filters for handling figure data in and around BAS issues (mostly convenience getters for tile, banner figures)
- `search/` -- indexing operations and mappings for elasticsearch (in `search/mappers/`)
- `shortcodes.js` -- shortcodes
- `{projectRoot}/_includes/search-browse` -- search and browse component 

### Issue Configuration

Issue configuration is set in an issue's `content/_data/issue.yaml` with a few keys:
- `cover_figure` - figure to use for the top of issue homepage
- `pallette` - pallette to use for this issue w/ the value 'apricot'
	- Valid values for this are: 'apricot','blue','fuchsia','lilac','lime','pink','rose','teal'
- `series_issue_number`: 21 , used in article grids for display and order
- `special_themed`: true | false
- `summary`: short summary for all issues page

### Page Headmatter Configuration

Individual pages are configured with YAML headmatter keys:
- `banner_figure` - figure to use at the top of the page
- `tile_figure` - figure to use in article grids for search, issue homepages
- `attribution_type` - the manner of article contribution ('by', etc -- free text), used in article and search grids
- `type` - the type of article ('article', 'cover contribution', etc -- free text) 

### Shortcodes

- `{% equalcolumns %}` and `{% column %}` -- Creates a two-column layout, with the individual columns spanned by {% coulmn %} and {% endcolumn %}
- `{% slide %}` and `{% endslide %}` -- delimits a slide for exhibitions and exploring archives templates 

### Filters

- getBannerFigureSrc(pageKey)
- getTileFigureSrc(pageKey)
- getPageType(pageKey)

### Search

### Framework Pages

There are a few pages that are set within the framework
- privacy
- imprint
- pdf / epub titles, half-titles

These are in the `basIssue` directory within the `content` directory.