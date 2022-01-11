const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

function deleteDirectoryRecursive (directory, excludeDirs, targetRemoveDirectoryName) {
  const dir = fs.readdirSync(directory).filter(item => !item.startsWith('.'))
  dir.forEach(item => {
    const statPath = path.join(directory, item)
    isDirectory(statPath)
      .then(result => {
        if (!result) {
          return
        }
        if (targetRemoveDirectoryName.some(name => statPath.indexOf(name) > -1)) {
          deleteDir(statPath)
            .then(res => {
              console.log(chalk.green(`delete ${statPath} dir result `), res)
            })
        } else if (!excludeDirs.some(item => statPath.indexOf(item) > -1)) {
          deleteDirectoryRecursive(statPath, excludeDirs, targetRemoveDirectoryName)
        }
      })
  })
}

function collectAllDirectory (directory, excludeDirs, targetRemoveDirectoryName) {
  const result = []
  collectDirectoryRecursive(directory, excludeDirs, targetRemoveDirectoryName, result)
  return result
}

function collectDirectoryRecursive (directory, excludeDirs, targetRemoveDirectoryName, result) {
  const dir = fs.readdirSync(directory).filter(item => !item.startsWith('.'))
  dir.forEach(item => {
    const statPath = path.join(directory, item)
    const stat = fs.lstatSync(statPath)
    if (!stat.isDirectory()) {
      return
    }

    if (targetRemoveDirectoryName.some(name => statPath.indexOf(name) > -1)) {
      result.push(statPath)
    } else if (!excludeDirs.some(item => statPath.indexOf(item) > -1)) {
      collectDirectoryRecursive(statPath, excludeDirs, targetRemoveDirectoryName, result)
    }
  })
}


function isDirectory (filePath) {
  return new Promise((resolve) => {
    fs.stat(filePath, (err, stat) => {
      resolve(err ? false : stat.isDirectory())
    })
  })
}

function deleteDir (dirPath) {
  return new Promise((resolve) => {
    fs.rmdir(dirPath, { recursive: true, maxRetries: 2 }, (err) => {
      if (err && err.code !== 'ENOTEMPTY') {
        console.log(chalk.red(`delete ${dirPath} error `), err)
        resolve(false)
        return
      }
      resolve(true)
    })
  })
}

function deleteAllDir (dirArray) {
  return Promise.all(dirArray.map(dir => deleteDir(dir)))
}


module.exports = {
  deleteDirectoryRecursive,
  collectAllDirectory,
  deleteAllDir,
}
