/* global WIKI */

// ------------------------------------
// Firebase Account
// ------------------------------------

// INCOMPLETE / TODO

import FirebaseStrategy from 'passport-github2'
import lodash from 'lodash'

export default {
    init(passport, conf) {
        passport.use(
            conf.key,
            new FirebaseStrategy({
                clientID: conf.clientId,
                clientSecret: conf.clientSecret,
                callbackURL: conf.callbackURL,
                scope: ['user:email']
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
