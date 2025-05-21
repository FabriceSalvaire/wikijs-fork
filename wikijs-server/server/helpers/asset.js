import * as crypto from 'node:crypto'
import * as path from 'node:path'

export default {
    /**
     * Generate unique hash from page
     */
    generateHash(assetPath) {
        return crypto.createHash('sha1').update(assetPath).digest('hex')
    },

    getPathInfo(assetPath) {
        return path.parse(assetPath.toLowerCase())
    }
}
