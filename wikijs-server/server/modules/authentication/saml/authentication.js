import lodash from 'lodash'

/* global WIKI */

// ------------------------------------
// SAML Account
// ------------------------------------

import SAMLStrategy from 'passport-saml'

export default {
    init(passport, conf) {
        const samlConfig = {
            callbackUrl: conf.callbackURL,
            entryPoint: conf.entryPoint,
            issuer: conf.issuer,
            cert: (conf.cert || '').split('|'),
            signatureAlgorithm: conf.signatureAlgorithm,
            digestAlgorithm: conf.digestAlgorithm,
            identifierFormat: conf.identifierFormat,
            wantAssertionsSigned: conf.wantAssertionsSigned,
            acceptedClockSkewMs: lodash.toSafeInteger(conf.acceptedClockSkewMs),
            disableRequestedAuthnContext: conf.disableRequestedAuthnContext,
            authnContext: (conf.authnContext || '').split('|'),
            racComparison: conf.racComparison,
            forceAuthn: conf.forceAuthn,
            passive: conf.passive,
            providerName: conf.providerName,
            skipRequestCompression: conf.skipRequestCompression,
            authnRequestBinding: conf.authnRequestBinding,
            passReqToCallback: true
        }
        if (!lodash.isEmpty(conf.audience))
            samlConfig.audience = conf.audience
        if (!lodash.isEmpty(conf.privateKey))
            samlConfig.privateKey = conf.privateKey
        if (!lodash.isEmpty(conf.decryptionPvk))
            samlConfig.decryptionPvk = conf.decryptionPvk
        passport.use(
            conf.key,
            new SAMLStrategy(samlConfig, async (req, profile, cb) => {
                try {
                    const userId = lodash.get(profile, [conf.mappingUID], null) || lodash.get(profile, 'nameID', null)
                    if (!userId)
                        throw new Error('Invalid or Missing Unique ID field!')

                    const user = await WIKI.models.users.processProfile({
                        providerKey: req.params.strategy,
                        profile: {
                            id: userId,
                            email: lodash.get(profile, conf.mappingEmail, ''),
                            displayName: lodash.get(profile, conf.mappingDisplayName, '???'),
                            picture: lodash.get(profile, conf.mappingPicture, '')
                        }
                    })

                    // map users provider groups to wiki groups with the same name, and remove any groups that don't match
                    // Code copied from the LDAP implementation with a slight variation on the field we extract the value from
                    // In SAML v2 groups come in profile.attributes and can be 1 string or an array of strings
                    if (conf.mapGroups) {
                        const maybeArrayOfGroups = lodash.get(profile.attributes, conf.mappingGroups)
                        const groups = (maybeArrayOfGroups && !lodash.isArray(maybeArrayOfGroups))
                            ? [maybeArrayOfGroups]
                            : maybeArrayOfGroups

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
    }
}
