// ===========================================
// Wiki.js
// Licensed under AGPLv3
// ===========================================

// ----------------------------------------
// Wikijs.js Server Main for Node.js
// ----------------------------------------

import * as path from 'node:path'
import { nanoid } from 'nanoid'
import { DateTime } from 'luxon'

import configSvc from './core/config.js'
import Error from './helpers/error.js'
import kernel from './core/kernel.js'
import logger from './core/logger.js'

// ----------------------------------------
// Init global WIKI instance

let WIKI = {
  // Fixme: coding convention SERVER_PATH
  IS_DEBUG: process.env.NODE_ENV === 'development',
  IS_MASTER: true,
  ROOTPATH: process.cwd(),
  INSTANCE_ID: nanoid(10),
  SERVERPATH: path.join(process.cwd(), 'server'),
  // Error: (await import('./helpers/error.js')).default,
  // configSvc: (await import('./core/config.js')).default,
  // kernel: (await import('./core/kernel.js')).default,
  Error,
  configSvc,
  kernel,
  startedAt: DateTime.utc()
}
global.WIKI = WIKI

await WIKI.configSvc.init()

// ----------------------------------------
// Init Logger
WIKI.logger = logger.init('MASTER')

// ----------------------------------------
// Start Kernel
WIKI.kernel.init()

// ----------------------------------------
// Register exit handler

process.on('SIGTERM', () => {
  WIKI.kernel.shutdown()
})

process.on('SIGINT', () => {
  WIKI.kernel.shutdown()
})

process.on('message', (msg) => {
  if (msg === 'shutdown')
    WIKI.kernel.shutdown()
})
