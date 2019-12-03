const WhichFunctions = require('./index')

const wf = new WhichFunctions('tests')

const callback = (functions) => {
  console.log(functions)
}

wf.run('./entry.js', callback)


