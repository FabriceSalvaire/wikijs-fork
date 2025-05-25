import * as path from 'node:path'
import yargs from 'yargs'

import Error from '../helpers/error.js'
import configSvc from './config.js'
import * as logger from './logger.js'

let WIKI = {
    IS_DEBUG: process.env.NODE_ENV === 'development',
    ROOTPATH: process.cwd(),
    SERVERPATH: path.join(process.cwd(), 'server'),
    Error, // : (await import('../helpers/error.js')).default,
    configSvc // : (await import('./config.js')).default
}
global.WIKI = WIKI

await WIKI.configSvc.init()
WIKI.logger = logger.init('JOB')

const argv = yargs(process.argv.slice(2)).parse()

;(async () => {
    try {
        WIKI.logger.info(`import ${argv.job}`)
        const job = (await import(`../jobs/${argv.job}.js`)).default
        await job(argv.data)
        process.exit(0)
    } catch (e) {
        await new Promise((resolve) => process.stderr.write(e.message, resolve))
        process.exit(1)
    }
})()
