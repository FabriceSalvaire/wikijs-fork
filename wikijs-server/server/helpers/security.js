import Promise from 'bluebird'
import * as crypto from 'node:crypto'
import passportJWT from 'passport-jwt'

export default {
    sanitizeCommitUser(user) {
        // let wlist = new RegExp('[^a-zA-Z0-9-lodash.\',& ' + appdata.regex.cjk + appdata.regex.arabic + ']', 'g')
        // return {
        //   name: lodash.chain(user.name).replace(wlist, '').trim().value(),
        //   email: appconfig.git.showUserEmail ? user.email : appconfig.git.serverEmail
        // }
    },

    /**
     * Generate a random token
     *
     * @param {any} length
     * @returns
     */
    async generateToken(length) {
        return Promise.fromCallback((clb) => {
            crypto.randomBytes(length, clb)
        }).then((buf) => {
            return buf.toString('hex')
        })
    },

    /**
     * ...
     */
    extractJWT: passportJWT.ExtractJwt.fromExtractors([
        passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
            let token = null
            if (req && req.cookies)
                token = req.cookies['jwt']
            // Force uploads to use Auth headers
            if (req.path.toLowerCase() === '/u')
                return null
            return token
        }
    ])
}
