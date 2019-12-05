const fs = require('fs')
const path = require('path')
const readline = require('readline')

module.exports = (absPath, modified) => {
  const readStream = fs.createReadStream(absPath)
  const writeStream = fs.createWriteStream('./tmp', { encoding: "utf8"})
  const pattern = "firebase deploy --only functions"
  const rl = readline.createInterface({input: readStream, output: writeStream})
  rl.on("line", function(line) {
    if(line.match(pattern) && modified.length > 0){
      const funcNames = modified.reduce((acc, f) => {
        const basename = path.basename(f, '.js')
        return acc === '' ? `:${basename}` : `${acc},functions:${basename}`
      }, '')
      const transformedLine = line.replace(pattern, `${pattern}${funcNames}`)
      writeStream.write(`${transformedLine}\r\n`)
    } else {
      writeStream.write(`${line}\r\n`)
    }
  }).on("close", function(){
    fs.createReadStream().pipe(fs.createWriteStream(absPath))
    fs.unlinkSync('./tmp')
  })
}

