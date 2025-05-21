import lodash from 'lodash'

/* global WIKI */

// ------------------------------------
// OAuth2 Account
// ------------------------------------

import OAuth2Strategy from 'passport-oauth2'

export default {
    init(passport, conf) {
        var client = new OAuth2Strategy({
            authorizationURL: conf.authorizationURL,
            tokenURL: conf.tokenURL,
            clientID: conf.clientId,
            clientSecret: conf.clientSecret,
            userInfoURL: conf.userInfoURL,
            callbackURL: conf.callbackURL,
            passReqToCallback: true,
            scope: conf.scope,
            state: conf.enableCSRFProtection
        }, async (req, accessToken, refreshToken, profile, cb) => {
            try {
                const user = await WIKI.models.users.processProfile({
                    providerKey: req.params.strategy,
                    profile: {
                        ...profile,
                        id: lodash.get(profile, conf.userIdClaim),
                        displayName: lodash.get(profile, conf.displayNameClaim, '???'),
                        email: lodash.get(profile, conf.emailClaim)
                    }
                })
                if (conf.mapGroups) {
                    const groups = lodash.get(profile, conf.groupsClaim)
                    if (groups && lodash.isArray(groups)) {
                        const currentGroups = (await user.$relatedQuery('groups').select('groups.id')).map((g) => g.id)
                        const expectedGroups = Object.values(WIKI.auth.groups).filter((g) => groups.includes(g.name))
                            .map((g) => g.id)
                        for (const groupId of lodash.difference(expectedGroups, currentGroups))
                            await user.$relatedQuery('groups').relate(groupId)
                        for (const groupId of lodash.difference(currentGroups, expectedGroups))
                            await user.$relatedQuery('groups').unrelate().where('groupId', groupId)
                    }
                }
                cb(null, user)
            } catch (err) {
                cb(err, null)
            }
        })

        client.userProfile = function (accesstoken, done) {
            this._oauth2._useAuthorizationHeaderForGET = !conf.useQueryStringForAccessToken
            this._oauth2.get(conf.userInfoURL, accesstoken, (err, data) => {
                if (err)
                    return done(err)
                try {
                    data = JSON.parse(data)
                } catch (e) {
                    return done(e)
                }
                done(null, data)
            })
        }
        passport.use(conf.key, client)
    },
    logout(conf) {
        if (!conf.logoutURL)
            return '/'
        else
            return conf.logoutURL
    }
}
