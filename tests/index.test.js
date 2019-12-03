jest.mock('changed-git-files')

const path = require('path')
const cgf = require("changed-git-files")
const ModifiedFunctions = require('../index')

const modified = new ModifiedFunctions('tests', 'js', './entry.js')
const entryPath = './entry.js'

/**
 * entry
 *   |
 *     -- a
 *     -- b
 *     |
 *       -- c
 *       -- /f/d
 *
 */

describe('shallowDeps', () => {
  test('file name is can be without extension', () => {
    expect(modified.shallowDeps(entryPath)).toEqual(['./a.js', './b'])
  })
})

describe('deepDeps', () => {
  test('resolve folders', () => {
    expect(modified.deepDeps(entryPath)).toEqual(['./a.js', './b', './c', './f/d'])
  })
})

describe('reverseKey', () => {
})

describe('run', () => {
  test('returns functions that has dependency changes', done => {
    const changedFiles = [
      {filename: './c'},
    ]
    const callback = (functions) => {
      expect(functions).toEqual(['./b'])
      done()
    }
    cgf.mockImplementation((func) => func(null, changedFiles))
    modified.run(callback)
  })

  test('returns functions that has changed themselves', done => {
    const changedFiles = [
      {filename: './f/d'},
      {filename: './a.js'}
    ]
    const callback = (functions) => {
      expect(functions).toEqual(['./b', './a.js'])
      done()
    }
    cgf.mockImplementation((func) => func(null, changedFiles))
    modified.run(callback)
  })
})
