import _ from 'lodash'
import renderCalcWithRounder from './renderCalcWithRounder'
import calcMinFromBreakpoint from './calcMinFromBreakpoint'
import calcMaxFromBreakpoint from './calcMaxFromBreakpoint'
import getUnit from './getUnit'
import splitUnit from './splitUnit'
import stripNestedCalcs from './stripNestedCalcs'

export default function parseSize (node, config, size, bp) {
  if (size === '0') {
    return '0'
  }

  // first check if we have it in our config spacing map
  // if we do, we extract it and run it through the normal checks
  if (_.has(config.theme.spacing, size)) {
    size = config.theme.spacing[size][bp]
  }

  if (size.indexOf('between(') > -1) {
    size = size.match(/between\((.*)\)/)[1]

    if (size.indexOf('-') > -1) {
    // alternative syntax - `minSize-maxSize`
      const [minSize, maxSize] = size.split('-')
      const sizeUnit = getUnit(minSize)
      const maxSizeUnit = getUnit(maxSize)

      let minWidth = calcMinFromBreakpoint(config.theme.breakpoints, bp)
      let maxWidth = calcMaxFromBreakpoint(config.theme.breakpoints, bp)

      if (!maxWidth) {
        // no max width for this breakpoint. Add 200 to min :)
        // TODO: maybe skip for the largest size? set a flag here and return reg size?
        maxWidth = `${parseFloat(minWidth) + 200}${getUnit(minWidth)}`
      }

      const widthUnit = getUnit(minWidth)
      const maxWidthUnit = getUnit(maxWidth)
      const rootSize = config.theme.typography.rootSize

      if (sizeUnit === null) {
        throw node.error(`BETWEEN: Sizes need unit values - breakpoint: ${bp} - size: ${size}`)
      }

      if (sizeUnit !== maxSizeUnit && widthUnit !== maxWidthUnit) {
        throw node.error('BETWEEN: min/max unit types must match')
      }

      if (sizeUnit === 'rem' && widthUnit === 'px') {
        minWidth = pxToRem(minWidth, rootSize)
        maxWidth = pxToRem(maxWidth, rootSize)
      }

      // Build the responsive type decleration

      const sizeDiff = parseFloat(maxSize) - parseFloat(minSize)
      const rangeDiff = parseFloat(maxWidth) - parseFloat(minWidth)

      if (sizeDiff === 0) {
        // not really responsive. just return the regular max
        return maxSize
      }

      if (minWidth === '0') {
        minWidth = '320px'
      }

      return `calc(${minSize} + ${sizeDiff} * ((100vw - ${minWidth}) / ${rangeDiff}))`
    } else {
      throw node.error('SPACING: `between()` needs a range - between(50px-95px)', { name: bp })
    }
  }

  if (size === '-container/2') {
    // get size from container.padding
    if (!_.has(config.theme.container.padding, bp)) {
      throw node.error(`SPACING: No \`${bp}\` breakpoint found in \`theme.container.padding\`.`, { name: bp })
    }

    const [val, unit] = splitUnit(config.theme.container.padding[bp])
    return `-${val / 2}${unit}`
  }

  if (size === '-container') {
    // get size from container.padding
    if (!_.has(config.theme.container.padding, bp)) {
      throw node.error(`SPACING: No \`${bp}\` breakpoint found in \`theme.container.padding\`.`, { name: bp })
    }

    return '-' + config.theme.container.padding[bp]
  }

  if (size === 'container/2') {
    // get size from container.padding
    if (!_.has(config.theme.container.padding, bp)) {
      throw node.error(`SPACING: No \`${bp}\` breakpoint found in \`theme.container.padding\`.`, { name: bp })
    }

    const [val, unit] = splitUnit(config.theme.container.padding[bp])
    return `${val / 2}${unit}`
  }

  if (size === 'container') {
    // get size from container.padding
    if (!_.has(config.theme.container.padding, bp)) {
      throw node.error(`SPACING: No \`${bp}\` breakpoint found in \`theme.container.padding\`.`, { name: bp })
    }
    return config.theme.container.padding[bp]
  }

  if (!_.has(config.theme.spacing, size)) {
    // size is not found in spacingMap, treat it as a value
    if (size.indexOf('calc') > -1) {
      if (!bp) {
        throw node.error('SPACING: Calc expressions need a breakpoint due to var calculations', { name: bp })
      }
      // it's a calc expression. interpolate values and return string
      const regex = /var\[(.*?)\]/g
      let match
      const matches = []

      while ((match = regex.exec(size)) != null) {
        matches.push(match[1])
      }

      matches.forEach(m => {
        const parsedMatch = parseSize(node, config, m, bp)
        size = size.replace(`var[${m}]`, parsedMatch)
      })

      return stripNestedCalcs(size)
    }

    if (size.indexOf('/') !== -1) {
      // it's a fraction, check if the first part is a spacing key
      const [head, tail] = size.split('/')
      if (!_.has(config.theme.spacing, head)) {
        if (!bp) {
          throw node.error('SPACING: Fractions need a breakpoint due to gutter calculations', { name: bp })
        }

        let gutterMultiplier
        let sizeMath
        let [wantedColumns, totalColumns] = size.split('/')

        if (wantedColumns.indexOf(':') !== -1) {
          // we have a gutter indicator (@column 6:1/12) -- meaning we want X times the gutter to be added
          // first split the fraction
          [wantedColumns, gutterMultiplier] = wantedColumns.split(':')
        }

        const gutterSize = config.theme.columns.gutters[bp]
        const [gutterValue, gutterUnit] = splitUnit(gutterSize)

        if (wantedColumns / totalColumns === 1) {
          sizeMath = '100%'
        } else {
          sizeMath = `${wantedColumns}/${totalColumns} - (${gutterValue}${gutterUnit} - 1/${totalColumns} * ${gutterValue * wantedColumns}${gutterUnit})`
        }

        if (gutterMultiplier) {
          const gutterMultiplierValue = gutterValue * gutterMultiplier
          return renderCalcWithRounder(`${sizeMath} + ${gutterMultiplierValue}${gutterUnit}`)
        } else {
          return sizeMath === '100%' ? sizeMath : renderCalcWithRounder(sizeMath)
        }
      }

      if (!_.has(config.theme.spacing[head], bp)) {
        throw node.error(`SPACING: No \`${bp}\` breakpoint found in spacing map for \`${head}\`.`)
      }

      return `calc(${config.theme.spacing[head][bp]}/${tail})`
    }

    if (size.indexOf('*') !== -1) {
      // it's *, check if the first part is a spacing key
      const [head, tail] = size.split('*')

      if (!_.has(config.theme.spacing, head)) {
        return renderCalcWithRounder(size)
      }

      if (!_.has(config.theme.spacing[head], bp)) {
        throw node.error(`SPACING: No \`${bp}\` breakpoint found in spacing map for \`${head}\`.`)
      }

      return `calc(${config.theme.spacing[head][bp]}*${tail})`
    }

    if (size.indexOf('vertical-rhythm(') !== -1) {
      const params = size.match(/vertical-rhythm\((.*)\)/)[1]
      const [key, lineHeight = config.theme.typography.lineHeight[bp]] = params.split(',').map(p => p.trim())
      const obj = _.get(config, key.split('.'))

      // does it exist?
      if (!obj) {
        throw node.error(`SPACING: No \`${key}\` size key theme object.`)
      }

      const fs = _.isObject(obj[bp]) ? obj[bp]['font-size'] : obj[bp]

      return `calc(${fs} * ${lineHeight})`
    }

    if (size.indexOf('px') !== -1 ||
        size.indexOf('vh') !== -1 ||
        size.indexOf('vw') !== -1 ||
        size.indexOf('rem') !== -1 ||
        size.indexOf('em') !== -1 ||
        size.indexOf('ch') !== -1 ||
        size.indexOf('%') !== -1) {
      return size
    }

    // it's a number. we treat regular numbers as a multiplier of col gutter.
    return renderColGutterMultiplier(node, size, bp, config)
  }

  if (!_.has(config.theme.spacing[size], bp)) {
    throw node.error(`SPACING: No \`${bp}\` breakpoint found in spacing map for \`${size}\`.`)
  }
}

function renderColGutterMultiplier (node, multiplier, bp, { theme }) {
  // grab gutter for this breakpoint
  if (!_.has(theme.columns.gutters, bp)) {
    throw node.error(`parseSize: No \`${bp}\` breakpoint found in gutter map.`, { name: bp })
  }

  const gutter = theme.columns.gutters[bp]
  const [val, unit] = splitUnit(gutter)

  return `${(val * multiplier)}${unit}`
}

function pxToRem (px, rootSize) {
  return parseFloat(px) / parseFloat(rootSize) + 'rem'
}
