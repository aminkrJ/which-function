var fs = require('fs')
var path = require('path')
var precinct = require('precinct')
var cgf = require('changed-git-files')

function WhichFunctions(dirname) {
  this.dirname = dirname
}

WhichFunctions.prototype.genAbsolutePath = function(absPath) {
  if(path.extname(absPath) === '') {
    absPath = `${absPath}.js`
  }
  if(!path.isAbsolute(absPath)){
    absPath = path.resolve(process.cwd(), this.dirname, absPath)
  }
  return absPath
}

// path relative to process cwd
WhichFunctions.prototype.readFileSync = function(absPath){
  absPath = this.genAbsolutePath(absPath)
  return fs.readFileSync(absPath, 'utf8')
}

WhichFunctions.prototype.shallowDeps = function(absPath) {
  const context = this.readFileSync(absPath)
  return precinct(context) }

WhichFunctions.prototype.deepDeps = function(absPath) {
  var stack = [absPath]
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

WhichFunctions.prototype.genRelativeToRoot = function(absPath) {
  absPath = this.genAbsolutePath(absPath)
  const cwd  = process.cwd()
  return absPath.substring(cwd.length + 1)
}

WhichFunctions.prototype.reverseKey = function(absPath) {
  var functions = this.shallowDeps(absPath)
  var dataSource = {}

  functions.forEach((func) => {
    var deps = this.deepDeps(func)

    deps.forEach((dep) => {
      if(dataSource[dep] === undefined){
        dataSource[this.genRelativeToRoot(dep)] = [func]
      }
    })
  })

  return dataSource
}

WhichFunctions.prototype.run = function(absPath, callback) {
  let whichFuncs = []
  const deps = this.reverseKey(absPath)
  const functions = this.shallowDeps(absPath)
  functions.forEach((func) => deps[this.genRelativeToRoot(func)] = [func])
  cgf((err, changed) => {
    for(file of changed) {
      var touched = deps[file.filename]
      if(touched !== undefined) {
        whichFuncs = whichFuncs.concat(touched.map((p) => this.genRelativeToRoot(p)))
      }
    }
    callback(whichFuncs)
  })
}

module.exports = WhichFunctions
