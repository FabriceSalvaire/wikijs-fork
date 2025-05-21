import compression from 'compression'
import * as path from 'node:path'
import lodash from 'lodash'

// import autoload from 'auto-load'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import { ConnectSessionKnexStore as KnexSessionStore } from 'connect-session-knex'
import favicon from 'serve-favicon'
// import audit from 'express-requests-logger'
import audit from './forked-libraries/express-request-logger/index.js'

/* global WIKI */

// imported by core/kernel.js:bootMaster
export default async () => {
    WIKI.logger.info('--- Run master.js...')

    // ----------------------------------------
    // Load core modules
    // ----------------------------------------
    WIKI.auth = (await import('./core/auth.js')).default.init()
    WIKI.lang = (await import('./core/localization.js')).default.init()
    WIKI.mail = (await import('./core/mail.js')).default.init()
    WIKI.system = (await import('./core/system.js')).default.init()

    // ----------------------------------------
    // Load middlewares
    // ----------------------------------------
    // const mw = autoload(path.join(WIKI.SERVERPATH, '/middlewares'))
    // const ctrl = autoload(path.join(WIKI.SERVERPATH, '/controllers'))
    const mw = (await import(path.join(WIKI.SERVERPATH, '/middlewares/index.js'))).default
    const ctrl = (await import(path.join(WIKI.SERVERPATH, '/controllers/index.js'))).default

    // ----------------------------------------
    // Define Express App
    // ----------------------------------------
    const app = express()
    WIKI.app = app
    app.use(compression())

    app.use(audit({
        logger: WIKI.logger,
        request: {
            // excludeHeaders: ['*'],
        },
        reponse: {
            // excludeHeaders: ['*'],
            // excludeBody: ['*'],
            // maxBodyLength: 10,
        }
    }))

    // ----------------------------------------
    // Security
    // ----------------------------------------
    app.use(mw.security)
    app.use(cors({ origin: false }))
    // https://expressjs.com/en/resources/middleware/cors.html
    app.options('*splat', cors({ origin: false }))
    // see https://expressjs.com/en/guide/behind-proxies.html
    if (WIKI.config.security.securityTrustProxy)
        app.enable('trust proxy')

    // ----------------------------------------
    // Public Assets
    // ----------------------------------------
    app.use(favicon(path.join(WIKI.ROOTPATH, 'assets', 'favicon.ico')))
    app.use('/_assets/svg/twemoji', async (req, res, next) => {
        try {
            WIKI.asar.serve('twemoji', req, res, next)
        } catch (err) {
            res.sendStatus(404)
        }
    })
    app.use(
        '/_assets',
        express.static(path.join(WIKI.ROOTPATH, 'assets'), {
            index: false,
            maxAge: '7d'
        })
    )

    // ----------------------------------------
    // SSL Handlers
    // ----------------------------------------
    // Fixme: WIKI.config.ssl.enabled ???
    app.use('/', ctrl.ssl)

    // ----------------------------------------
    // Passport Authentication
    // ----------------------------------------
    app.use(cookieParser())
    app.use(session({
        secret: WIKI.config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: new KnexSessionStore({
            knex: WIKI.models.knex
        })
    }))
    app.use(WIKI.auth.passport.initialize())
    app.use(WIKI.auth.authenticate)

    // ----------------------------------------
    // GraphQL Server
    // ----------------------------------------
    app.use(bodyParser.json({ limit: WIKI.config.bodyParserLimit || '1mb' }))
    await WIKI.servers.startGraphQL()

    // ----------------------------------------
    // SEO
    // ----------------------------------------
    app.use(mw.seo)

    // ----------------------------------------
    // View Engine Setup
    // ----------------------------------------
    app.set('views', path.join(WIKI.SERVERPATH, 'views'))
    app.set('view engine', 'pug')

    app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }))

    // ----------------------------------------
    // Localization
    // ----------------------------------------
    WIKI.lang.attachMiddleware(app)

    // ----------------------------------------
    // View accessible data
    // ----------------------------------------
    app.locals.siteConfig = {}
    app.locals.analyticsCode = {}
    app.locals.basedir = WIKI.ROOTPATH
    app.locals.config = WIKI.config
    app.locals.pageMeta = {
        title: '',
        description: WIKI.config.description,
        image: '',
        url: '/'
    }
    app.locals.devMode = WIKI.devMode

    // ----------------------------------------
    // HMR (Dev Mode Only)
    // ----------------------------------------
    if (global.DEV) {
        app.use(global.WP_DEV.devMiddleware)
        app.use(global.WP_DEV.hotMiddleware)
    }

    // ----------------------------------------
    // Routing
    // ----------------------------------------
    app.use(async (req, res, next) => {
        res.locals.siteConfig = {
            title: WIKI.config.title,
            theme: WIKI.config.theming.theme,
            darkMode: WIKI.config.theming.darkMode,
            tocPosition: WIKI.config.theming.tocPosition || 'left',
            lang: WIKI.config.lang.code,
            rtl: WIKI.config.lang.rtl,
            company: WIKI.config.company,
            contentLicense: WIKI.config.contentLicense,
            footerOverride: WIKI.config.footerOverride,
            logoUrl: WIKI.config.logoUrl
        }
        res.locals.langs = await WIKI.models.locales.getNavLocales({ cache: true })
        res.locals.analyticsCode = await WIKI.models.analytics.getCode({ cache: true })
        next()
    })

    app.use('/', ctrl.auth)
    app.use('/', ctrl.upload)
    app.use('/', ctrl.common)

    // ----------------------------------------
    // Error handling
    // ----------------------------------------

    // Catch 404 and forward to error handler
    app.use((req, res, next) => {
        // https://www.npmjs.com/package/http-errors
        // var createError = require('http-errors');
        // next(createError(404));
        const err = new Error('Not Found')
        err.status = 404
        next(err)
    })

    // Error handler
    app.use((err, req, res, next) => {
        WIKI.logger.error('@master')
        WIKI.logger.error(err)
        if (req.path === '/graphql') {
            res.status(err.status || 500).json({
                data: {},
                errors: [{
                    message: err.message,
                    path: []
                }]
            })
        } else {
            res.status(err.status || 500)
            lodash.set(res.locals, 'pageMeta.title', 'Error')
            res.render('error', {
                message: err.message,
                error: WIKI.IS_DEBUG ? err : {}
            })
        }
    })

    // ----------------------------------------
    // Start HTTP Server(s)
    // ----------------------------------------
    await WIKI.servers.startHTTP()

    if (
        WIKI.config.ssl.enabled === true ||
        WIKI.config.ssl.enabled === 'true' ||
        WIKI.config.ssl.enabled === 1 ||
        WIKI.config.ssl.enabled === '1'
    ) {
        await WIKI.servers.startHTTPS()
    }

    WIKI.logger.info('--- Done master.js...')

    return true
}
