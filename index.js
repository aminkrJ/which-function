var fs = require('fs')
const path = require('path')
const precinct = require('precinct')
const cgf = require('changed-git-files')
const FirebaseFunction = require('./firebase')

function WhichFunction(dirname) {
  this.dirname = dirname
}

WhichFunction.prototype.genAbsolutePath = function(absPath) {
  if(path.extname(absPath) === '') {
    absPath = `${absPath}.js`
  }
  if(!path.isAbsolute(absPath)){
    absPath = path.resolve(process.cwd(), this.dirname, absPath)
  }
  return absPath
}

// path relative to process cwd
WhichFunction.prototype.readFileSync = function(absPath){
  absPath = this.genAbsolutePath(absPath)
  return fs.readFileSync(absPath, 'utf8')
}

WhichFunction.prototype.shallowDeps = function(absPath) {
  let context = []
  try{
    context = this.readFileSync(absPath)
  }catch(err){
    return context
  }
  return precinct(context)
}

WhichFunction.prototype.deepDeps = function(absPath) {
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

WhichFunction.prototype.genRelativeToRoot = function(absPath) {
  absPath = this.genAbsolutePath(absPath)
  const cwd  = process.cwd()
  return absPath.substring(cwd.length + 1)
}

WhichFunction.prototype.reverseKey = function(absPath) {
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

WhichFunction.prototype.run = function(absPath, callback) {
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

module.exports = { WhichFunction, FirebaseFunction }
