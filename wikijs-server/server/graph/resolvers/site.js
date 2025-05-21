import graphHelper from '../../helpers/graph.js'
import lodash from 'lodash'

/* global WIKI */

export default {
    Query: {
        async site() {
            return {}
        }
    },

    Mutation: {
        async site() {
            return {}
        }
    },

    SiteQuery: {
        async config(obj, args, context, info) {
            return {
                host: WIKI.config.host,
                title: WIKI.config.title,
                company: WIKI.config.company,
                contentLicense: WIKI.config.contentLicense,
                footerOverride: WIKI.config.footerOverride,
                logoUrl: WIKI.config.logoUrl,
                pageExtensions: WIKI.config.pageExtensions.join(', '),
                ...WIKI.config.seo,
                ...WIKI.config.editShortcuts,
                ...WIKI.config.features,
                ...WIKI.config.security,
                authAutoLogin: WIKI.config.auth.autoLogin,
                authEnforce2FA: WIKI.config.auth.enforce2FA,
                authHideLocal: WIKI.config.auth.hideLocal,
                authLoginBgUrl: WIKI.config.auth.loginBgUrl,
                authJwtAudience: WIKI.config.auth.audience,
                authJwtExpiration: WIKI.config.auth.tokenExpiration,
                authJwtRenewablePeriod: WIKI.config.auth.tokenRenewal,
                uploadMaxFileSize: WIKI.config.uploads.maxFileSize,
                uploadMaxFiles: WIKI.config.uploads.maxFiles,
                uploadScanSVG: WIKI.config.uploads.scanSVG,
                uploadForceDownload: WIKI.config.uploads.forceDownload
            }
        }
    },

    SiteMutation: {
        async updateConfig(obj, args, context) {
            try {
                if (args.hasOwnProperty('host')) {
                    let siteHost = lodash.trim(args.host)
                    if (siteHost.endsWith('/'))
                        siteHost = siteHost.slice(0, -1)
                    WIKI.config.host = siteHost
                }

                if (args.hasOwnProperty('title'))
                    WIKI.config.title = lodash.trim(args.title)

                if (args.hasOwnProperty('company'))
                    WIKI.config.company = lodash.trim(args.company)

                if (args.hasOwnProperty('contentLicense'))
                    WIKI.config.contentLicense = args.contentLicense

                if (args.hasOwnProperty('footerOverride'))
                    WIKI.config.footerOverride = args.footerOverride

                if (args.hasOwnProperty('logoUrl'))
                    WIKI.config.logoUrl = lodash.trim(args.logoUrl)

                if (args.hasOwnProperty('pageExtensions')) {
                    WIKI.config.pageExtensions = lodash.trim(args.pageExtensions).split(',').map((p) =>
                        p.trim().toLowerCase()
                    ).filter((p) => p !== '')
                }

                WIKI.config.seo = {
                    description: lodash.get(args, 'description', WIKI.config.seo.description),
                    robots: lodash.get(args, 'robots', WIKI.config.seo.robots),
                    analyticsService: lodash.get(args, 'analyticsService', WIKI.config.seo.analyticsService),
                    analyticsId: lodash.get(args, 'analyticsId', WIKI.config.seo.analyticsId)
                }

                WIKI.config.auth = {
                    autoLogin: lodash.get(args, 'authAutoLogin', WIKI.config.auth.autoLogin),
                    enforce2FA: lodash.get(args, 'authEnforce2FA', WIKI.config.auth.enforce2FA),
                    hideLocal: lodash.get(args, 'authHideLocal', WIKI.config.auth.hideLocal),
                    loginBgUrl: lodash.get(args, 'authLoginBgUrl', WIKI.config.auth.loginBgUrl),
                    audience: lodash.get(args, 'authJwtAudience', WIKI.config.auth.audience),
                    tokenExpiration: lodash.get(args, 'authJwtExpiration', WIKI.config.auth.tokenExpiration),
                    tokenRenewal: lodash.get(args, 'authJwtRenewablePeriod', WIKI.config.auth.tokenRenewal)
                }

                WIKI.config.editShortcuts = {
                    editFab: lodash.get(args, 'editFab', WIKI.config.editShortcuts.editFab),
                    editMenuBar: lodash.get(args, 'editMenuBar', WIKI.config.editShortcuts.editMenuBar),
                    editMenuBtn: lodash.get(args, 'editMenuBtn', WIKI.config.editShortcuts.editMenuBtn),
                    editMenuExternalBtn: lodash.get(
                        args,
                        'editMenuExternalBtn',
                        WIKI.config.editShortcuts.editMenuExternalBtn
                    ),
                    editMenuExternalName: lodash.get(
                        args,
                        'editMenuExternalName',
                        WIKI.config.editShortcuts.editMenuExternalName
                    ),
                    editMenuExternalIcon: lodash.get(
                        args,
                        'editMenuExternalIcon',
                        WIKI.config.editShortcuts.editMenuExternalIcon
                    ),
                    editMenuExternalUrl: lodash.get(
                        args,
                        'editMenuExternalUrl',
                        WIKI.config.editShortcuts.editMenuExternalUrl
                    )
                }

                WIKI.config.features = {
                    featurePageRatings: lodash.get(args, 'featurePageRatings', WIKI.config.features.featurePageRatings),
                    featurePageComments: lodash.get(args, 'featurePageComments', WIKI.config.features.featurePageComments),
                    featurePersonalWikis: lodash.get(args, 'featurePersonalWikis', WIKI.config.features.featurePersonalWikis)
                }

                WIKI.config.security = {
                    securityOpenRedirect: lodash.get(
                        args,
                        'securityOpenRedirect',
                        WIKI.config.security.securityOpenRedirect
                    ),
                    securityIframe: lodash.get(args, 'securityIframe', WIKI.config.security.securityIframe),
                    securityReferrerPolicy: lodash.get(
                        args,
                        'securityReferrerPolicy',
                        WIKI.config.security.securityReferrerPolicy
                    ),
                    securityTrustProxy: lodash.get(args, 'securityTrustProxy', WIKI.config.security.securityTrustProxy),
                    securitySRI: lodash.get(args, 'securitySRI', WIKI.config.security.securitySRI),
                    securityHSTS: lodash.get(args, 'securityHSTS', WIKI.config.security.securityHSTS),
                    securityHSTSDuration: lodash.get(
                        args,
                        'securityHSTSDuration',
                        WIKI.config.security.securityHSTSDuration
                    ),
                    securityCSP: lodash.get(args, 'securityCSP', WIKI.config.security.securityCSP),
                    securityCSPDirectives: lodash.get(
                        args,
                        'securityCSPDirectives',
                        WIKI.config.security.securityCSPDirectives
                    )
                }

                WIKI.config.uploads = {
                    maxFileSize: lodash.get(args, 'uploadMaxFileSize', WIKI.config.uploads.maxFileSize),
                    maxFiles: lodash.get(args, 'uploadMaxFiles', WIKI.config.uploads.maxFiles),
                    scanSVG: lodash.get(args, 'uploadScanSVG', WIKI.config.uploads.scanSVG),
                    forceDownload: lodash.get(args, 'uploadForceDownload', WIKI.config.uploads.forceDownload)
                }

                await WIKI.configSvc.saveToDb([
                    'host',
                    'title',
                    'company',
                    'contentLicense',
                    'footerOverride',
                    'seo',
                    'logoUrl',
                    'pageExtensions',
                    'auth',
                    'editShortcuts',
                    'features',
                    'security',
                    'uploads'
                ])

                if (WIKI.config.security.securityTrustProxy)
                    WIKI.app.enable('trust proxy')
                else
                    WIKI.app.disable('trust proxy')

                return {
                    responseResult: graphHelper.generateSuccess('Site configuration updated successfully')
                }
            } catch (err) {
                return graphHelper.generateError(err)
            }
        }
    }
}
