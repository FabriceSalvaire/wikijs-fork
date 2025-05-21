# Schema

```
{
"operationName": "IntrospectionQuery",
"variables": {},
"query":"
query IntrospectionQuery {
  __schema {
    queryType {
      name
    }
    mutationType {
      name
    }
    subscriptionType {
      name
    }
    types {
      ...FullType
    }
    directives {
      name
      description
      locations
      args {
        ...InputValue
      }
    }
  }
}

fragment FullType on __Type {
  kind
  name
  description
  fields(includeDeprecated: true) {
    name
    description
    args {
      ...InputValue
    }
    type {
      ...TypeRef
    }
    isDeprecated
    deprecationReason
  }
  inputFields {
    ...InputValue
  }
  interfaces {
    ...TypeRef
  }
  enumValues(includeDeprecated: true) {
    name
    description
    isDeprecated
    deprecationReason
  }
  possibleTypes {
    ...TypeRef
  }
}

fragment InputValue on __InputValue {
  name
  description
  type {
    ...TypeRef
  }
  defaultValue
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
      }
    }
  }
}
"}
```

# Authentication

```
"query":"{
  authentication {
    activeStrategies(enabledOnly: true) {
      key
      strategy {
        key
        logo
        color
        icon
        useForm
        usernameType
      }
      displayName
      order
      selfRegistration
    }
  }
}"
```

```
[{
  "data":{
    "authentication": {
      "activeStrategies": [{
        "key": "local",
        "strategy":{
          "key": "local",
          "logo":  "https://static.requarks.io/logo/wikijs.svg",
          "color": "primary",
          "icon": "<svg>...</svg>",
          "useForm": true,
          "usernameType": "email",
          "__typename": "AuthenticationStrategy"
          },
        "displayName": "Local",
        "order": 0,
        "selfRegistration": false,
        "__typename": "AuthenticationActiveStrategy"
        }],
    "__typename": "AuthenticationQuery"
    }}}]
```

# # Login

```
"variables":{
  "username": "...",
  "password": "...",
  "strategy": "local"
},
"query": "
mutation ($username: String!, $password: String!, $strategy: String!) {
  authentication {
    login(username: $username, password: $password, strategy: $strategy) {
      responseResult {
        succeeded
        errorCode
        slug
        message
      }
      jwt
      mustChangePwd
      mustProvideTFA
      mustSetupTFA
      continuationToken
      redirect
      tfaQRImage
    }
  }
}"
```

```
[{
"data": {
  "authentication": {
    "login": {
      "responseResult": {
        "succeeded": true,
        "errorCode": 0,
        "slug": "ok",
        "message": "Login success",
        "__typename": "ResponseStatus"
        },
    "jwt": "eyJh...qSpw_ptQ",
    "mustChangePwd": null,
    "mustProvideTFA": null,
    "mustSetupTFA": null,
    "continuationToken": null,
    "redirect": "/",
    "tfaQRImage": null,
    "__typename": "AuthenticationLoginResponse"
  },
  "__typename": "AuthenticationMutation"
}}"
```

# API

```
"variables":{"enabled":true},
"query":"
mutation ($enabled: Boolean!) {
  authentication {
    setApiState(enabled: $enabled) {
      responseResult {
        succeeded
        errorCode
        slug
        message
      }
    }
  }
}"
```

```
"variables":{},
"query":"{
  authentication {
    apiState
  }
}"
```

```
"variables":{
  "name": "testapi",
  "expiration": "1y",
  "fullAccess": true,
  "group": null
},
"query":"
mutation ($name: String!, $expiration: String!, $fullAccess: Boolean!, $group: Int) {
  authentication {
    createApiKey(name: $name, expiration: $expiration, fullAccess: $fullAccess, group: $group) {
      key
      responseResult {
        succeeded
        errorCode
        slug
        message
      }
    }
  }
}"
```

```
"query":"
{
  authentication {
    apiKeys {
      id
      name
      keyShort
      expiration
      isRevoked
      createdAt
      updatedAt
    }
  }
}"
```

```
"variables": {
  "providerKey": "local",
  "email": "test@wikijs.org",
  "passwordRaw": "wikijs",
  "name": "test",
  "groups": [],
  "mustChangePassword": false,
  "sendWelcomeEmail": false
},
"query":"
mutation ($providerKey: String!, $email: String!, $name: String!, $passwordRaw: String, $groups: [Int]!, $mustChangePassword: Boolean, $sendWelcomeEmail: Boolean) {
  users {
    create(providerKey: $providerKey, email: $email, name: $name, passwordRaw: $passwordRaw, groups: $groups, mustChangePassword: $mustChangePassword, sendWelcomeEmail: $sendWelcomeEmail) {
      responseResult {
        succeeded
        errorCode
        slug
        message
      }
    }
  }
}"
```
