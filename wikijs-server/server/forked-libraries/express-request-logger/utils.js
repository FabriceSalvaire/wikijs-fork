import lodash from 'lodash'

const MASK = 'XXXXX'
const NA = 'N/A'
const VALID_LEVELS = ['trace', 'debug', 'info', 'warn', 'error']
const DEFAULT_LEVEL = 'info'

/**************************************************************************************************/

export var getUrl = function (req) {
    var url = req && req.url || NA
    return url
}

/**************************************************************************************************/

export var getRoute = function (req) {
    var url = NA

    if (req) {
        var route = req.baseUrl
        if (req.route && route)
            url = route + req.route.path
        else if (req.route)
            url = req.route.path
    }

    return url
}

/**************************************************************************************************/

export function cleanOmitKeys(obj, omitKeys) {
    if (obj && !lodash.isEmpty(omitKeys)) {
        Object.keys(obj).forEach(function (key) {
            if (lodash.some(omitKeys, omitKey => key === omitKey))
                delete obj[key]
            else
                (obj[key] && typeof obj[key] === 'object') && cleanOmitKeys(obj[key])
        })
    }
    return obj
}

/**************************************************************************************************/

export var shouldAuditURL = function (excludeURLs, req) {
    return lodash.every(excludeURLs, function (path) {
        var url = getUrl(req)
        var route = getRoute(req)
        return !(url.includes(path) || route.includes(path))
    })
}

/**************************************************************************************************/

export var maskJson = function (jsonObj, fieldsToMask) {
    let jsonObjCopy = lodash.cloneDeepWith(jsonObj, function (value, key) {
        if (lodash.includes(fieldsToMask, key))
            return MASK
    })
    return jsonObjCopy
}

/**************************************************************************************************/

export var getLogLevel = function (statusCode, levelsMap) {
    let level = DEFAULT_LEVEL // Default

    if (levelsMap) {
        let status = statusCode.toString()

        if (levelsMap[status])
            level = VALID_LEVELS.includes(levelsMap[status]) ? levelsMap[status] : level
        else {
            let statusGroup = `${status.substring(0, 1)}xx` // 5xx, 4xx, 2xx, etc..
            level = VALID_LEVELS.includes(levelsMap[statusGroup]) ? levelsMap[statusGroup] : level
        }
    }

    return level
}

/**************************************************************************************************/

export var getBodyStr = function (body, maxBodyLength) {
    if (lodash.isEmpty(body))
        return NA
    else {
        let bodyStr = (typeof body !== 'string') ? JSON.stringify(body) : body
        let shouldShorten = maxBodyLength && maxBodyLength > 0 && bodyStr.length > maxBodyLength
        return shouldShorten ? bodyStr.substr(0, maxBodyLength) + '...' : bodyStr
    }
}
