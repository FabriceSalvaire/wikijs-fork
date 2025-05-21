import _ from 'lodash'
import express from 'express'
const router = express.Router()
import qs from 'querystring'

// See also core/letsencrypt.js

/* global WIKI */

/**
 * Let's Encrypt Challenge
 */
router.get('/.well-known/acme-challenge/:token', (req, res, next) => {
    res.type('text/plain')
    if (_.get(WIKI.config, 'letsencrypt.challenge', false)) {
        if (WIKI.config.letsencrypt.challenge.token === req.params.token) {
            res.send(WIKI.config.letsencrypt.challenge.keyAuthorization)
            WIKI.logger.info(`(LETSENCRYPT) Received valid challenge request. [ ACCEPTED ]`)
        } else {
            res.status(406).send('Invalid Challenge Token!')
            WIKI.logger.warn(`(LETSENCRYPT) Received invalid challenge request. [ REJECTED ]`)
        }
    } else {
        res.status(418).end()
    }
})

/**
 * Redirect to HTTPS if HTTP Redirection is enabled
 */
router.all('/*splat', (req, res, next) => {
    if (WIKI.config.server.sslRedir && !req.secure && WIKI.servers.servers.https)
        return res.redirect(`https://${req.hostname}${req.originalUrl}`)
    else
        next()
})

export { router }
