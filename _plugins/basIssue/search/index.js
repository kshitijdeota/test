const chalkFactory = require('~lib/chalk')
const fs = require('fs-extra')
const path = require('path')

const article = require('./mappers/article')
const issue = require('./mappers/issue')

const logger = chalkFactory('[basIssue:search]')

module.exports = (eleventyConfig, collections, options) => {

    // @TODO: `outputDir` here should be sensitive to eleventyConfig.outputDir
    const outputDir = process.env.ELEVENTY_ENV === 'production' ? 'public' : eleventyConfig.dir.output
    const outputPath = path.join(outputDir, 'elastic-index.json')

    const mappers = [ article(eleventyConfig), issue(eleventyConfig) ]

    eleventyConfig.on('eleventy.after', async () => {

        console.log("Creating search JSON")
        let mappedPages = []
        collections.html.forEach( (page) => {
            const mapr = mappers.find( m => m.predicate(page) )
            if (!mapr) { return }

            const mapped = mapr.transform(page)
            mappedPages.push(mapped)
        })

        let mappedIssue = issue(eleventyConfig).transform()
        mappedIssue.articles = mappedPages.map( mp => {
            return { _id: mp._id }
        })

        let mapped = [ ...mappedPages, mappedIssue ]
        try {
          fs.ensureDirSync(path.parse(outputPath).dir)
          fs.writeJsonSync(outputPath, mappedPages)
        } catch(error) {
          logger.error(error)
        }

        // TODO: Optionally initialize an index for this build?

    })

    // TODO: Ensure the search web-component makes it into the JS bundle

}