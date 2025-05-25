import * as fs from 'node:fs/promises'
import * as npath from 'node:path'

import yaml from 'js-yaml'

import commonHelper from '../helpers/common.js'

/* global WIKI */

async function* yield_modules(section) {
    const path = npath.join(WIKI.SERVERPATH, 'modules', section)
    const directories = await fs.readdir(path)
    for (let directory of directories) {
        if (directory !== 'deprecated' && directory !== 'disabled')
            try {
                const yaml_file = npath.join(path, directory, 'definition.yml')
                // Node... if yaml_file.exist
                await fs.stat(yaml_file)
                yield yaml_file
            } catch (_error) {
                // directory without a definition
                // empty
            }
    }
}

/*
 * Load module definitions for a section
 */
export async function load_modules(section) {
    let modules = []
    for await (let yaml_file of yield_modules(section)) {
        // WIKI.logger.info(`Found module definition ${yaml_file}`)
        let data = await fs.readFile(yaml_file, 'utf8')
        const definition = yaml.safeLoad(data)
        // modules.push(definition)
        const _ = {
            ...definition,
            props: commonHelper.parseModuleProps(definition.props)
        }
        modules.push(_)
    }
    return modules
}
