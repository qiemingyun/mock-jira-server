const env = process.env.NODE_ENV

let MYSQL_CONF
let REDIS_CONF

if (env === 'dev') {
  MYSQL_CONF = {
    host: '127.0.0.1',
    user: 'root',
    password: 'Tr.20201126',
    port: '3306',
    database: 'jira',
    multipleStatements: true
  }

  REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
  }
}

if (env === 'prd') {
  MYSQL_CONF = {
    host: '127.0.0.1',
    user: 'root',
    password: 'Tr.20201126',
    port: '3306',
    database: 'jira',
    multipleStatements: true
  }

  REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
  }
}

module.exports = {
  MYSQL_CONF,
  REDIS_CONF
}
