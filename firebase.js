const fs = require('fs')
const path = require('path')
const readline = require('readline')

module.exports = (absPath, modified) => {
  const readStream = fs.createReadStream(absPath)
  const writeStream = fs.createWriteStream('./tmp', { encoding: "utf8"})
  const pattern = "firebase deploy --only functions"
  const rl = readline.createInterface({input: readStream, output: writeStream})
  rl.on("line", function(line) {
    if(line.match(pattern)){
      if(modified.length === 0) {
        const splited = line.split('&&')
        const reg = new RegExp(pattern)
        const notMatched = splited.find((s) => !Array.isArray(s.match(reg)))
        const lineWithoutPattern = notMatched.join('&&')
        writeStream.write(`${lineWithoutPattern}\r\n`)
      } else {
        const funcNames = modified.reduce((acc, f) => {
          const basename = path.basename(f, '.js')
          return acc === '' ? `:${basename}` : `${acc},functions:${basename}`
        }, '')
        const transformedLine = line.replace(pattern, `${pattern}${funcNames}`)
        writeStream.write(`${transformedLine}\r\n`)
      }
    } else {
      writeStream.write(`${line}\r\n`)
    }
  }).on("close", function(){
    fs.createReadStream('./tmp').pipe(fs.createWriteStream(absPath))
    fs.unlinkSync('./tmp')
  })
}


