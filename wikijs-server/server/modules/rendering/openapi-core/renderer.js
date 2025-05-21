import lodash from 'lodash'

export default {
    async render() {
        let output = this.input

        for (let child of this.children) {
            const renderer = (await import(`../${lodash.kebabCase(child.key)}/renderer.js`)).default
            output = await renderer.init(output, child.config)
        }

        return output
    }
}
