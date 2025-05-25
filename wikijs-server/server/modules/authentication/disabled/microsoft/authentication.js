/* global WIKI */

// ------------------------------------
// Microsoft Account
// ------------------------------------

import WindowsLiveStrategy from 'passport-microsoft'
import lodash from 'lodash'

export default {
    init(passport, conf) {
        passport.use(
            conf.key,
            new WindowsLiveStrategy({
                clientID: conf.clientId,
                clientSecret: conf.clientSecret,
                callbackURL: conf.callbackURL,
                scope: ['User.Read', 'email', 'openid', 'profile'],
                passReqToCallback: true
            }, async (req, accessToken, refreshToken, profile, cb) => {
                try {
                    const user = await WIKI.models.users.processProfile({
                        providerKey: req.params.strategy,
                        profile: {
                            ...profile,
                            picture: lodash.get(profile, 'photos[0].value', '')
                        }
                    })
                    cb(null, user)
                } catch (err) {
                    cb(err, null)
                }
            })
        )
    }
}
