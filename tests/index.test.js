jest.mock('changed-git-files')

const path = require('path')
const cgf = require("changed-git-files")
const WhichFunction = require('../index')
const wf = new WhichFunction('tests')

describe('readFileSync', () => {
  it('reads relative path in root', () => {
    expect(wf.readFileSync('./a')).toMatch(/function a/)
  })

  it('reads relative path in sub dir', () => {
    expect(wf.readFileSync('./f/d.js')).toMatch(/function d/)
  })

  it('reads absolute path in sub dir', () => {
    expect(wf.readFileSync(path.resolve('tests', './f/d'))).toMatch(/function d/)
  })
})

describe('shallowDeps', () => {
  it('shallow dependencies for a given file', () => {
    expect(wf.shallowDeps('./entry.js')).toEqual(['./a.js', './b'])
  })
})

describe('deepDeps', () => {
  it('deep dependencies for a given file', () => {
    expect(wf.deepDeps('./entry')).toEqual(['./a.js', './b', './c', './f/d'])
  })
})

describe('reverseKey', () => {
  it('functions with common dependencies', () => {
    expect(wf.reverseKey('./entry')).toEqual({
      'tests/c.js': ['./b'],
      'tests/f/d.js': ['./b']
    })
  })
})

describe('run', () => {
  it('returns functions that has dependency changes', done => {
    const changedFiles = [
      {filename: 'tests/c.js'},
    ]
    const callback = (functions) => {
      expect(functions).toEqual(['tests/b.js'])
      done()
    }
    cgf.mockImplementation((func) => func(null, changedFiles))
    wf.run('./entry.js', callback)
  })

  it('returns functions that has changed themselves', done => {
    const changedFiles = [
      {filename: 'tests/f/d.js'},
      {filename: 'tests/a.js'}
    ]
    const callback = (functions) => {
      expect(functions).toEqual(['tests/b.js', 'tests/a.js'])
      done()
    }
    cgf.mockImplementation((func) => func(null, changedFiles))
    wf.run('./entry.js', callback)
  })
})
