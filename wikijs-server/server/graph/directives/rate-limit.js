import { createRateLimitDirective } from 'graphql-rate-limit-directive'

export default createRateLimitDirective({
  keyGenerator: (directiveArgs, source, args, context, info) => `${context.req.ip}:${info.parentType}.${info.fieldName}`
})
