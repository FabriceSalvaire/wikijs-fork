# Logging

```
DEBUG=* node server
```

Note: it prints ANSI colours
```
winston:create-logger: Define prototype method for "error"
winston:create-logger: Define prototype method for "warn"
winston:create-logger: Define prototype method for "info"
winston:create-logger: Define prototype method for "http"
winston:create-logger: Define prototype method for "verbose"
winston:create-logger: Define prototype method for "debug"
winston:create-logger: Define prototype method for "silly"
winston:create-logger: Define prototype method for "error"
winston:create-logger: Define prototype method for "warn"
winston:create-logger: Define prototype method for "info"
winston:create-logger: Define prototype method for "http"
winston:create-logger: Define prototype method for "verbose"
winston:create-logger: Define prototype method for "debug"
winston:create-logger: Define prototype method for "silly"

2025-05-03T00:19:24.973Z [MASTER] info: =======================================
2025-05-03T00:19:24.976Z [MASTER] info: = Wiki.js 2.0.0 =======================
2025-05-03T00:19:24.976Z [MASTER] info: =======================================
2025-05-03T00:19:24.976Z [MASTER] info: Initializing...
2025-05-03T00:19:25.525Z [MASTER] info: Using database driver sqlite3 for sqlite [ OK ]
2025-05-03T00:19:25.530Z [MASTER] info: Connecting to database...

knex:client acquired connection from pool: __knexUid1 +0ms
knex:query SELECT 1 + 1; undefined +0ms
knex:bindings [] undefined +0ms
(node:71318) [DEP0174] DeprecationWarning: Calling promisify on a function that returns a Promise is likely a mistake.
(Use `node --trace-deprecation ...` to show where the warning was created)
knex:client releasing connection to pool: __knexUid1 +5ms
2025-05-03T00:19:25.542Z [MASTER] info: Database Connection Successful [ OK ]
knex:client acquired connection from pool: __knexUid1 +2ms
knex:query select * from sqlite_master where type = 'table' and name = ? undefined +6ms
...
```

# Node.js logging

```
console.log("...")
console.warn("...")
console.error("...")
```

To dump an object use `console.log`

# Winston

```
const winston = require("winston");

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "app.log" })
    ]
});

logger.info("...");
logger.error("...");
```
