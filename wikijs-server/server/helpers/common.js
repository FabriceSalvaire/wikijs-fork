import lodash from 'lodash'

export default {
    /**
     * Get default value of type
     *
     * @param {any} type primitive type name
     * @returns Default value
     */
    getTypeDefaultValue(type) {
        switch (type.toLowerCase()) {
            case 'string':
                return ''
            case 'number':
                return 0
            case 'boolean':
                return false
        }
    },
    parseModuleProps(props) {
        return lodash.transform(props, (result, value, key) => {
            let defaultValue = ''
            if (lodash.isPlainObject(value))
                defaultValue = !lodash.isNil(value.default) ? value.default : this.getTypeDefaultValue(value.type)
            else
                defaultValue = this.getTypeDefaultValue(value)
            lodash.set(result, key, {
                default: defaultValue,
                type: (value.type || value).toLowerCase(),
                title: value.title || lodash.startCase(key),
                hint: value.hint || false,
                enum: value.enum || false,
                multiline: value.multiline || false,
                sensitive: value.sensitive || false,
                maxWidth: value.maxWidth || 0,
                order: value.order || 100
            })
            return result
        }, {})
    }
}
