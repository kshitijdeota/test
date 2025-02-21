const chalkFactory = require('~lib/chalk')

const logger = chalkFactory('[plugins:envVarUrlPlugin]')

/**
 * Accepts an optional $QUIRE_PUBLICATION_URL envvar and sets it as the publication URL 
 */
module.exports = function(eleventyConfig,globalData) {

  if (process.env.QUIRE_PUBLICATION_URL) { 
    try {
      const parsedUrl = new URL(process.env.QUIRE_PUBLICATION_URL)
      const url = parsedUrl.href.endsWith('/') ? parsedUrl.href : `${parsedUrl.href}/`
      const pathname = parsedUrl.pathname

      let pub = globalData.publication
      pub.url = url
      pub.pathname = pathname

      globalData.publication = pub
      eleventyConfig.addGlobalData('publication',pub) 

    } catch (err) {
      logger.error(`$QUIRE_PUBLICATION_URL (${process.env.QUIRE_PUBLICATION_URL}) could not be parsed as a URL`)
      throw new Error(err)
    }
  }

}