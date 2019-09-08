const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

const DEFAULT_CFG = {
  theme: {
    breakpoints: {
      xs: '0',
      sm: '740px',
      md: '1024px'
    },
    spacing: {
      md: {
        xs: '25px',
        sm: '50px',
        md: '75px'
      }
    },
    columns: {
      gutters: {
        xs: '20px',
        sm: '30px',
        md: '50px'
      }
    }
  }
}

it('fails on root', () => {
  const input = `
    @column 3/4;
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('parses regular @column', () => {
  const input = `
    article {
      @column 3/4;
    }
  `

  const output = `
    @media (min-width: 0) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 5px);
        max-width: calc(75% - 5px)
      }
    }
    @media (min-width: 740px) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 7.5px);
        max-width: calc(75% - 7.5px)
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 12.5px);
        max-width: calc(75% - 12.5px)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @column + gutter', () => {
  const input = `
    article {
      @column 3:1/4;
    }
  `

  const output = `
    @media (min-width: 0) {
      article {
        position: relative;
        flex: 0 0 calc(75% + 15px);
        max-width: calc(75% + 15px)
      }
    }
    @media (min-width: 740px) {
      article {
        position: relative;
        flex: 0 0 calc(75% + 22.5px);
        max-width: calc(75% + 22.5px)
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex: 0 0 calc(75% + 37.5px);
        max-width: calc(75% + 37.5px)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @column centered', () => {
  const input = `
    article {
      @column 3/4 center;
    }
  `

  const output = `
        @media (min-width: 0) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 5px);
        max-width: calc(75% - 5px);
        margin-left: auto;
        margin-right: auto
      }
    }
    @media (min-width: 740px) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 7.5px);
        max-width: calc(75% - 7.5px);
        margin-left: auto;
        margin-right: auto
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 12.5px);
        max-width: calc(75% - 12.5px);
        margin-left: auto;
        margin-right: auto
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @column right', () => {
  const input = `
    article {
      @column 3/4 right;
    }
  `

  const output = `
    @media (min-width: 0) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 5px);
        max-width: calc(75% - 5px);
        margin-left: auto;
        margin-right: 0
      }
    }
    @media (min-width: 740px) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 7.5px);
        max-width: calc(75% - 7.5px);
        margin-left: auto;
        margin-right: 0
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 12.5px);
        max-width: calc(75% - 12.5px);
        margin-left: auto;
        margin-right: 0
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @column for single bp', () => {
  const input = `
    article {
      @column 3/4@xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 5px);
        max-width: calc(75% - 5px)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @column for single bp centered', () => {
  const input = `
    article {
      @column 3/4@xs center;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 5px);
        max-width: calc(75% - 5px);
        margin-left: auto;
        margin-right: auto
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses multiple @column for different bp', () => {
  const input = `
    article {
      @column 3/4@xs;
      @column 3/5@sm;
      @column 1/1@md;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex: 0 0 calc(75% - 6.25px);
        max-width: calc(75% - 6.25px)
      }
    }
    @media (min-width: 740px) and (max-width: 1023px) {
      article {
        position: relative;
        flex: 0 0 calc(60% - 14px);
        max-width: calc(60% - 14px)
      }
    }
    @media (min-width: 1024px) and (max-width: 1398px) {
      article {
        position: relative;
        flex: 0 0 100%;
        max-width: 100%
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('runs correctly inside @responsive', () => {
  const input = `
    article {
      @responsive xs {
        @column 2/4;
      }
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex: 0 0 calc(50% - 10px);
        max-width: calc(50% - 10px)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(1)
  })
})

it('fails inside @responsive with own breakpointQuery', () => {
  const input = `
    article {
      @responsive xs {
        @column 2/4@sm;
      }
    }
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('fails with wrong syntax', () => {
  const input = `
    article {
      @column 12/12 <=sm;
      @column 6/12 md;
      @column 8/12 >=lg;
    }
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('parses 12/12', () => {
  const input = `
    article {
      @column 12/12;
    }
  `
  const output = `
    @media (min-width: 0) {
      article {
        position: relative;
        flex: 0 0 100%;
        max-width: 100%
      }
    }
    @media (min-width: 740px) {
      article {
        position: relative;
        flex: 0 0 100%;
        max-width: 100%
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex: 0 0 100%;
        max-width: 100%
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses properly with multiple @column in a row', () => {
  const input = `
    article {
      @column 12/12@xs;
      @column 6/12@sm/md;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex: 0 0 100%;
        max-width: 100%
      }
    }
    @media (min-width: 740px) and (max-width: 1023px) {
      article {
        position: relative;
        flex: 0 0 calc(50% - 15px);
        max-width: calc(50% - 15px)
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex: 0 0 calc(50% - 25px);
        max-width: calc(50% - 25px)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
