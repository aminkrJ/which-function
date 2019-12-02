const path = require('path')
const {shallowDeps, deepDeps, reverseKey} = require('../index')

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
    const absPath = path.resolve(__dirname, './entry.js')
    expect(shallowDeps(absPath)).toEqual(['./a.js', './b'].map(p => path.resolve(__dirname, p)))
  })
})

describe('deepDeps', () => {
  test('resolve folders', () => {
    const absPath = path.resolve(__dirname, './entry.js')
    expect(deepDeps(absPath)).toEqual(['./a.js', './b', './c', './f/d'].map(p => path.resolve(__dirname, p)))
  })
})

describe('reverseKey', () => {
  test('resolve folders', () => {
    const absPath = path.resolve(__dirname, './entry.js')
  })
})
