import lodash from 'lodash'

/* global WIKI */

// ------------------------------------
// OpenID Connect Account
// ------------------------------------

import OpenIDConnectStrategy from 'passport-openidconnect'

export default {
    init(passport, conf) {
        passport.use(
            conf.key,
            new OpenIDConnectStrategy({
                authorizationURL: conf.authorizationURL,
                tokenURL: conf.tokenURL,
                clientID: conf.clientId,
                clientSecret: conf.clientSecret,
                issuer: conf.issuer,
                userInfoURL: conf.userInfoURL,
                callbackURL: conf.callbackURL,
                passReqToCallback: true,
                skipUserProfile: conf.skipUserProfile,
                acrValues: conf.acrValues
            }, async (req, iss, uiProfile, idProfile, context, idToken, accessToken, refreshToken, params, cb) => {
                const profile = Object.assign({}, idProfile, uiProfile)

                try {
                    const user = await WIKI.models.users.processProfile({
                        providerKey: req.params.strategy,
                        profile: {
                            ...profile,
                            email: lodash.get(profile, '_json.' + conf.emailClaim),
                            displayName: lodash.get(profile, '_json.' + conf.displayNameClaim, '')
                        }
                    })
                    if (conf.mapGroups) {
                        const groups = lodash.get(profile, '_json.' + conf.groupsClaim)
                        if (groups && lodash.isArray(groups)) {
                            const currentGroups = (await user.$relatedQuery('groups').select('groups.id')).map((g) =>
                                g.id
                            )
                            const expectedGroups = Object.values(WIKI.auth.groups).filter((g) =>
                                groups.includes(g.name)
                            ).map((g) => g.id)
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
        )
    },
    logout(conf) {
        if (!conf.logoutURL)
            return '/'
        else
            return conf.logoutURL
    }
}
