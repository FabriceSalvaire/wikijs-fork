/* global WIKI */

// ------------------------------------
// Dropbox Account
// ------------------------------------

import DropboxStrategy from 'passport-dropbox-oauth2'
import _ from 'lodash'

export default {
  init (passport, conf) {
    passport.use(conf.key,
      new DropboxStrategy({
        apiVersion: '2',
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
              picture: _.get(profile, '_json.profile_photo_url', '')
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
