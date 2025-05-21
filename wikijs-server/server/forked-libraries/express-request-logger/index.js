/**************************************************************************************************/

// Forked from https://github.com/PayU/express-request-logger
// Licence: Apache-2.0
// Requires:
//   "flat": "^5.0.2",
//   "lodash": "^4.17.21"

/**************************************************************************************************/

import lodash from 'lodash'
import { flatten } from 'flat'

import * as loggerHelper from './logger-helper.js'

/**************************************************************************************************/

var setupOptions

/**************************************************************************************************/

// Express Middleware
var audit = function (req, res, next) {
    // Save original functions
    var oldWrite = res.write
    var oldEnd = res.end
    var oldJson = res.json

    var chunks = []

    // Log start time of request processing
    req.timestamp = new Date()

    // true - log once the request arrives (request details), and log
    //   after response is sent (both request and response). - Useful if
    //   there is a concern that the server will crash during the request
    //   and there is a need to log the request before it's processed.
    // false - log only after the response is sent.
    if (setupOptions.doubleAudit)
        loggerHelper.auditRequest(req, setupOptions)

    // Redefine functions

    // Node API: to send a chunk of the response body
    // https://nodejs.org/api/http.html#http_response_write_chunk_encoding_callback
    // response.write(chunk[, encoding][, callback])
    res.write = function (chunk) {
        chunks.push(Buffer.from(chunk))
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
        // call original res.write(chunk)
        oldWrite.apply(res, arguments)
    }

    // Express API: to send a JSON response
    // https://expressjs.com/en/5x/api.html#res.json
    res.json = function (bodyJson) {
        res._bodyJson = bodyJson
        oldJson.apply(res, arguments)
    }

    // Express API: to end the response process
    // https://expressjs.com/en/5x/api.html#res.end
    res.end = function (chunk) {
        res.timestamp = new Date()

        if (chunk)
            chunks.push(Buffer.from(chunk))
        res._bodyStr = Buffer.concat(chunks).toString('utf8')

        // call to original express#res.end()
        oldEnd.apply(res, arguments)

        loggerHelper.auditResponse(req, res, setupOptions)
    }

    next()
}

/**************************************************************************************************/

export default function (options) {
    // Init settings
    var defaults = {
        logger: null,
        request: {
            audit: true,
            maskBody: [],
            maskQuery: [],
            maskHeaders: [],
            excludeBody: [],
            excludeHeaders: []
        },
        response: {
            audit: true,
            maskBody: [],
            maskHeaders: [],
            excludeBody: [],
            excludeHeaders: []
        },
        doubleAudit: false,
        excludeURLs: [],
        levels: {
            '2xx': 'info',
            '3xx': 'info',
            '4xx': 'info',
            '5xx': 'error'
        },
        shouldSkipAuditFunc: function (_req, _res) {
            return false
        }
    }

    options = options || {}
    lodash.defaultsDeep(options, defaults)
    setupOptions = validateArrayFields(options, defaults)
    setBodyLengthFields(setupOptions)

    return audit // Express Middleware
}

/**************************************************************************************************/

// Convert all options fields that need to be array by default
function validateArrayFields(options, defaults) {
    let defaultsCopy = Object.assign({}, defaults)
    delete defaultsCopy.logger

    Object.keys(flatten(defaultsCopy)).forEach((key) => {
        let optionValue = lodash.get(options, key)
        let defaultValue = lodash.get(defaultsCopy, key)
        if (lodash.isArray(defaultValue) && !lodash.isArray(optionValue)) {
            // throw error - wrong type passed
            let errMsg = `Invalid value specified for field: ${key}, expected array`
            throw new Error(errMsg)
        }
    })

    return options
}

/**************************************************************************************************/

function setBodyLengthFields(options) {
    const isValid = (field) => field && !isNaN(field) && field > 0
    options.request.maxBodyLength = !isValid(options.request.maxBodyLength) ? undefined : options.request.maxBodyLength
    options.response.maxBodyLength = !isValid(options.response.maxBodyLength)
        ? undefined
        : options.response.maxBodyLength
}
