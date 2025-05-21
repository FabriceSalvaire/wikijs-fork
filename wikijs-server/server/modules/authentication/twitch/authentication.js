/* global WIKI */

// ------------------------------------
// Twitch Account
// ------------------------------------

import TwitchStrategy from 'passport-twitch-strategy'
import _ from 'lodash'

export default {
    init(passport, conf) {
        passport.use(
            conf.key,
            new TwitchStrategy({
                clientID: conf.clientId,
                clientSecret: conf.clientSecret,
                callbackURL: conf.callbackURL,
                passReqToCallback: true
            }, async (req, accessToken, refreshToken, profile, cb) => {
                try {
                    const user = await WIKI.models.users.processProfile({
                        providerKey: req.params.strategy,
                        profile: {
                            ...profile,
                            picture: _.get(profile, 'profile_image_url', '')
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
