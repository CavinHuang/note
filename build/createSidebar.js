const fs = require('fs-extra')
const path = require('path')

const docsPath = path.resolve(__dirname, '../docs')
const configPath = path.join(docsPath, '.vitepress/configs')
const sideBarFilePath = path.join(configPath, 'sidebar.js')

console.log(docsPath, configPath, sideBarFilePath)

// 获取docs下所有的文件
const docsChildFile = fs.readdirSync(docsPath)
const ignoreScanDirs = ['.vitepress', 'public', 'index.md']

console.log('docs', docsChildFile)

// 获取文件夹下所有的文件
function readFileList(dir, filesList = []) {
  const fiels = fs.readdirSync(dir)
  fiels.forEach((item, index) => {
    const fullpath = path.join(dir, item)
    const stat = fs.statSync(fullpath)
    if (stat.isDirectory()) {
      // 文件夹 继续扫描 递归读取文件
      console.log(fullpath)
      filesList.push(readFileList(fullpath, filesList))
    } else {
      filesList.push(fullpath)
    }
  })
  return filesList
}
function upperFistChart(str) {
  const firstChart = str.charAt(0)
  return firstChart.toUpperCase() + str.substring(1, str.length)
}
let moduleJson = ``
let content = ''
docsChildFile.forEach(item => {
  console.log(item)
  const docsJson = []
  if (!ignoreScanDirs.includes(item)) {
    const _basePath = path.join(docsPath, item)
    const childrenFile = readFileList(_basePath)
    let lastDirs = _basePath.split('\\')
    let lastDir = lastDirs[lastDirs.length - 1]
    console.log('---------------', lastDirs[lastDirs.length - 1])
    console.log(childrenFile)
    const _children = []
    content += ``
    let _text = ''
    childrenFile.forEach(file => {
      if (typeof file === 'string') {
        const basename = path.basename(file)
        if (!ignoreScanDirs.includes(basename)) {
          const extname = path.extname(file)
          const relativePath = file.replace(_basePath, '').replace(extname, '')
          _text = relativePath.split('\\')[1]
          _children.push({
            text: basename.replace(extname, ''),
            link: '/'+ lastDir + relativePath.replace(/\\/g, '/')
          })
        }
      }
    })
    if(_children.length) {
      docsJson.push({
      text: _text,
      children: _children
    })
    const funcName = `get${upperFistChart(item)}Sidebar()`
    moduleJson += `'/${item}/': ${funcName}`
    content += `
function ${funcName} {
  return ${JSON.stringify(docsJson, null, '  ')}
}
`
    }
  }
})

let fileContent = `
module.exports={
  ${moduleJson}
}
${content}
`
fileContent = fileContent.replace(/\"(\w+)\":/g, '$1:').replace(/"/g, "'")
fs.writeFileSync(sideBarFilePath, fileContent)
