const articleMapper = require('../search/mappers/article')
const fs = require('fs-extra')
const path = require('path')
const Papa = require('papaparse')
const { TextEncoder, TextDecoder } = require('util')

const chalkFactory = require('~lib/chalk')
const logger = chalkFactory('basIssue:dataHandler')

function addSubjectTags(eleventyConfig,collections,globalData) {
  const { pathPrefix } = eleventyConfig
  const slugify = eleventyConfig.javascriptFunctions.slugify

  // TODO: Load the CSV data from globalData when the data extension is in place
  const articleTagsPath = "content/_data/tags-articles.csv"
  const tagsPath = "content/_data/tags.csv"

  // NB: Excel exports as windows-1252 encoded (because the file is originally created on windows?), so transcode
  const articleTagsBuf = fs.readFileSync(articleTagsPath)
  const tagsBuf = fs.readFileSync(tagsPath)

  const decoder = new TextDecoder('windows-1252')

  const articleTagsString = decoder.decode(articleTagsBuf.buffer).toString()
  const tagsString = decoder.decode(tagsBuf.buffer).toString()

  const {data: articleTags} = Papa.parse(articleTagsString,{header:true})
  const {data: tags} = Papa.parse(tagsString,{header:true})

  const theseTags = articleTags.filter( at => parseInt(at.Issue) === eleventyConfig.globalData.issue.series_issue_number )

  const tagData = theseTags.map( tag => tags.find( t => t['id (lowercase, dashes for spaces or punctuation)'] === tag['Tag ID'] ) )
  const finishedTags = theseTags
    .map( (tag,i) => {
      const key = tag['Article ID']
      const tagId = tag['Tag ID']
      // TODO?: Keys don't include pathPrefix IIRC so this isn't necessary -- re-test with journal level in place
      // const key = pathPrefix !== '/' ? `${slugify(pathPrefix)}-${articleId}` : articleId

      const termData = tagData.at(i)
      if (termData === undefined) {
        logger.warn(`Could not find a match for the applied term id of ${tagId}, this tag will be skipped in display.`)
        return undefined        
      }

      const { Term: term, Heading: heading, 'Sub-Heading': subheading } = termData

      if (!term) {
        logger.warn(`Could not find a usable label for the term id of ${tagId}, this tag will be skipped in display.`)
        return undefined
      }

      return { key,
               tagId,
               term,
               heading,
               subheading } 
    }).filter( tag => tag )

  eleventyConfig.addGlobalData('subjectsData',finishedTags)
}

function addAllIssues(eleventyConfig,collections,globalData) {
  const { issue, publication, 'all-issues': allIssues } = eleventyConfig.globalData
  const { series_issue_number, pallette, cover_figure, special_themed } = issue
  const { title, subtitle, pub_date } = publication

  const outputDir = process.env.ELEVENTY_ENV === 'production' ? 'public' : eleventyConfig.dir.output
  const outputFilePath = path.join( outputDir, 'issue.json' )
  const otherIssues = allIssues ?? []
  otherIssues.sort( (aIss, bIss) => { 
    if (aIss.series_issue_number > bIss.series_issue_number) {
      return 1
    } else if (aIss.series_issue_number < bIss.series_issue_number) {
      return -1
    }

    return 0
  })

  // Make prev / next issues available as data
  const nextIssue = otherIssues.find( iss => iss.series_issue_number > issue.series_issue_number )
  const prevIssue = otherIssues.findLast( iss => iss.series_issue_number < issue.series_issue_number )

  eleventyConfig.addGlobalData('nextIssue',nextIssue)
  eleventyConfig.addGlobalData('prevIssue',prevIssue)

  let thisIssue = { _id: publication.url, pallette, pub_date: pub_date.toLocaleDateString('en-US',{month: 'long', year: 'numeric'}), series_issue_number, subtitle, title }

  const articleMap = articleMapper(eleventyConfig)
  eleventyConfig.addCollection('allIssues', function(collectionsApi) {
    const { html } = collections

    const theseArticles = html.filter( p => p.data.eleventyNavigation?.hide !== true ).map( p => p )

    const mappedArticles = theseArticles.map( p => articleMap.transform(p)  )
    thisIssue.articles = mappedArticles

    eleventyConfig.on('eleventy.after', () => {
      fs.writeFileSync(outputFilePath,JSON.stringify(thisIssue))    
    })

    const issues = [ ...otherIssues, thisIssue ]

    return issues
  })
}

module.exports = function(eleventyConfig,collections,globalData) {
  addSubjectTags(eleventyConfig,collections,globalData)
  addAllIssues(eleventyConfig,collections,globalData)
}