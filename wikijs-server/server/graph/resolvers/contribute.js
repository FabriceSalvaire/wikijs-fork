import request from 'request-promise'
import lodash from 'lodash'

/* global WIKI */

export default {
    Query: {
        async contribute() {
            return {}
        }
    },
    ContributeQuery: {
        async contributors(obj, args, context, info) {
            try {
                const resp = await request({
                    method: 'POST',
                    uri: 'https://graph.requarks.io',
                    json: true,
                    body: {
                        query:
                            '{\n  sponsors {\n    list(kind: BACKER) {\n      id\n      source\n      name\n      joined\n      website\n      twitter\n      avatar\n    }\n  }\n}\n',
                        variables: {}
                    }
                })
                return lodash.get(resp, 'data.sponsors.list', [])
            } catch (err) {
                WIKI.logger.warn(err)
            }
        }
    }
}
