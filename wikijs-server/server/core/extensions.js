import fs from 'fs-extra'
import * as path from 'node:path'

/* global WIKI */

export default {
    ext: {},

    async init() {
        const extDirs = await fs.readdir(path.join(WIKI.SERVERPATH, 'modules/extensions'))
        WIKI.logger.info(`Checking for installed optional extensions...`)
        for (let dir of extDirs) {
            // WIKI.logger.info(`import extension ${dir}`)
            const module_path = path.join(WIKI.SERVERPATH, 'modules/extensions', dir, 'ext.js')
            WIKI.extensions.ext[dir] = (await import(module_path)).default
            const isInstalled = await WIKI.extensions.ext[dir].check()
            if (isInstalled)
                WIKI.logger.info(`Optional extension ${dir} is installed. [ OK ]`)
            else
                WIKI.logger.info(`Optional extension ${dir} was not found on this system. [ SKIPPED ]`)
        }
    }
}
