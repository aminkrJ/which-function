var fs = require('fs')
var path = require('path')
var precinct = require('precinct')

function read(absPath) {
  if(path.extname(absPath) === '') {
    absPath = `${absPath}.js`
  }
  return fs.readFileSync(absPath, 'utf8')
}

function deepDeps(absPath) {
  var stack = [absPath]
  var deps = []
  while(stack.length > 0) {
    var curPath = stack.pop()
    var children = shallowDeps(curPath)
    if(children.length === 0){
      continue;
    }else{
      stack = stack.concat(children)
      deps = deps.concat(children)
    }
  }
  return deps
}

function shallowDeps(absPath) {
  const dirname = path.dirname(absPath)
  return precinct(read(absPath)).map(p => path.resolve(dirname, p))
}

function reverseKey(absPath){
  var functions = shallowDeps(absPath)
  var dataSource = {}

  functions.forEach(function(func) {
    var deps = deepDeps(func)

    deps.forEach(function(dep) {
      if(dataSource[dep] === undefined){
        dataSource[dep] = []
      }
      dataSource[dep].push(func)
    })
  })

  return dataSource
}


module.exports = {
  deepDeps,
  reverseKey,
  shallowDeps
}
