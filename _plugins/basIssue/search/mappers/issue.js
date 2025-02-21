const path = require('path')

const type = 'issue'

module.exports = (_eleventyConfig) => {
	
	const getFigure = _eleventyConfig.getFilter('getFigure')

	return {
		type,
		predicate: ( item ) => {
			return item.data.layout === 'issue'
		},
		
		transform: ( item ) => {


			const { config, issue, publication } = _eleventyConfig.globalData
			const { imageDir } = config.figures

			const { cover_figure,
					issue_pallette,
					special_themed } = issue

			let coverFigure = getFigure(cover_figure)

			if (coverFigure.src) {
				const coverFigurePath = path.join(imageDir, cover_figure)
				const coverFigureRelativePath = coverFigurePath.startsWith('/') ? coverFigurePath.replace(/^\//,'') : coverFigurePath				

                try {
                    const coverFigureUrl = new URL( coverFigureRelativePath, publication.url )
                    coverFigure = coverFigureUrl.href                        
                } catch (error) {
                    console.log(error)
                    tileFigure = undefined
                }
			}

			const { title, 
					subtitle, 
					short_title, 
					reading_line, 
					series_issue_number,
					identifier,
					pub_date,
					url } = publication
			
			const pubDateYear = pub_date.getFullYear()

			return {
				_id: publication.url,
				identifier,
				issue_pallette, 
				pub_date,
				pub_date_year: pubDateYear,
				reading_line, 
				series_issue_number,
				special_themed,
				subtitle,
				title,
				type,
			}
		}
	}
}