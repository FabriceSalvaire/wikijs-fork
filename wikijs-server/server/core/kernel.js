import _ from 'lodash'
import EventEmitter from 'eventemitter2'
import StackTracey from 'stacktracey'

/* global WIKI */

export default {
  async init() {
    WIKI.logger.info('=======================================')
    WIKI.logger.info(`= Wiki.js ${_.padEnd(WIKI.version + ' ', 29, '=')}`)
    WIKI.logger.info('=======================================')
    WIKI.logger.info('Initializing...')

    WIKI.models = await (await import('./db.js')).default.init()

    try {
      await WIKI.models.onReady
      await WIKI.configSvc.loadFromDb()
      await WIKI.configSvc.applyFlags()
    } catch (err) {
      WIKI.logger.error('Database Initialization Error: ' + err.message)
      if (WIKI.IS_DEBUG) {
        WIKI.logger.error(err)
      }
      process.exit(1)
    }

    await this.bootMaster()
  },

  /**
   * Pre-Master Boot Sequence
   */
  async preBootMaster() {
    try {
      await this.initTelemetry()
      WIKI.sideloader = await (await import('./sideloader.js')).default.init()
      WIKI.cache = (await import('./cache.js')).default.init()
      WIKI.scheduler = (await import('./scheduler.js')).default.init()
      WIKI.servers = (await import('./servers.js')).default
      WIKI.events = {
        inbound: new EventEmitter(),
        outbound: new EventEmitter()
      }
      WIKI.extensions = (await import('./extensions.js')).default
      WIKI.asar = (await import('./asar.js')).default
    } catch (err) {
      WIKI.logger.error(err)
      process.exit(1)
    }
  },

  /**
   * Boot Master Process
   */
  async bootMaster() {
    try {
      if (WIKI.config.setup) {
        WIKI.logger.info('Starting setup wizard...')
        await (await import('../setup.js')).default()
      } else {
        await this.preBootMaster()
        await (await import('../master.js')).default()
        await this.postBootMaster()
      }
    } catch (err) {
      WIKI.logger.error(err)
      process.exit(1)
    }
  },

  /**
   * Post-Master Boot Sequence
   */
  async postBootMaster() {
    await WIKI.models.analytics.refreshProvidersFromDisk()
    await WIKI.models.authentication.refreshStrategiesFromDisk()
    await WIKI.models.commentProviders.refreshProvidersFromDisk()
    await WIKI.models.editors.refreshEditorsFromDisk()
    await WIKI.models.loggers.refreshLoggersFromDisk()
    await WIKI.models.renderers.refreshRenderersFromDisk()
    await WIKI.models.searchEngines.refreshSearchEnginesFromDisk()
    await WIKI.models.storage.refreshTargetsFromDisk()

    await WIKI.extensions.init()

    await WIKI.auth.activateStrategies()
    await WIKI.models.commentProviders.initProvider()
    await WIKI.models.searchEngines.initEngine()
    await WIKI.models.storage.initTargets()
    WIKI.scheduler.start()

    await WIKI.models.subscribeToNotifications()
  },

  /**
   * Init Telemetry
   */
  async initTelemetry() {
    (await import('./telemetry.js')).default.init()
    process.on('unhandledRejection', (err) => {
      WIKI.logger.warn(err)
      WIKI.telemetry.sendError(err)
    })
    process.on('uncaughtException', (err) => {
      WIKI.logger.warn(err)
      WIKI.telemetry.sendError(err)
    })
  },

  /**
   * Graceful shutdown
   */
  async shutdown (devMode = false) {
    if (WIKI.servers) {
      await WIKI.servers.stopServers()
    }
    if (WIKI.scheduler) {
      await WIKI.scheduler.stop()
    }
    if (WIKI.models) {
      await WIKI.models.unsubscribeToNotifications()
      if (WIKI.models.knex) {
        await WIKI.models.knex.destroy()
      }
    }
    if (WIKI.asar) {
      await WIKI.asar.unload()
    }
    if (!devMode) {
      process.exit(0)
    }
  }
}
