# GraphgQL

GraphQL is a data query and manipulation language that allows specifying what data is to be retrieved or modified. 

Facebook started GraphQL development in 2012 and released a draft specification and reference implementation as open source in 2015.

- [GraphQL - Wikipedia](https://en.wikipedia.org/wiki/GraphQL)
- [GraphQL,org](https://graphql.org)
- [Introduction to GraphQL | GraphQL](https://graphql.org/learn/)

**Specifications**
- [GraphQL 2021](https://spec.graphql.org/October2021/)
- [GraphQL Specification Versions](https://spec.graphql.org)
- [graphql/graphql-spec](https://github.com/graphql/graphql-spec)

## Schemas and Types

Comment
```
"""
A character ...
"""
# This line is treated like whitespace and ignored by GraphQL
type Character {
  "The name of the character."
  name: String!
}

```

**Scalar Types**
- Int: A signed 32‐bit integer
- Float: A signed double-precision floating-point value
- String: A UTF‐8 character sequence
- Boolean: true or false
- ID: A unique identifier, often used to refetch an object or as the key for a cache. The ID type is
      serialized in the same way as a **String**; however, defining it as an ID signifies that it is not
      intended to be human‐readable.

**Scalar Values**
```
null
1
1.23
true
false
"a string"
["a", "b"]
```

**Custom Scalar Type**
```
scalar Date
```

**Enum**
```
Enum Colour {
  RED
  BLUE
  GREEN
}
```

**Object Type**
```
type Character {   # is GraphQL Object type
  # fields...
  # ! means non-null type
  name: String!   # is a Scalar type
  appearsIn: [Episode!]!   # is a List type
  
  # Every field on a GraphQL Object type can have zero or more arguments
  length(unit: LengthUnit = METER): Float
}
```

**Interface** types are useful when you want to return an object or set of objects, but those might be
of several different types (see inline fragment).
```
interface Node {
  id: ID!
}
 
interface Character implements Node {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}

type Human implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}
 
type Droid implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  primaryFunction: String
}
```

**Union**
```
union SearchResult = Human | Droid | Starship
```

**Inline Fragment**
```
{
  search(text: "an") {
    __typename   # name of the type
    ... on Human {
      name
      height
    }
    ... on Droid {
      name
      primaryFunction
    }
    ... on Starship {
      name
      length
    }
  }
}
```

**Input Object Types**
```
input ReviewInput {
  stars: Int!
  commentary: String
}
 
type Mutation {
  createReview(episode: Episode, review: ReviewInput!): Review
}
```

```
mutation {
  createReview(
    episode: JEDI, 
    review: {
      stars: 5
      commentary: "This is a great movie!"
    }
  ) {
    stars
    commentary
  }
}
```

**Directives** aka annotation
```
type User {
  fullName: String
  name: String @deprecated(reason: "Use `fullName`.")
}
```
see [built-in directives](https://spec.graphql.org/draft/#sec-Type-System.Directives.Built-in-Directives
- @skip
- @include
- @deprecated
- @specifiedBy

```
directive @deprecated(
  reason: String = "No longer supported"
) on FIELD_DEFINITION | ENUM_VALUE
```


## Queries

```
type Query {
  hero: Character
}
```

```
# shorthand with "query" omitted
{
  hero {
    name
  }
}
>>>
{
  "data": {
    "hero": {
      "name": "R2-D2"
    }
  }
}
```

```
{
  hero {
    name
    friends {
      name
    }
  }
}
>>>
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```

```
type Query {
  human(id: ID!): Human
}
---
{
  human(id: "1000") {
    name
    height
  }
}

{
  human(id: "1000") {
    name
    height(unit: FOOT)
  }
}
```

**Operation type and name**
```
# "query" keyword as the operation type
#   required for mutations and subscriptions
# "HeroNameAndFriends" as the operation name
#   required when sending multiple operations in one document
query HeroNameAndFriends {
  hero {
    name
    friends {
      name
    }
  }
}
```

**Aliases*
```
query {
  empireHero: hero(episode: EMPIRE) {
    name
  }
  jediHero: hero(episode: JEDI) {
    name
  }
}
>>>
{
  "data": {
    "empireHero": {
      "name": "Luke Skywalker"
    },
    "jediHero": {
      "name": "R2-D2"
    }
  }
}
```

**Variables**
- Replace the static value in the query with $variableName
- Declare $variableName as one of the variables accepted by the query
  with a Scalar or Enum or Input Object type
- Pass variableName: value in the separate, transport-specific (usually JSON) variables dictionary
```
# $name: Type
# $name: Type! if optional
# $name: Type = DefaultValue

query HeroNameAndFriends($episode: Episode) {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}
---
{
  "episode": "JEDI"
}
```

**Fragment**
Fragments let you construct sets of fields, and then include them in queries where needed. 
```
query {
  leftComparison: hero(episode: EMPIRE) {
    ...comparisonFields
  }
  rightComparison: hero(episode: JEDI) {
    ...comparisonFields
  }
}

# can use variables
fragment comparisonFields on Character {
  name
  appearsIn
  friends {
    name
  }
}
```

**Inline Fragments**
If we are querying a field that returns an Interface or a Union type, you will need to use inline
fragments to access data on the underlying concrete type.
Named fragments can also be used in the same way, since a named fragment always has a type attached.
```
query HeroForEpisode($ep: Episode!) {
  # returns the type Character, which might be either a Human or a Droid depending on the episode argument
  hero(episode: $ep) {
    name
    #  inline fragment with a type condition
    ... on Droid {
      primaryFunction
    }
    ... on Human {
      height
    }
  }
}
```

**Meta fields**
- `__typename` e.g. determine the type of an union
- `__schema`
- `__type`

**Directives**
It permits to construct dynamic queries.
- `@include(if: Boolean)` Only include this field in the result if the argument is true.
- `@skip(if: Boolean)` Skip this field if the argument is true.
```
query Hero($episode: Episode, $withFriends: Boolean!) {
  hero(episode: $episode) {
    name
    friends @include(if: $withFriends) {
      name
    }
  }
}
```

**Mutations**
```
enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}
 
input ReviewInput {
  stars: Int!
  commentary: String
}

# Create
type Mutation {
  createReview(episode: Episode, review: ReviewInput!): Review
}

# Update aka Patch for REST
type Mutation {
  updateHumanName(id: ID!, name: String!): Human
}

# Delete
type Mutation {
  deleteStarship(id: ID!): ID!
}
```

```
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    # fields to return
    stars
    commentary
  }
}
---
{
  "ep": "JEDI",
  "review": {
    "stars": 5,
    "commentary": "This is a great movie!"
  }
}
>>>
{
  "data": {
    "createReview": {
      "stars": 5,
      "commentary": "This is a great movie!"
    }
  }
}
```

**While query fields are executed in parallel, mutation fields run in series.**
```
mutation { 
  firstShip: deleteStarship(id: "3001")
  secondShip: deleteStarship(id: "3002")
}
```

**Subscriptions**
...

**Execution**

**Response**
```
{
  "errors": [
    {
      "message": "Syntax Error: Unexpected Name \"operation\".",
      "locations": [
        {
          "line": 1,
          "column": 1
        }
      ]
    }
  ]
}
```

---

Schema
```
type Query {
  droid(id: ID!): Droid
}

type Mutation {
}

type Subscription {
}

schema {
  query: MyQueryType
  mutation: MyMutationType
  subscription: MySubscriptionType
}
```

Query
```
type Query {
  droid(id: ID!): Droid
}
```
