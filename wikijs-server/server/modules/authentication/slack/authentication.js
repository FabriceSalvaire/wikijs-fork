/* global WIKI */

// ------------------------------------
// Slack Account
// ------------------------------------

import SlackStrategy from 'passport-slack-oauth2'
import _ from 'lodash'

export default {
    init(passport, conf) {
        passport.use(
            conf.key,
            new SlackStrategy({
                clientID: conf.clientId,
                clientSecret: conf.clientSecret,
                callbackURL: conf.callbackURL,
                team: conf.team,
                scope: ['identity.basic', 'identity.email', 'identity.avatar'],
                passReqToCallback: true
            }, async (req, accessToken, refreshToken, { user: userProfile }, cb) => {
                try {
                    const user = await WIKI.models.users.processProfile({
                        providerKey: req.params.strategy,
                        profile: {
                            ...userProfile,
                            picture: _.get(userProfile, 'image_48', '')
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
