const fs = require('fs-extra')
const path = require('path')

const chalkFactory = require('~lib/chalk')
const logger = chalkFactory('basIssue:before')
/**
 * before
 * 
 * eleventy.before hook for validations and pre-flight checks
 * 
 * TODO: Check that issue.pallette exists and is legal
 * TODO: Silence other loggers so users can see useful things
 * 
 **/

module.exports = async function(eleventyConfig,collections) {

  eleventyConfig.on('eleventy.before', async ({dir,runMode,outputMode}) => {
    const { globalData } = eleventyConfig
    const { config, issue, figures } = globalData

    // Check that figures.yaml entry src key files exist
    figures.figure_list.forEach( (figureData) => {
      const { id,src } = figureData

      if (src && !src.endsWith('.html')) {
        const filePath = path.join( eleventyConfig.dir.input, config.figures.imageDir, src )
        
        if (fs.existsSync(filePath)) { return }
        logger.error(`The figure ${id} does not exist at ${filePath}, this may cause unexpected behavior in quire`)
      }

    })

    // Check that issue.cover_figure exists
    const coverFigureExists = figures.figure_list.some( (fig) => {
      const { id } = fig
      return issue.cover_figure === id
    })

    if (!coverFigureExists) { 
      logger.error(`The cover figure ${issue.cover_figure} does not exist, this may cause unexpected behavior on the issue homepage`)
    }

  })
}
