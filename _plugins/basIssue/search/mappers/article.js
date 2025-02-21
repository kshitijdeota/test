const path = require('path')

const type = 'article'

const mapTag = (tag) => {
    const { heading, subheading, tagId, term } = tag
    return { _id: tagId, term, heading, subheading, term_hier_key: `${subheading}||${term}` }
}

module.exports = (eleventyConfig) => {
    const getContributor = eleventyConfig.getFilter('getContributor')
    const getFigure = eleventyConfig.getFilter('getFigure')
    
    const markdownify = eleventyConfig.getFilter('markdownify')
    const removeMarkdown = eleventyConfig.getFilter('removeMarkdown')

    return {
        type,
        predicate: ( item ) => {
            return (item.data.layout !== 'issue') && (!item.data.eleventyNavigation.hide)
        },
        
        transform( item ) {
            
            const { publication, issue, subjectsData } = eleventyConfig.globalData

            const { pallette, series_issue_number } = issue
            const { title: issueTitle, 
                    subtitle: issueSubTitle, 
                    short_title: issueShortTitle, 
                    reading_line: issueReadingLine, 
                    pub_date: issueDate,
                    url: publicationURL } = publication

            const { data: itemData } = item

            const { abstract,
                    acknowledgements,
                    attribution_type,
                    banner,
                    ["banner-caption"]: bannerCaption,
                    ["banner-credit"]: bannerCredit,
                    canonicalURL,
                    contributor,
                    figures,
                    footnotes,
                    identifier,
                    key,
                    licence,
                    objects,
                    order,
                    palette,
                    parentPage,
                    references,
                    review_status,
                    short_abstract,
                    subjects,
                    subtitle,
                    summary,
                    title,
                    tile_figure,
                    tile,
                    ["tile-caption"]: tileCaption,
                    ["tile-credit"]: tileCredit,
                    type: basType,
                    wordCount,
                } = itemData;

            // Find this article's subject tags, then group them into the facet properties
            const articleSubjects = subjectsData.filter( subj => subj.key === key )
            let subjectsGrouped = {}
            articleSubjects.forEach( (subj) => {
                let groupKey = ''
                switch (subj.heading.trim()) {
                case 'Styles & Movements':
                    groupKey = 'sm'
                    break
                case 'Material, Medium, and Technique':
                    groupKey = 'mmt'
                    break
                case 'Place':
                    groupKey = 'place'
                    break
                case 'Century':
                    groupKey = 'period'
                    break
                case 'Topics – General':
                case 'Topics – Art':
                    groupKey = 'topics'
                    break
                }

                if (groupKey in subjectsGrouped) {
                    subjectsGrouped[groupKey].push( mapTag(subj) )
                } else {
                    subjectsGrouped[groupKey] = [ mapTag(subj) ]
                }
            })

            let materializedContributors = (contributor ?? []).map( c => {
                const contrib = getContributor(c)
                return contrib.full_name
            })

            let tileFigure, 
                tileFigureCredit, 
                tileFigureCaption
                
            if (tile_figure && getFigure(tile_figure)) { 
                const figure = getFigure(tile_figure)

                if (figure.src) {
                    const tileFigurePath = path.join(eleventyConfig.globalData.config.figures.imageDir, figure?.src)
                    const tileFigureRelativePath = tileFigurePath.startsWith('/') ? tileFigurePath.replace(/^\//,'') : tileFigurePath

                    try {
                        const tileFigureUrl = new URL( tileFigureRelativePath, publicationURL )
                        tileFigure = tileFigureUrl.href                        
                    } catch (error) {
                        console.log(error)
                        tileFigure = undefined
                    }
                }

                if (figure.caption) {
                    tileFigureCaption = figure.caption
                }

                if (figure.credit) {
                    tileFigureCredit = figure.credit
                }

            }

            const title_html = markdownify(title)
            const subtitle_html = markdownify(subtitle)
            const summary_html = markdownify(summary)
            const issueDateYear = issueDate.getFullYear()

            return {
                _id: canonicalURL,
                attribution_type,
                bas_type: basType ? basType.trim() : null,
                canonical_url: canonicalURL,
                contributors: materializedContributors,
                issue_pallette: pallette, 
                order,
                pub_date: issueDate,
                pub_date_year: issueDateYear,
                series_issue_number,
                subjects: subjectsGrouped,
                subtitle: removeMarkdown(title),
                subtitle_html,
                summary: removeMarkdown(summary),
                summary_html,
                tile_figure: tileFigure,
                tile_figure_credit: tileFigureCredit,
                tile_figure_caption: tileFigureCaption,
                title: removeMarkdown(title),
                title_html,
                type,
                // TODO: content, -- you know, for search
            }

        }
    }
}