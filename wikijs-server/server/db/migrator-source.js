import * as path from 'node:path'
import fsp from 'node:fs/promises'
import semver from 'semver'

const baseMigrationPath = path.join(
    WIKI.SERVERPATH,
    (WIKI.config.db.type !== 'sqlite') ? 'db/migrations' : 'db/migrations-sqlite'
)

/* global WIKI */

export default {
    /**
     * Gets the migration names
     * @returns Promise<string[]>
     */
    async getMigrations() {
        const files = await Array.fromAsync(await fsp.glob(path.join(baseMigrationPath, '*.js')))
        return files
            .map((m) => path.parse(m).name)
            .sort(semver.compare)
            .map((m) => ({
                file: m,
                directory: baseMigrationPath
            }))
    },

    getMigrationName(migration) {
        // Fixme: useless
        return migration.file.indexOf('.js') >= 0 ? migration.file : `${migration.file}.js`
    },

    async getMigration(migration) {
        return await import(path.join(baseMigrationPath, migration.file) + '.js')
    }
}
