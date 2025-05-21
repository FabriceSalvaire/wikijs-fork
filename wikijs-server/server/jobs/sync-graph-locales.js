import lodash from 'lodash'
import { createApolloFetch } from 'apollo-fetch'

/* global WIKI */

export default async () => {
    WIKI.logger.info('Syncing locales with Graph endpoint...')

    try {
        const apollo = createApolloFetch({
            uri: WIKI.config.graphEndpoint
        })

        // -> Fetch locales list

        const respList = await apollo({
            query: `{
        localization {
          locales {
            availability
            code
            name
            nativeName
            isRTL
            createdAt
            updatedAt
          }
        }
      }`
        })
        const locales = lodash.sortBy(lodash.get(respList, 'data.localization.locales', []), 'name').map((lc) => ({
            ...lc,
            isInstalled: (lc.code === 'en')
        }))
        WIKI.cache.set('locales', locales)

        // -> Download locale strings

        if (WIKI.config.lang.autoUpdate) {
            const activeLocales = WIKI.config.lang.namespacing ? WIKI.config.lang.namespaces : [WIKI.config.lang.code]
            for (const currentLocale of activeLocales) {
                const localeInfo = lodash.find(locales, ['code', currentLocale])

                const respStrings = await apollo({
                    query: `query ($code: String!) {
            localization {
              strings(code: $code) {
                key
                value
              }
            }
          }`,
                    variables: {
                        code: currentLocale
                    }
                })
                const strings = lodash.get(respStrings, 'data.localization.strings', [])
                let lcObj = {}
                lodash.forEach(strings, (row) => {
                    if (lodash.includes(row.key, '::'))
                        return
                    if (lodash.isEmpty(row.value))
                        row.value = row.key
                    lodash.set(lcObj, row.key.replace(':', '.'), row.value)
                })

                await WIKI.models.locales.query().update({
                    code: currentLocale,
                    strings: lcObj,
                    isRTL: localeInfo.isRTL,
                    name: localeInfo.name,
                    nativeName: localeInfo.nativeName,
                    availability: localeInfo.availability
                }).where('code', currentLocale)

                WIKI.logger.info(
                    `Pulled latest locale updates for ${localeInfo.name} from Graph endpoint: [ COMPLETED ]`
                )
            }
        }

        await WIKI.lang.refreshNamespaces()

        WIKI.logger.info('Syncing locales with Graph endpoint: [ COMPLETED ]')
    } catch (err) {
        WIKI.logger.error('Syncing locales with Graph endpoint: [ FAILED ]')
        WIKI.logger.error(err.message)
    }
}
