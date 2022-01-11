const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const prompt = inquirer.createPromptModule()

const { collectAllDirectory, deleteAllDir } = require('./utils')
const DEFAULT_TARGET_REMOVE_DIRECTORY_NAME = 'node_modules'
const DEFAULT_EXCLUDE_DIRS = ['.git', '.idea', '.gradle', 'coverage', 'test', 'tests', 'src', 'dist']
const targetPath = process.cwd()

console.log(chalk.green('path: '), __dirname)
console.log(chalk.green('exec path: '), targetPath)


let selectedDeleteArray = []
let i = 4
const loader = ['/ deleting.', '| deleting..', '\\ deleting...', '- deleting.']
const ui = new inquirer.ui.BottomBar({ bottomBar: loader[i % 4] })

function commander () {
  prompt([
    {
      type: 'input',
      message: 'Please input delete directory name, support string array(like a,b,c)',
      name: 'targetRemoveDirectoryName',
      default: DEFAULT_TARGET_REMOVE_DIRECTORY_NAME,
      validate: function (input) {
        const done = this.async()

        setTimeout(function () {
          if (typeof input !== 'string') {
            done('You need to provide a string')
            return
          }
          done(null, true)
        }, 200)
      },
    },
    {
      type: 'input',
      name: 'excludeDirs',
      message: `Please input exclude directories, support string and array`,
      default: DEFAULT_EXCLUDE_DIRS,
    },
  ])
    .then(answers => {
      const targetRemoveDirectoryName = answers.targetRemoveDirectoryName.indexOf(',') ? answers.targetRemoveDirectoryName.split(',') : answers.targetRemoveDirectoryName
      const excludeDirs = answers.excludeDirs
      console.log('targetPath ', targetPath)
      console.log('targetRemoveDirectoryName ', targetRemoveDirectoryName)
      return collectAllDirectory(targetPath, excludeDirs, targetRemoveDirectoryName)
    })
    .then(dir => {
      return prompt([
        {
          type: 'checkbox',
          name: 'deleteChecked',
          choices: dir,
          message: `Please select delete directories`,
          default: [],
        },
      ])
    })
    .then(answer => {
      console.log('answer ', answer)
      const deleteChecked = (answer.deleteChecked || [])
      if (deleteChecked.length === 0) {
        return
      }
      selectedDeleteArray = [...deleteChecked]
      return prompt([{
        type: 'confirm',
        name: 'delete',
        message: `Please confirm delete this folder \n -- ${(answer.deleteChecked || []).join(',\n -- ')}`,
      }])
        .then(answer => {
          console.log('delete ,', answer)
          if (answer.delete) {
            const timer = setInterval(() => {
              ui.updateBottomBar(chalk.greenBright(loader[i++ % 4]))
            }, 300)
            return deleteAllDir(selectedDeleteArray).finally(() => {
              ui.updateBottomBar(chalk.green('delete done √'))
              clearInterval(timer)
            })
          }
        })
    })
    .catch((e) => {
      console.log('some exception, bye :)', e)
    })
}


module.exports = commander
