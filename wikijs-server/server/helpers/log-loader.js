// Missing import trace from error stack when loading a module throws an error #46992
// https://github.com/nodejs/node/issues/46992

import { fileURLToPath } from 'url'
import { relative } from 'path'
import chalk from 'chalk'

const CWD = process.cwd()

function formatImportInfo(url, context) {
  let path = url
  try {
    path = relative(CWD, fileURLToPath(url))
  } catch (e) {
    // TypeError [ERR_INVALID_URL_SCHEME]: The URL must be of scheme file
  }

  const parent = context.parentURL ?
    relative(CWD, fileURLToPath(context.parentURL)) :
    'entry point'

  return chalk.blue(path) + ' from ' + chalk.green(parent)
}

// https://nodejs.org/docs/latest/api/module.html#resolvespecifier-context-nextresolve
// Resolve hook chain is responsible for telling Node.js where to find
// and how to cache a given import statement or expression.
export async function resolve(specifier, context, nextResolve) {
  const _ = formatImportInfo(specifier, context)
  // console.log(`Module loader/resolve: ${_}`)
  const result = await nextResolve(specifier, context)
  return result
}

// https://nodejs.org/docs/latest/api/module.html#loadurl-context-nextload
export async function load(url, context, nextLoad) {
  const _ = formatImportInfo(url, context)
  console.log(`Module loader/load: ${_}`)
  const result = await nextLoad(url, context)
  return result
}
