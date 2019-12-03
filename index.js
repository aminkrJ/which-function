var fs = require('fs')
var path = require('path')
var precinct = require('precinct')
var cgf = require('changed-git-files')

function ModifiedFunctions(dirname, extname = 'js', entryPath = './index') {
  this.dirname = dirname
  this.entryPath = entryPath
  this.extname = extname
}

ModifiedFunctions.prototype._buildPath = function(p){
  if(path.extname(p) === '') {
    p = `${p}.${this.extname}`
  }
  return path.resolve(this.dirname, p)
}

ModifiedFunctions.prototype._read = function(p){
  return fs.readFileSync(this._buildPath(p), 'utf8')
}

ModifiedFunctions.prototype.shallowDeps = function(p) {
  return precinct(this._read(p))
}

ModifiedFunctions.prototype.deepDeps = function(p) {
  var stack = [p]
  var deps = []
  while(stack.length > 0) {
    var curPath = stack.pop()
    var children = this.shallowDeps(curPath)
    if(children.length !== 0){
      stack = stack.concat(children)
      deps = deps.concat(children)
    }
  }
  return deps
}

ModifiedFunctions.prototype.reverseKey = function(p) {
  var functions = this.shallowDeps(p)
  var dataSource = {}

  functions.forEach((func) => {
    var deps = this.deepDeps(func)

    deps.forEach((dep) => {
      if(dataSource[dep] === undefined){
        dataSource[dep] = [func]
      }
    })
  })

  return dataSource
}

ModifiedFunctions.prototype.run = function(callback) {
  let modifiedFunctions = []
  const deps = this.reverseKey(this.entryPath)
  // functions are depending on themselves
  const functions = this.shallowDeps(this.entryPath)
  functions.forEach((func) => deps[func] = [func])
  cgf((err, changed) => {
    for(file of changed) {
      var touched = deps[file.filename]
      if(touched !== undefined) {
        modifiedFunctions = modifiedFunctions.concat(touched)
      }
    }
    callback(modifiedFunctions)
  })
}

module.exports = ModifiedFunctions
