import lodash from 'lodash'
import * as os from 'node:os'
import filesize from 'filesize'
import * as path from 'node:path'
import fs from 'fs-extra'
import moment from 'moment'
import request from 'request-promise'

import graphHelper from '../../helpers/graph.js'

// getos actuall implementation requires a promise proxy
import _getOs from 'getos'
import util from 'node:util'
const getOs = util.promisify(_getOs)

// import * as crypto from 'node:crypto'
// import { customAlphabet } from 'nanoid/non-secure'
// const nanoid = customAlphabet('1234567890abcdef', 10)

/* global WIKI */

const dbTypes = {
    mariadb: 'MariaDB',
    mssql: 'MS SQL Server',
    mysql: 'MySQL',
    postgres: 'PostgreSQL',
    sqlite: 'SQLite'
}

export default {
    Query: {
        async system() {
            return {}
        }
    },

    Mutation: {
        async system() {
            return {}
        }
    },

    SystemQuery: {
        flags() {
            return lodash.transform(WIKI.config.flags, (result, value, key) => {
                result.push({ key, value })
            }, [])
        },

        async info() {
            return {}
        },

        async extensions() {
            const exts = Object.values(WIKI.extensions.ext).map((ext) =>
                lodash.pick(ext, ['key', 'title', 'description', 'isInstalled'])
            )
            for (let ext of exts)
                ext.isCompatible = await WIKI.extensions.ext[ext.key].isCompatible()
            return exts
        },

        async exportStatus() {
            return {
                status: WIKI.system.exportStatus.status,
                progress: Math.ceil(WIKI.system.exportStatus.progress),
                message: WIKI.system.exportStatus.message,
                startedAt: WIKI.system.exportStatus.startedAt
            }
        }
    },

    SystemMutation: {
        async updateFlags(obj, args, _context) {
            WIKI.config.flags = lodash.transform(args.flags, (result, row) => {
                lodash.set(result, row.key, row.value)
            }, {})
            await WIKI.configSvc.applyFlags()
            await WIKI.configSvc.saveToDb(['flags'])
            return {
                responseResult: graphHelper.generateSuccess('System Flags applied successfully')
            }
        },

        async resetTelemetryClientId(_obj, _args, _context) {
            try {
                WIKI.telemetry.generateClientId()
                await WIKI.configSvc.saveToDb(['telemetry'])
                return {
                    responseResult: graphHelper.generateSuccess('Telemetry state updated successfully')
                }
            } catch (err) {
                return graphHelper.generateError(err)
            }
        },

        async setTelemetry(obj, args, _context) {
            try {
                lodash.set(WIKI.config, 'telemetry.isEnabled', args.enabled)
                WIKI.telemetry.enabled = args.enabled
                await WIKI.configSvc.saveToDb(['telemetry'])
                return {
                    responseResult: graphHelper.generateSuccess('Telemetry Client ID has been reset successfully')
                }
            } catch (err) {
                return graphHelper.generateError(err)
            }
        },

        async performUpgrade(_obj, _args, _context) {
            try {
                if (process.env.UPGRADE_COMPANION) {
                    await request({
                        method: 'POST',
                        uri: 'http://wiki-update-companion/upgrade',
                        qs: {
                            ...process.env.UPGRADE_COMPANION_REF && { container: process.env.UPGRADE_COMPANION_REF }
                        }
                    })
                    return {
                        responseResult: graphHelper.generateSuccess('Upgrade has started.')
                    }
                } else {
                    throw new Error(
                        'You must run the wiki-update-companion container and pass the UPGRADE_COMPANION env var in order to use this feature.'
                    )
                }
            } catch (err) {
                return graphHelper.generateError(err)
            }
        },

        /**
         * Import Users from a v1 installation
         */
        // async importUsersFromV1(obj, args, _context) {
        //     try {
        //         const MongoClient = (await import('mongodb')).MongoClient
        //         if (args.mongoDbConnString && args.mongoDbConnString.length > 10) {
        //             // -> Connect to DB

        //             const client = await MongoClient.connect(args.mongoDbConnString, {
        //                 appname: `Wiki.js ${WIKI.version} Migration Tool`
        //             })
        //             const dbUsers = client.db().collection('users')
        //             const userCursor = dbUsers.find({ email: { $ne: 'guest' } })

        //             const curDateISO = new Date().toISOString()

        //             let failed = []
        //             let usersCount = 0
        //             let groupsCount = 0
        //             let assignableGroups = []
        //             let reuseGroups = []

        //             // -> Create SINGLE group

        //             if (args.groupMode === `SINGLE`) {
        //                 const singleGroup = await WIKI.models.groups.query().insert({
        //                     name: `Import_${curDateISO}`,
        //                     permissions: WIKI.data.groups.defaultPermissions,
        //                     pageRules: WIKI.data.groups.defaultPageRules
        //                 })
        //                 groupsCount++
        //                 assignableGroups.push(singleGroup.id)
        //             }

        //             // -> Iterate all users

        //             while (await userCursor.hasNext()) {
        //                 const usr = await userCursor.next()

        //                 let usrGroup = []
        //                 if (args.groupMode === `MULTI`) {
        //                     // -> Check if global admin

        //                     if (lodash.some(usr.rights, ['role', 'admin']))
        //                         usrGroup.push(1)
        //                     else {
        //                         // -> Check if identical group already exists

        //                         const currentRights = lodash.sortBy(
        //                             lodash.map(usr.rights, (r) => lodash.pick(r, ['role', 'path', 'exact', 'deny'])),
        //                             ['role', 'path', 'exact', 'deny']
        //                         )
        //                         const ruleSetId = crypto.createHash('sha1').update(JSON.stringify(currentRights))
        //                             .digest('base64')
        //                         const existingGroup = lodash.find(reuseGroups, ['hash', ruleSetId])
        //                         if (existingGroup)
        //                             usrGroup.push(existingGroup.groupId)
        //                         else {
        //                             // -> Build new group

        //                             const pageRules = lodash.map(usr.rights, (r) => {
        //                                 let roles = ['read:pages', 'read:assets', 'read:comments', 'write:comments']
        //                                 if (r.role === `write`) {
        //                                     roles = lodash.concat(roles, [
        //                                         'write:pages',
        //                                         'manage:pages',
        //                                         'read:source',
        //                                         'read:history',
        //                                         'write:assets',
        //                                         'manage:assets'
        //                                     ])
        //                                 }
        //                                 return {
        //                                     id: nanoid(),
        //                                     roles: roles,
        //                                     match: r.exact ? 'EXACT' : 'START',
        //                                     deny: r.deny,
        //                                     path: (r.path.indexOf('/') === 0) ? r.path.substring(1) : r.path,
        //                                     locales: []
        //                                 }
        //                             })

        //                             const perms = lodash.chain(pageRules).reject('deny').map('roles').union().flatten()
        //                                 .value()

        //                             // -> Create new group

        //                             const newGroup = await WIKI.models.groups.query().insert({
        //                                 name: `Import_${curDateISO}_${groupsCount + 1}`,
        //                                 permissions: perms,
        //                                 pageRules: pageRules
        //                             })
        //                             reuseGroups.push({
        //                                 groupId: newGroup.id,
        //                                 hash: ruleSetId
        //                             })
        //                             groupsCount++
        //                             usrGroup.push(newGroup.id)
        //                         }
        //                     }
        //                 }

        //                 // -> Create User

        //                 try {
        //                     await WIKI.models.users.createNewUser({
        //                         providerKey: usr.provider,
        //                         email: usr.email,
        //                         name: usr.name,
        //                         passwordRaw: usr.password,
        //                         groups: (usrGroup.length > 0) ? usrGroup : assignableGroups,
        //                         mustChangePassword: false,
        //                         sendWelcomeEmail: false
        //                     })
        //                     usersCount++
        //                 } catch (err) {
        //                     failed.push({
        //                         provider: usr.provider,
        //                         email: usr.email,
        //                         error: err.message
        //                     })
        //                     WIKI.logger.warn(`${usr.email}: ${err}`)
        //                 }
        //             }

        //             // -> Reload group permissions

        //             if (args.groupMode !== `NONE`) {
        //                 await WIKI.auth.reloadGroups()
        //                 WIKI.events.outbound.emit('reloadGroups')
        //             }

        //             client.close()
        //             return {
        //                 responseResult: graphHelper.generateSuccess('Import completed.'),
        //                 usersCount: usersCount,
        //                 groupsCount: groupsCount,
        //                 failed: failed
        //             }
        //         } else {
        //             throw new Error('MongoDB Connection String is missing or invalid.')
        //         }
        //     } catch (err) {
        //         return graphHelper.generateError(err)
        //     }
        // },

        /**
         * Set HTTPS Redirection State
         */
        // async setHTTPSRedirection(obj, args, _context) {
        //     lodash.set(WIKI.config, 'server.sslRedir', args.enabled)
        //     await WIKI.configSvc.saveToDb(['server'])
        //     return {
        //         responseResult: graphHelper.generateSuccess('HTTP Redirection state set successfully.')
        //     }
        // },

        /**
         * Renew SSL Certificate
         */
        // async renewHTTPSCertificate(_obj, _args, _context) {
        //     try {
        //         if (!WIKI.config.ssl.enabled)
        //             throw new WIKI.Error.SystemSSLDisabled()
        //         else if (WIKI.config.ssl.provider !== `letsencrypt`)
        //             throw new WIKI.Error.SystemSSLRenewInvalidProvider()
        //         else if (!WIKI.servers.le)
        //             throw new WIKI.Error.SystemSSLLEUnavailable()
        //         else {
        //             await WIKI.servers.le.requestCertificate()
        //             await WIKI.servers.restartServer('https')
        //             return {
        //                 responseResult: graphHelper.generateSuccess('SSL Certificate renewed successfully.')
        //             }
        //         }
        //     } catch (err) {
        //         return graphHelper.generateError(err)
        //     }
        // },

        /**
         * Export Wiki to Disk
         */
        async export(obj, args, _context) {
            try {
                const desiredPath = path.resolve(WIKI.ROOTPATH, args.path)
                // -> Check if export process is already running
                if (WIKI.system.exportStatus.status === 'running')
                    throw new Error('Another export is already running.')
                // -> Validate entities
                if (args.entities.length < 1)
                    throw new Error('Must specify at least 1 entity to export.')
                // -> Check target path
                await fs.ensureDir(desiredPath)
                const existingFiles = await fs.readdir(desiredPath)
                if (existingFiles.length)
                    throw new Error('Target directory must be empty!')
                // -> Start export
                WIKI.system.export({
                    entities: args.entities,
                    path: desiredPath
                })
                return {
                    responseResult: graphHelper.generateSuccess('Export started successfully.')
                }
            } catch (err) {
                return graphHelper.generateError(err)
            }
        }
    },

    SystemInfo: {
        configFile() {
            return path.join(process.cwd(), 'config.yml')
        },
        cpuCores() {
            return os.cpus().length
        },
        currentVersion() {
            return WIKI.version
        },
        dbType() {
            return lodash.get(dbTypes, WIKI.config.db.type, 'Unknown DB')
        },

        async dbVersion() {
            let version = 'Unknown Version'
            switch (WIKI.config.db.type) {
                case 'mariadb':
                case 'mysql': {
                    const resultMYSQL = await WIKI.models.knex.raw('SELECT VERSION() as version;')
                    version = lodash.get(resultMYSQL, '[0][0].version', 'Unknown Version')
                    break
                }
                case 'mssql': {
                    const resultMSSQL = await WIKI.models.knex.raw('SELECT @@VERSION as version;')
                    version = lodash.get(resultMSSQL, '[0].version', 'Unknown Version')
                    break
                }
                case 'postgres':
                    version = lodash.get(WIKI.models, 'knex.client.version', 'Unknown Version')
                    break
                case 'sqlite':
                    version = lodash.get(WIKI.models, 'knex.client.driver.VERSION', 'Unknown Version')
                    break
            }
            return version
        },

        dbHost() {
            if (WIKI.config.db.type === 'sqlite')
                return WIKI.config.db.storage
            else
                return WIKI.config.db.host
        },

        hostname() {
            return os.hostname()
        },

        httpPort() {
            return WIKI.servers.servers.http ? lodash.get(WIKI.servers.servers.http.address(), 'port', 0) : 0
        },

        // httpRedirection() {
        //     return lodash.get(WIKI.config, 'server.sslRedir', false)
        // },

        // httpsPort() {
        //     return WIKI.servers.servers.https ? lodash.get(WIKI.servers.servers.https.address(), 'port', 0) : 0
        // },

        latestVersion() {
            return WIKI.system.updates.version
        },

        latestVersionReleaseDate() {
            return moment.utc(WIKI.system.updates.releaseDate)
        },

        nodeVersion() {
            return process.version.substr(1)
        },

        async operatingSystem() {
            if (os.platform() === 'linux') {
                // Note: this code return undefined due to a call to async.each to read files
                //   getos code is outdated
                // return getOs((err, os) => {
                //     if (err)
                //         WIKI.logger.warn(err)
                //     return `${os.os} - ${os.dist} (${os.codename}) ${os.release}`
                // })
                const _ = await getOs()
                // Fixme: .type() ???
                // osLabel = `${os.type()} - ${osInfo.dist} (${osInfo.codename || os.platform()}) ${osInfo.release || os.release()} ${os.arch()}`
                return `${_.os} - ${_.dist} (${_.codename}) ${_.release}`
            } else
                return `${os.type()} (${os.platform()}) ${os.release()} ${os.arch()}`
        },

        async platform() {
            const isDockerized = await fs.pathExists('/.dockerenv')
            if (isDockerized)
                return 'docker'
            return os.platform()
        },

        ramTotal() {
            return filesize(os.totalmem())
        },

        // sslDomain() {
        //     return WIKI.config.ssl.enabled && WIKI.config.ssl.provider === `letsencrypt` ? WIKI.config.ssl.domain : null
        // },

        // sslExpirationDate() {
        //     return WIKI.config.ssl.enabled && WIKI.config.ssl.provider === `letsencrypt`
        //         ? lodash.get(WIKI.config.letsencrypt, 'payload.expires', null)
        //         : null
        // },

        // sslProvider() {
        //     return WIKI.config.ssl.enabled ? WIKI.config.ssl.provider : null
        // },

        // sslStatus() {
        //     return 'OK'
        // },

        // sslSubscriberEmail() {
        //     return WIKI.config.ssl.enabled && WIKI.config.ssl.provider === `letsencrypt`
        //         ? WIKI.config.ssl.subscriberEmail
        //         : null
        // },

        telemetry() {
            return WIKI.telemetry.enabled
        },

        telemetryClientId() {
            return WIKI.config.telemetry.clientId
        },

        async upgradeCapable() {
            return !lodash.isNil(process.env.UPGRADE_COMPANION)
        },

        workingDirectory() {
            return process.cwd()
        },

        async groupsTotal() {
            const total = await WIKI.models.groups.query().count('* as total').first()
            return lodash.toSafeInteger(total.total)
        },

        async pagesTotal() {
            const total = await WIKI.models.pages.query().count('* as total').first()
            return lodash.toSafeInteger(total.total)
        },

        async usersTotal() {
            const total = await WIKI.models.users.query().count('* as total').first()
            return lodash.toSafeInteger(total.total)
        },

        async tagsTotal() {
            const total = await WIKI.models.tags.query().count('* as total').first()
            return lodash.toSafeInteger(total.total)
        }
    }
}
