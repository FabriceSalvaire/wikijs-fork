/* global WIKI */

// ------------------------------------
// Auth0 Account
// ------------------------------------

import Auth0Strategy from 'passport-auth0'

export default {
    init(passport, conf) {
        passport.use(
            conf.key,
            new Auth0Strategy({
                domain: conf.domain,
                clientID: conf.clientId,
                clientSecret: conf.clientSecret,
                callbackURL: conf.callbackURL,
                passReqToCallback: true
            }, async (req, accessToken, refreshToken, extraParams, profile, cb) => {
                try {
                    const user = await WIKI.models.users.processProfile({
                        providerKey: req.params.strategy,
                        profile
                    })
                    cb(null, user)
                } catch (err) {
                    cb(err, null)
                }
            })
        )
    },
    logout(conf) {
        return `https://${conf.domain}/v2/logout?${
            new URLSearchParams({ client_id: conf.clientId, returnTo: WIKI.config.host }).toString()
        }`
    }
}
