const beforeHook = require('./before')
const bannerFigureSrc = require('./filters/getBannerFigureSrc')
const pageType = require('./filters/getPageType')
const searchPlugin = require('./search')
const shortcodes = require('./shortcodes')
const dataHandler = require('./dataHandler')
const tileFigureSrc = require('./filters/getTileFigureSrc')

const chalkFactory = require('~lib/chalk')

const logger = chalkFactory('[plugins:basFigures]')

/**
 * Various bits of BAS-specific quire hardware
 * 
 * TODO (11ty v3): Add spec / framework pages to collections
 **/

module.exports = function(eleventyConfig,collections,globalData,options) {
  // Validate config items, preflight checks 
  eleventyConfig.addPlugin(beforeHook,collections,options)

  // BAS-specific filters
  eleventyConfig.addFilter('getBannerFigureSrc', (key) => bannerFigureSrc(eleventyConfig,collections,key) )
  eleventyConfig.addFilter('getTileFigureSrc', (key) => tileFigureSrc(eleventyConfig,collections,key) )
  eleventyConfig.addFilter('getPageType', (key) => pageType(collections,key) )

  // Shortcodes
  eleventyConfig.addPlugin(shortcodes,collections,options)

  // Search plugin
  eleventyConfig.addPlugin(searchPlugin,collections,options)

  // BAS data -- tags, etc
  eleventyConfig.addPlugin(dataHandler,collections,globalData,options)
}