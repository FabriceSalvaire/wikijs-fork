import lodash from 'lodash'

export default {
    generateSuccess(msg) {
        return {
            succeeded: true,
            errorCode: 0,
            slug: 'ok',
            message: lodash.defaultTo(msg, 'Operation succeeded.')
        }
    },
    generateError(err, complete = true) {
        const error = {
            succeeded: false,
            errorCode: lodash.isFinite(err.code) ? err.code : 1,
            slug: err.name,
            message: err.message || 'An unexpected error occured.'
        }
        return complete ? { responseResult: error } : error
    }
}
