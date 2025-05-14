# Wikijs Boot

Start with `index.js`
1. create global `WIKI`
1. `core/kernel.js:init()`
   1. init db
   1. `bootMaster()`
     call `setup.js` else
     1. `preBootMaster()`
        require and init some server components
     1. call `master.js`
        1. require and init some server components
        1. load middlewares
        1. `express()`
        1. setup public assets
        1. setup Passport authentication
        1. `core/server.js:startGraphQL()`
        1. setup view engine
        1. localization
        1. routing
        1. error handling
        1. `core/server.js:startHTTP()`
     1. `postBootMaster()`
        init some server components
