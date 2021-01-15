import _ from 'lodash'
import splitUnit from './splitUnit'
import parseRFSQuery from './parseRFSQuery'

export default function parseFontSizeQuery (node, config, fontSizeQuery, breakpoint) {
  let lineHeight
  let modifier
  let renderedFontSize

  if (fontSizeQuery.indexOf('between(') !== -1) {
    // responsive font size
    return parseRFSQuery(node, config, fontSizeQuery, breakpoint)
  }

  if (fontSizeQuery.indexOf('/') !== -1) {
    // we have a line-height parameter
    [fontSizeQuery, lineHeight] = fontSizeQuery.split('/')
  }

  if (fontSizeQuery.indexOf('(') !== -1) {
    // we have a modifier xs(1.6) --> multiplies the size with 1.6
    modifier = fontSizeQuery.match(/\((.*)\)/)[1]
    fontSizeQuery = fontSizeQuery.split('(')[0]
  }

  const fontSize = fontSizeQuery

  // get the wanted object
  const themePath = ['theme', 'typography', 'sizes']
  const path = fontSize.split('.')
  let resolvedFontsize = _.get(config, themePath.concat(path))

  if (!resolvedFontsize) {
    // throw node.error(`FONTSIZE: No \`${fontSize}\` size found in theme.typography.sizes.`, { name: fontSize })
    // treat as a hardcoded value
    resolvedFontsize = fontSize
  }

  if (!_.isString(resolvedFontsize)) {
    if (!_.has(resolvedFontsize, breakpoint)) {
      throw node.error(`FONTSIZE: No breakpoint \`${breakpoint}\` found in theme.typography.sizes.${fontSize}`, { name: breakpoint })
    }
  }

  if (!modifier) {
    if (_.isString(resolvedFontsize)) {
      return {
        ...{ 'font-size': resolvedFontsize },
        ...(lineHeight && { 'line-height': lineHeight })
      }
    }
    if (_.isObject(resolvedFontsize[breakpoint])) {
      const props = {}
      _.keys(resolvedFontsize[breakpoint]).forEach(key => {
        props[key] = resolvedFontsize[breakpoint][key]
      })
      return props
    } else {
      return {
        ...{ 'font-size': resolvedFontsize[breakpoint] },
        ...(lineHeight && { 'line-height': lineHeight })
      }
    }
  } else {
    let fs
    if (_.isString(resolvedFontsize)) {
      fs = resolvedFontsize
    } else if (_.isObject(resolvedFontsize[breakpoint])) {
      fs = resolvedFontsize[breakpoint]['font-size']
    } else {
      fs = resolvedFontsize[breakpoint]
    }

    const [val, unit] = splitUnit(fs)
    renderedFontSize = `${val * modifier}${unit}`

    return {
      ...{ 'font-size': renderedFontSize },
      ...(lineHeight && { 'line-height': lineHeight })
    }
  }
}
