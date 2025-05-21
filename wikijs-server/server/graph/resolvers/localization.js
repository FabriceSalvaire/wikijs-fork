import graphHelper from '../../helpers/graph.js'
import lodash from 'lodash'

/* global WIKI */

export default {
    Query: {
        async localization() {
            return {}
        }
    },
    Mutation: {
        async localization() {
            return {}
        }
    },
    LocalizationQuery: {
        async locales(obj, args, context, info) {
            let remoteLocales = await WIKI.cache.get('locales')
            let localLocales = await WIKI.models.locales.query().select(
                'code',
                'isRTL',
                'name',
                'nativeName',
                'createdAt',
                'updatedAt',
                'availability'
            )
            remoteLocales = remoteLocales || localLocales
            return lodash.map(remoteLocales, (rl) => {
                let isInstalled = lodash.some(localLocales, ['code', rl.code])
                return {
                    ...rl,
                    isInstalled,
                    installDate: isInstalled ? lodash.find(localLocales, ['code', rl.code]).updatedAt : null
                }
            })
        },
        async config(obj, args, context, info) {
            return {
                locale: WIKI.config.lang.code,
                autoUpdate: WIKI.config.lang.autoUpdate,
                namespacing: WIKI.config.lang.namespacing,
                namespaces: WIKI.config.lang.namespaces
            }
        },
        translations(obj, args, context, info) {
            return WIKI.lang.getByNamespace(args.locale, args.namespace)
        }
    },
    LocalizationMutation: {
        async downloadLocale(obj, args, context) {
            try {
                const job = await WIKI.scheduler.registerJob({
                    name: 'fetch-graph-locale',
                    immediate: true
                }, args.locale)
                await job.finished
                return {
                    responseResult: graphHelper.generateSuccess('Locale downloaded successfully')
                }
            } catch (err) {
                return graphHelper.generateError(err)
            }
        },
        async updateLocale(obj, args, context) {
            try {
                WIKI.config.lang.code = args.locale
                WIKI.config.lang.autoUpdate = args.autoUpdate
                WIKI.config.lang.namespacing = args.namespacing
                WIKI.config.lang.namespaces = lodash.union(args.namespaces, [args.locale])

                const newLocale = await WIKI.models.locales.query().select('isRTL').where('code', args.locale).first()
                WIKI.config.lang.rtl = newLocale.isRTL

                await WIKI.configSvc.saveToDb(['lang'])

                await WIKI.lang.setCurrentLocale(args.locale)
                await WIKI.lang.refreshNamespaces()

                await WIKI.cache.del('nav:locales')

                return {
                    responseResult: graphHelper.generateSuccess('Locale config updated')
                }
            } catch (err) {
                return graphHelper.generateError(err)
            }
        }
    }
}
