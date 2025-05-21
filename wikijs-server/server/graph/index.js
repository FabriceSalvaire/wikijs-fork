import lodash from 'lodash'
import * as fs from 'node:fs'
import fsp from 'node:fs/promises'
import * as path from 'node:path'
import { PubSub } from 'graphql-subscriptions'
import { createRateLimitTypeDef } from 'graphql-rate-limit-directive'
import Transport from 'winston-transport'
import { LEVEL, MESSAGE } from 'triple-beam'

// const gqlTools = require('graphql-tools')
// const { GraphQLUpload } = require('graphql-upload')

/* global WIKI */

WIKI.logger.info(`Loading GraphQL Schema...`)

// Init Subscription PubSub
WIKI.GQLEmitter = new PubSub()

// Schemas
let typeDefs = [createRateLimitTypeDef()]
let schemas = fs.readdirSync(path.join(WIKI.SERVERPATH, 'graph/schemas'))
schemas.forEach((schema) => {
    typeDefs.push(fs.readFileSync(path.join(WIKI.SERVERPATH, `graph/schemas/${schema}`), 'utf8'))
})

// Resolvers
let resolvers = {
    // Upload: GraphQLUpload
}
// WIKI.logger.info('import resolvers')
// const resolverList = await fsp.readdir(path.join(WIKI.SERVERPATH, 'graph/resolvers'))
// for (const resolverFile of resolverList) {
for await (const file of fsp.glob(path.join(WIKI.SERVERPATH, 'graph/resolvers/*.js'))) {
    // WIKI.logger.info(`import resolver ${file}`)
    const resolver = (await import(file)).default
    lodash.merge(resolvers, resolver)
}

// Directives
// WIKI.logger.info('import directives')
let schemaDirectives = {}
// const directiveList = await fsp.readdir(path.join(WIKI.SERVERPATH, 'graph/directives'))
// for (const directiveFile of directiveList) {
for await (const file of fsp.glob(path.join(WIKI.SERVERPATH, 'graph/directives/*.js'))) {
    // WIKI.logger.info(`import directive ${file}`)
    const directive = (await import(file)).default
    const name = path.parse(file).name
    schemaDirectives[name] = directive
}

// Live Trail Logger (admin)
class LiveTrailLogger extends Transport {
    constructor(opts) {
        super(opts)

        this.name = 'liveTrailLogger'
        this.level = 'debug'
    }

    log(info, callback = () => {}) {
        WIKI.GQLEmitter.publish('livetrail', {
            loggingLiveTrail: {
                timestamp: new Date(),
                level: info[LEVEL],
                output: info[MESSAGE]
            }
        })
        callback(null, true)
    }
}

WIKI.logger.add(new LiveTrailLogger({}))

WIKI.logger.info(`GraphQL Schema: [ OK ]`)

export default {
    typeDefs,
    resolvers,
    schemaDirectives
}
